using System.Diagnostics;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SwipeJobs.Application.Common.Configuration;
using SwipeJobs.Application.Modules.Ingestion.Models;

// AiProviderExtractionException, AiProviderErrorClassifier
using SwipeJobs.Application.Modules.Ingestion;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public sealed class GeminiExtractionService : IJobExtractionProvider
{
    private const string Provider = "Gemini";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = JsonNumberHandling.AllowReadingFromString,
    };

    private readonly HttpClient _httpClient;
    private readonly AiOptions _options;
    private readonly AiConfigurationRuntimeInfo _runtimeInfo;
    private readonly ILogger<GeminiExtractionService> _logger;

    public GeminiExtractionService(
        HttpClient httpClient,
        IOptions<AiOptions> options,
        AiConfigurationRuntimeInfo runtimeInfo,
        ILogger<GeminiExtractionService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _runtimeInfo = runtimeInfo;
        _logger = logger;
    }

    public string ProviderName => Provider;

    public async Task<AiExtractionResponse> ExtractJobAsync(string rawMessage, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var model = RequireConfiguredModel();

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            const string message = "AI:ApiKey is not configured.";
            _logger.LogError("{Provider} extraction blocked: {Message}", Provider, message);
            return Failed(model, message, stopwatch.ElapsedMilliseconds);
        }

        if (string.IsNullOrWhiteSpace(rawMessage))
            return Failed(model, "Raw message is empty.", stopwatch.ElapsedMilliseconds);

        AiExtractionResponse? lastResult = null;

        for (var attempt = 1; attempt <= 2; attempt++)
        {
            try
            {
                var (responseText, statusCode, requestBytes) =
                    await CallGeminiAsync(rawMessage, model, cancellationToken);

                var parsed = JobExtractionJsonParser.Parse(responseText);

                stopwatch.Stop();
                _logger.LogInformation(
                    "{Provider} extraction succeeded. Model={Model}, RequestBytes={RequestBytes}, Status={Status}, DurationMs={DurationMs}, ParseTitle={Title}, ParseConfidence={Confidence}",
                    Provider,
                    model,
                    requestBytes,
                    statusCode,
                    stopwatch.ElapsedMilliseconds,
                    parsed.Title ?? "(null)",
                    parsed.Confidence);

                return new AiExtractionResponse(
                    parsed,
                    _options.Provider,
                    model,
                    Provider,
                    true,
                    null,
                    stopwatch.ElapsedMilliseconds,
                    statusCode);
            }
            catch (AiProviderExtractionException ex)
            {
                stopwatch.Stop();
                var friendly = AiProviderErrorClassifier.ToFriendlyMessage(Provider, ex.StatusCode, ex.Message);
                var retryAfter = ex.RetryAfter.HasValue ? (int?)Math.Ceiling(ex.RetryAfter.Value.TotalSeconds) : null;

                _logger.LogWarning(
                    ex,
                    "{Provider} API call failed. Model={Model}, Status={Status}, DurationMs={DurationMs}, RetryAfterSeconds={RetryAfterSeconds}, Body={Body}",
                    Provider,
                    model,
                    ex.StatusCode,
                    stopwatch.ElapsedMilliseconds,
                    retryAfter,
                    AiHttpExtractionHelpers.Truncate(ex.ResponseBody, 2000));

                lastResult = new AiExtractionResponse(
                    null,
                    _options.Provider,
                    model,
                    Provider,
                    false,
                    friendly,
                    stopwatch.ElapsedMilliseconds,
                    ex.StatusCode,
                    ex.IsRateLimited,
                    retryAfter);

                if (ex.IsRateLimited || attempt >= 2)
                    return lastResult;

                stopwatch.Restart();
                _logger.LogInformation("{Provider} extraction retrying. Model={Model}, Attempt={Attempt}", Provider, model, attempt + 1);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, "{Provider} extraction failed. Model={Model}, DurationMs={DurationMs}, Attempt={Attempt}", Provider, model, stopwatch.ElapsedMilliseconds, attempt);

                lastResult = Failed(model, AiProviderErrorClassifier.ToFriendlyMessage(Provider, null, ex.Message), stopwatch.ElapsedMilliseconds);
                if (attempt >= 2)
                    return lastResult;

                stopwatch.Restart();
            }
        }

        return lastResult ?? Failed(model, "Gemini extraction failed.", stopwatch.ElapsedMilliseconds);
    }

    public async Task<JobPreviewGenerationResponse> GenerateJobPreviewAsync(
        JobExtractionResult extraction,
        string? channelHint,
        int extractionConfidence,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var model = RequireConfiguredModel();

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            const string message = "AI:ApiKey is not configured.";
            _logger.LogError("{Provider} preview blocked: {Message}", Provider, message);
            return PreviewFailed(message, stopwatch.ElapsedMilliseconds);
        }

        var userMessage = JobPreviewRequestBuilder.BuildUserMessage(extraction, channelHint, extractionConfidence);
        JobPreviewGenerationResponse? lastResult = null;

        for (var attempt = 1; attempt <= 2; attempt++)
        {
            try
            {
                var (responseText, statusCode, _) =
                    await CallGeminiPreviewAsync(userMessage, model, cancellationToken);

                var parsed = JobPreviewJsonParser.Parse(responseText);
                stopwatch.Stop();

                _logger.LogInformation(
                    "{Provider} preview succeeded. Model={Model}, Status={Status}, DurationMs={DurationMs}, Title={Title}",
                    Provider,
                    model,
                    statusCode,
                    stopwatch.ElapsedMilliseconds,
                    parsed.DisplayTitle);

                return new JobPreviewGenerationResponse(
                    parsed,
                    true,
                    null,
                    stopwatch.ElapsedMilliseconds,
                    statusCode);
            }
            catch (AiProviderExtractionException ex)
            {
                stopwatch.Stop();
                var friendly = AiProviderErrorClassifier.ToFriendlyMessage(Provider, ex.StatusCode, ex.Message);

                _logger.LogWarning(
                    ex,
                    "{Provider} preview API call failed. Model={Model}, Status={Status}, DurationMs={DurationMs}",
                    Provider,
                    model,
                    ex.StatusCode,
                    stopwatch.ElapsedMilliseconds);

                lastResult = PreviewFailed(friendly, stopwatch.ElapsedMilliseconds, ex.StatusCode);
                if (ex.IsRateLimited || attempt >= 2)
                    return lastResult;

                stopwatch.Restart();
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogWarning(ex, "{Provider} preview failed. Model={Model}, Attempt={Attempt}", Provider, model, attempt);

                lastResult = PreviewFailed(
                    AiProviderErrorClassifier.ToFriendlyMessage(Provider, null, ex.Message),
                    stopwatch.ElapsedMilliseconds);

                if (attempt >= 2)
                    return lastResult;

                stopwatch.Restart();
            }
        }

        return lastResult ?? PreviewFailed("Gemini preview failed.", stopwatch.ElapsedMilliseconds);
    }

    private string RequireConfiguredModel()
    {
        var model = _options.Model?.Trim();
        if (string.IsNullOrWhiteSpace(model))
        {
            throw new InvalidOperationException(
                "AI:Model is not configured. Set AI__Model in environment or AI:Model in appsettings.");
        }

        return model;
    }

    private async Task<(string Text, int StatusCode, int RequestBytes)> CallGeminiAsync(
        string rawMessage,
        string model,
        CancellationToken cancellationToken)
    {
        var url = $"v1beta/models/{Uri.EscapeDataString(model)}:generateContent";

        _logger.LogInformation(
            "{Provider} request preparing. Model={Model}, Endpoint={Endpoint}, ConfigSource={ConfigSource}",
            Provider,
            model,
            url,
            _runtimeInfo.ModelSource);

        var request = new GeminiGenerateContentRequest
        {
            SystemInstruction = new GeminiContent
            {
                Parts = [new GeminiPart { Text = JobExtractionPrompt.SystemPrompt }],
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

        var requestJson = JsonSerializer.Serialize(request, JsonOptions);
        var requestBytes = Encoding.UTF8.GetByteCount(requestJson);

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Headers.Add("x-goog-api-key", _options.ApiKey);
        httpRequest.Content = JsonContent.Create(request);

        _logger.LogInformation(
            "{Provider} request sending. Model={Model}, RequestBytes={RequestBytes}, Url={Url}",
            Provider,
            model,
            requestBytes,
            url);

        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        var statusCode = (int)response.StatusCode;
        var retryAfter = AiHttpExtractionHelpers.ParseRetryAfterSeconds(response);

        _logger.LogInformation(
            "{Provider} response received. Model={Model}, Status={Status}, ResponseBytes={ResponseBytes}, Body={Body}",
            Provider,
            model,
            statusCode,
            Encoding.UTF8.GetByteCount(body),
            AiHttpExtractionHelpers.Truncate(body, 2000));

        if (!response.IsSuccessStatusCode)
        {
            var apiMessage = AiHttpExtractionHelpers.TryParseJsonErrorMessage(body) ?? $"HTTP {statusCode}";
            throw new AiProviderExtractionException(
                Provider,
                statusCode,
                AiProviderErrorClassifier.ToLogMessage(Provider, statusCode, apiMessage),
                body,
                requestBytes,
                retryAfter.HasValue ? TimeSpan.FromSeconds(retryAfter.Value) : null);
        }

        var geminiResponse = JsonSerializer.Deserialize<GeminiGenerateContentResponse>(body, JsonOptions)
            ?? throw new InvalidOperationException("Gemini returned an empty response envelope.");

        var text = geminiResponse.Candidates?
            .FirstOrDefault()?
            .Content?
            .Parts?
            .FirstOrDefault(p => !string.IsNullOrWhiteSpace(p.Text))?
            .Text;

        if (string.IsNullOrWhiteSpace(text))
        {
            _logger.LogWarning(
                "{Provider} returned success but no text. Model={Model}, Body={Body}",
                Provider,
                model,
                AiHttpExtractionHelpers.Truncate(body, 1000));
            throw new InvalidOperationException("Gemini returned no text content.");
        }

        return (text, statusCode, requestBytes);
    }

    private async Task<(string Text, int StatusCode, int RequestBytes)> CallGeminiPreviewAsync(
        string userMessage,
        string model,
        CancellationToken cancellationToken)
    {
        var url = $"v1beta/models/{Uri.EscapeDataString(model)}:generateContent";

        var request = new GeminiGenerateContentRequest
        {
            SystemInstruction = new GeminiContent
            {
                Parts = [new GeminiPart { Text = JobPreviewPrompt.SystemPrompt }],
            },
            Contents =
            [
                new GeminiContent
                {
                    Role = "user",
                    Parts = [new GeminiPart { Text = userMessage }],
                },
            ],
            GenerationConfig = new GeminiGenerationConfig
            {
                Temperature = 0.2,
                ResponseMimeType = "application/json",
            },
        };

        var requestJson = JsonSerializer.Serialize(request, JsonOptions);
        var requestBytes = Encoding.UTF8.GetByteCount(requestJson);

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Headers.TryAddWithoutValidation("x-goog-api-key", _options.ApiKey);
        httpRequest.Content = JsonContent.Create(request);

        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        var statusCode = (int)response.StatusCode;

        if (!response.IsSuccessStatusCode)
        {
            var apiMessage = AiHttpExtractionHelpers.TryParseJsonErrorMessage(body) ?? $"HTTP {statusCode}";
            throw new AiProviderExtractionException(
                Provider,
                statusCode,
                AiProviderErrorClassifier.ToLogMessage(Provider, statusCode, apiMessage),
                body,
                requestBytes,
                null);
        }

        var geminiResponse = JsonSerializer.Deserialize<GeminiGenerateContentResponse>(body, JsonOptions)
            ?? throw new InvalidOperationException("Gemini returned an empty response envelope.");

        var text = geminiResponse.Candidates?
            .FirstOrDefault()?
            .Content?
            .Parts?
            .FirstOrDefault()?
            .Text;

        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Gemini returned no text content.");

        return (text, statusCode, requestBytes);
    }

    private AiExtractionResponse Failed(string model, string error, long elapsedMs) =>
        new(null, _options.Provider, model, Provider, false, error, elapsedMs);

    private static JobPreviewGenerationResponse PreviewFailed(string error, long elapsedMs, int? statusCode = null) =>
        new(null, false, error, elapsedMs, statusCode);

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
}
