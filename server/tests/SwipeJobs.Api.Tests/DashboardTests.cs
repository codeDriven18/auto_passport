using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;
using SwipeJobs.Infrastructure.Persistence;
using Xunit;

namespace SwipeJobs.Api.Tests;

public class DashboardTests : IClassFixture<SwipeJobsWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly SwipeJobsWebApplicationFactory _factory;

    public DashboardTests(SwipeJobsWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task JobSeeker_GetDashboard_ReturnsOk()
    {
        await SeedSeekerAsync();
        var token = await LoginAsync("dashboard-seeker@test.local", "Password123!");
        var response = await GetDashboardAsync(token);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task JobSeeker_WithoutProfileClaim_StillReturnsOk()
    {
        await SeedSeekerWithoutProfileAsync();
        var token = await LoginAsync("dashboard-noprofile@test.local", "Password123!");
        var response = await GetDashboardAsync(token);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CompanyUser_GetDashboard_ReturnsOk()
    {
        await SeedCompanyAsync();
        var token = await LoginAsync("dashboard-company@test.local", "Password123!");
        var response = await GetDashboardAsync(token);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task<HttpResponseMessage> GetDashboardAsync(string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/dashboard/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await _client.SendAsync(request);
    }

    private async Task SeedSeekerAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync(u => u.Email == "dashboard-seeker@test.local")) return;

        var seeker = new User
        {
            Email = "dashboard-seeker@test.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.JobSeeker,
        };
        db.Users.Add(seeker);
        await db.SaveChangesAsync();
        db.UserProfiles.Add(new UserProfile
        {
            UserId = seeker.Id,
            Email = seeker.Email,
            FirstName = "Dash",
            LastName = "Seeker",
        });
        await db.SaveChangesAsync();
    }

    private async Task SeedSeekerWithoutProfileAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync(u => u.Email == "dashboard-noprofile@test.local")) return;

        db.Users.Add(new User
        {
            Email = "dashboard-noprofile@test.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.JobSeeker,
        });
        await db.SaveChangesAsync();
    }

    private async Task SeedCompanyAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync(u => u.Email == "dashboard-company@test.local")) return;

        var companyEntity = new Company
        {
            Name = "Dashboard Co",
            Slug = "dashboard-co",
            Description = "Test",
            Industry = "Tech",
            Location = "Berlin",
            CompanySize = "1-10",
            Status = CompanyStatus.Approved,
            IsActive = true,
        };
        db.Companies.Add(companyEntity);
        await db.SaveChangesAsync();

        var companyUser = new User
        {
            Email = "dashboard-company@test.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.Company,
        };
        db.Users.Add(companyUser);
        await db.SaveChangesAsync();

        db.CompanyMembers.Add(new CompanyMember
        {
            UserId = companyUser.Id,
            CompanyId = companyEntity.Id,
        });
        await db.SaveChangesAsync();
    }

    private async Task<string> LoginAsync(string email, string password)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginDto(email, password));
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("accessToken").GetString()
            ?? throw new InvalidOperationException("Missing access token.");
    }
}
