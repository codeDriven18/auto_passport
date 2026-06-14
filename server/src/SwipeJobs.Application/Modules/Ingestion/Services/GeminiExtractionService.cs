using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SwipeJobs.Application.Common.Configuration;
using SwipeJobs.Application.Modules.Ingestion.Interfaces;
using SwipeJobs.Application.Modules.Ingestion.Models;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public class GeminiExtractionService : IAiExtractionService
{
    private const string ExtractionSource = "Gemini";
    private const string SystemPrompt = """
        You are a recruitment data extraction engine.
        Your task is to extract job information from Telegram posts.
        Return valid JSON only.
        Do not explain.
        Do not generate markdown.
        Do not generate text outside JSON.
        If information is missing, return null.
        Never hallucinate.

        Extract: title, company, salaryMin, salaryMax, currency, location, remote, employmentType, experienceLevel, skills, description, applyMethod, applyUrl, email, phone, telegramContact, confidence.

        Expected JSON shape:
        {
          "title": "",
          "company": "",
          "salaryMin": null,
          "salaryMax": null,
          "currency": null,
          "location": null,
          "remote": false,
          "employmentType": null,
          "experienceLevel": null,
          "skills": [],
          "description": "",
          "applyMethod": null,
          "applyUrl": null,
          "email": null,
          "phone": null,
          "telegramContact": null,
          "confidence": 0
        }

        confidence must be an integer from 0 to 100 reflecting extraction quality.
        """;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = JsonNumberHandling.AllowReadingFromString,
    };

    private static readonly Regex MarkdownFenceRegex = new(
        @"^```(?:json)?\s*([\s\S]*?)\s*```$",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);

    private readonly HttpClient _httpClient;
    private readonly AiOptions _options;
    private readonly ILogger<GeminiExtractionService> _logger;

    public GeminiExtractionService(
        HttpClient httpClient,
        IOptions<AiOptions> options,
        ILogger<GeminiExtractionService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<AiExtractionResponse> ExtractJobAsync(string rawMessage, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var model = string.IsNullOrWhiteSpace(_options.Model) ? "gemini-2.5-flash" : _options.Model.Trim();

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("Gemini extraction skipped: AI:ApiKey is not configured.");
            return Failed(model, "AI:ApiKey is not configured.", stopwatch.ElapsedMilliseconds);
        }

        if (string.IsNullOrWhiteSpace(rawMessage))
        {
            return Failed(model, "Raw message is empty.", stopwatch.ElapsedMilliseconds);
        }

        Exception? lastError = null;
        for (var attempt = 1; attempt <= 2; attempt++)
        {
            try
            {
                var responseText = await CallGeminiAsync(rawMessage, model, cancellationToken);
                var parsed = ParseCandidateJson(responseText);

                _logger.LogInformation(
                    "Gemini extraction succeeded on attempt {Attempt}. Confidence={Confidence}, Title={Title}",
                    attempt,
                    parsed.Confidence,
                    parsed.Title ?? "(null)");

                stopwatch.Stop();
                return new AiExtractionResponse(
                    parsed,
                    _options.Provider,
                    model,
                    ExtractionSource,
                    true,
                    null,
                    stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex) when (attempt < 2)
            {
                lastError = ex;
                _logger.LogWarning(ex, "Gemini extraction attempt {Attempt} failed; retrying once.", attempt);
            }
            catch (Exception ex)
            {
                lastError = ex;
                _logger.LogError(ex, "Gemini extraction failed after retry.");
            }
        }

        stopwatch.Stop();
        return Failed(model, lastError?.Message ?? "Extraction failed.", stopwatch.ElapsedMilliseconds);
    }

    private async Task<string> CallGeminiAsync(string rawMessage, string model, CancellationToken cancellationToken)
    {
        var url = $"v1beta/models/{Uri.EscapeDataString(model)}:generateContent";
        var request = new GeminiGenerateContentRequest
        {
            SystemInstruction = new GeminiContent
            {
                Parts = [new GeminiPart { Text = SystemPrompt }],
            },
            Contents =
            [
                new GeminiContent
                {
                    Role = "user",
                    Parts = [new GeminiPart { Text = rawMessage }],
                },
            ],
            GenerationConfig = new GeminiGenerationConfig
            {
                Temperature = 0.1,
                ResponseMimeType = "application/json",
            },
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Headers.Add("x-goog-api-key", _options.ApiKey);
        httpRequest.Content = JsonContent.Create(request);

        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Gemini API returned {StatusCode}: {Body}",
                (int)response.StatusCode,
                Truncate(body, 500));
            throw new InvalidOperationException($"Gemini API error {(int)response.StatusCode}.");
        }

        var geminiResponse = JsonSerializer.Deserialize<GeminiGenerateContentResponse>(body, JsonOptions)
            ?? throw new InvalidOperationException("Gemini returned an empty response.");

        var text = geminiResponse.Candidates?
            .FirstOrDefault()?
            .Content?
            .Parts?
            .FirstOrDefault(p => !string.IsNullOrWhiteSpace(p.Text))?
            .Text;

        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Gemini returned no text content.");

        _logger.LogDebug("Gemini raw response: {Response}", Truncate(text, 1000));
        return text;
    }

    private static ParsedJobCandidate ParseCandidateJson(string responseText)
    {
        var json = NormalizeJsonPayload(responseText);
        var dto = JsonSerializer.Deserialize<GeminiCandidateDto>(json, JsonOptions)
            ?? throw new JsonException("Gemini JSON deserialized to null.");

        return new ParsedJobCandidate(
            NullIfBlank(dto.Title),
            NullIfBlank(dto.Company),
            dto.SalaryMin,
            dto.SalaryMax,
            NullIfBlank(dto.Currency),
            NullIfBlank(dto.Location),
            dto.Remote,
            NullIfBlank(dto.EmploymentType),
            NullIfBlank(dto.ExperienceLevel),
            dto.Skills?.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList()
                ?? [],
            NullIfBlank(dto.Description),
            NullIfBlank(dto.ApplyMethod),
            NullIfBlank(dto.ApplyUrl),
            NullIfBlank(dto.Email),
            NullIfBlank(dto.Phone),
            NullIfBlank(dto.TelegramContact),
            Math.Clamp(dto.Confidence ?? 0, 0, 100));
    }

    private static string NormalizeJsonPayload(string text)
    {
        var trimmed = text.Trim();
        var fenceMatch = MarkdownFenceRegex.Match(trimmed);
        if (fenceMatch.Success)
            trimmed = fenceMatch.Groups[1].Value.Trim();

        using var document = JsonDocument.Parse(trimmed);
        return trimmed;
    }

    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength] + "...";

    private AiExtractionResponse Failed(string model, string error, long elapsedMs) =>
        new(null, _options.Provider, model, ExtractionSource, false, error, elapsedMs);

    private sealed class GeminiGenerateContentRequest
    {
        [JsonPropertyName("systemInstruction")]
        public GeminiContent? SystemInstruction { get; set; }

        [JsonPropertyName("contents")]
        public List<GeminiContent> Contents { get; set; } = [];

        [JsonPropertyName("generationConfig")]
        public GeminiGenerationConfig? GenerationConfig { get; set; }
    }

    private sealed class GeminiGenerationConfig
    {
        [JsonPropertyName("temperature")]
        public double Temperature { get; set; }

        [JsonPropertyName("responseMimeType")]
        public string? ResponseMimeType { get; set; }
    }

    private sealed class GeminiContent
    {
        [JsonPropertyName("role")]
        public string? Role { get; set; }

        [JsonPropertyName("parts")]
        public List<GeminiPart> Parts { get; set; } = [];
    }

    private sealed class GeminiPart
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }

    private sealed class GeminiGenerateContentResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiCandidate>? Candidates { get; set; }
    }

    private sealed class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContent? Content { get; set; }
    }

    private sealed class GeminiCandidateDto
    {
        public string? Title { get; set; }
        public string? Company { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string? Currency { get; set; }
        public string? Location { get; set; }
        public bool? Remote { get; set; }
        public string? EmploymentType { get; set; }
        public string? ExperienceLevel { get; set; }
        public List<string>? Skills { get; set; }
        public string? Description { get; set; }
        public string? ApplyMethod { get; set; }
        public string? ApplyUrl { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? TelegramContact { get; set; }
        public int? Confidence { get; set; }
    }
}
