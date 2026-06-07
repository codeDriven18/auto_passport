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

public class AuthorizationTests : IClassFixture<SwipeJobsWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly SwipeJobsWebApplicationFactory _factory;

    public AuthorizationTests(SwipeJobsWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Admin_CanAccessAdminStats()
    {
        await SeedUsersAsync();
        var token = await LoginAsync("admin@swipejobs.local", "Admin123!");
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/admin/stats");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task JobSeeker_CannotAccessAdminStats()
    {
        await SeedUsersAsync();
        var token = await LoginAsync("seeker@test.local", "Password123!");
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/admin/stats");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task JobSeeker_CannotAccessPortal()
    {
        await SeedUsersAsync();
        var token = await LoginAsync("seeker@test.local", "Password123!");
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/portal/stats");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CompanyUser_CanAccessOwnPortal()
    {
        await SeedUsersAsync();
        var token = await LoginAsync("company@test.local", "Password123!");
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/portal/stats");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CompanyUser_CannotUpdateOtherCompanyJob()
    {
        await SeedUsersAsync();
        var otherJobId = await SeedOtherCompanyJobAsync();
        var token = await LoginAsync("company@test.local", "Password123!");

        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/portal/jobs/{otherJobId}")
        {
            Content = JsonContent.Create(new
            {
                title = "Hacked",
                description = "Should fail",
                location = "Remote",
                city = "Berlin",
                category = JobCategory.It,
                level = JobLevel.Junior,
                isRemote = true,
                isActive = true,
            }),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PendingCompany_CannotPublishJob()
    {
        await SeedUsersAsync(includePendingCompany: true);
        var token = await LoginAsync("pending@test.local", "Password123!");

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/portal/jobs")
        {
            Content = JsonContent.Create(new
            {
                title = "Blocked Job",
                description = "Should not publish",
                location = "Remote",
                city = "Berlin",
                category = JobCategory.It,
                level = JobLevel.Junior,
                isRemote = true,
            }),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task SeedUsersAsync(bool includePendingCompany = false)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (!await db.Users.AnyAsync(u => u.Email == "admin@swipejobs.local"))
        {
            db.Users.Add(new User
            {
                Email = "admin@swipejobs.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin,
            });
        }

        if (!await db.Users.AnyAsync(u => u.Email == "seeker@test.local"))
        {
            var seeker = new User
            {
                Email = "seeker@test.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = UserRole.JobSeeker,
            };
            db.Users.Add(seeker);
            await db.SaveChangesAsync();
            db.UserProfiles.Add(new UserProfile
            {
                UserId = seeker.Id,
                Email = seeker.Email,
                FirstName = "Test",
                LastName = "Seeker",
            });
        }

        if (!await db.Users.AnyAsync(u => u.Email == "company@test.local"))
        {
            var companyEntity = new Company
            {
                Name = "Test Co",
                Slug = "test-co",
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
                Email = "company@test.local",
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
        }

        if (includePendingCompany && !await db.Users.AnyAsync(u => u.Email == "pending@test.local"))
        {
            var pendingCompany = new Company
            {
                Name = "Pending Co",
                Slug = "pending-co",
                Description = "Pending",
                Industry = "Tech",
                Location = "Berlin",
                CompanySize = "1-10",
                Status = CompanyStatus.Pending,
                IsActive = false,
            };
            db.Companies.Add(pendingCompany);
            await db.SaveChangesAsync();

            var pendingUser = new User
            {
                Email = "pending@test.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = UserRole.Company,
            };
            db.Users.Add(pendingUser);
            await db.SaveChangesAsync();

            db.CompanyMembers.Add(new CompanyMember
            {
                UserId = pendingUser.Id,
                CompanyId = pendingCompany.Id,
            });
        }

        if (!await db.Sources.AnyAsync())
        {
            db.Sources.Add(new Source
            {
                Name = "Manual",
                Type = SourceType.Manual,
                IsActive = true,
            });
        }

        await db.SaveChangesAsync();
    }

    private async Task<Guid> SeedOtherCompanyJobAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var otherCompany = await db.Companies.FirstOrDefaultAsync(c => c.Slug == "other-co");
        if (otherCompany is null)
        {
            otherCompany = new Company
            {
                Name = "Other Co",
                Slug = "other-co",
                Description = "Other",
                Industry = "Tech",
                Location = "Munich",
                CompanySize = "1-10",
                Status = CompanyStatus.Approved,
                IsActive = true,
            };
            db.Companies.Add(otherCompany);
            await db.SaveChangesAsync();
        }

        var source = await db.Sources.FirstAsync();
        var job = new Job
        {
            Title = "Other Job",
            Description = "Belongs to other company",
            CompanyId = otherCompany.Id,
            SourceId = source.Id,
            Category = JobCategory.It,
            Level = JobLevel.Junior,
            IsActive = true,
        };
        db.Jobs.Add(job);
        await db.SaveChangesAsync();
        return job.Id;
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
