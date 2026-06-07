using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Infrastructure.Persistence.Seeding;

internal sealed record GigSeed(
    string Title,
    string Description,
    string CompanySlug,
    string City,
    decimal SalaryMin,
    decimal SalaryMax,
    bool IsRemote,
    params string[] TagSlugs);

internal sealed record ItJobSeed(
    string Title,
    string Description,
    string CompanySlug,
    string City,
    JobLevel Level,
    bool IsRemote,
    decimal SalaryMin,
    decimal SalaryMax,
    params string[] TagSlugs);

internal static class JobSeedCatalog
{
    public const int TargetGigCount = 50;
    public const int TargetItCount = 50;

    public static IReadOnlyList<(string Name, string Slug)> Tags { get; } =
    [
        ("Events", "events"),
        ("Cleaning", "cleaning"),
        ("Delivery", "delivery"),
        ("Warehouse", "warehouse"),
        ("Moving", "moving"),
        ("Hospitality", "hospitality"),
        ("Retail", "retail"),
        ("Student Friendly", "student-friendly"),
        ("Weekend", "weekend"),
        ("Frontend", "frontend"),
        ("Backend", "backend"),
        ("Full Stack", "fullstack"),
        ("Internship", "internship"),
        ("Junior", "junior"),
        ("Mid-Level", "mid-level"),
        ("Remote", "remote"),
        ("C#", "csharp"),
        ("React", "react"),
        ("TypeScript", "typescript"),
        ("Python", "python"),
        ("DevOps", "devops"),
        ("QA", "qa"),
        ("Mobile", "mobile"),
        ("Data", "data"),
        ("Part-Time", "part-time"),
    ];

    public static IReadOnlyList<GigSeed> Gigs { get; } = BuildGigs();

    public static IReadOnlyList<ItJobSeed> ItJobs { get; } = BuildItJobs();

    private static IReadOnlyList<GigSeed> BuildGigs()
    {
        var cities = new[] { "Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Leipzig", "Düsseldorf", "Bremen", "Dresden" };
        var gigs = new List<GigSeed>();

        var templates = new (string Title, string Desc, string CompanySlug, string[] Tags, decimal Min, decimal Max)[]
        {
            ("Event Staff — Conference", "Assist with registration, badge scanning, and guest directions at a 2-day tech conference. Brief training provided on day one. Perfect for students who enjoy fast-paced environments.", "eventbridge", ["events", "student-friendly"], 14, 17),
            ("Festival Setup Crew", "Help build stages, install signage, and support teardown after a city music festival. Physical work, team-oriented shifts, meals included during long days.", "stageone", ["events", "weekend"], 15, 18),
            ("Office Cleaner (Evening)", "Light cleaning for a co-working space after business hours. Tasks include vacuuming, desk wipe-down, and kitchen tidy-up. Flexible 4-hour evening blocks.", "cleanspace", ["cleaning", "part-time"], 13, 15),
            ("Apartment Move Assistant", "Support a small moving crew with packing, loading, and furniture carry. No driver's license required. Weekend shifts available across the city.", "moveeasy", ["moving", "weekend"], 14, 16),
            ("Parcel Sorting Helper", "Sort incoming packages at a local distribution hub. Standing work with short breaks. Ideal if you want consistent weekday hours.", "parcelone", ["warehouse", "delivery"], 13, 15),
            ("Food Delivery Rider", "Deliver orders by bike within a 3 km radius. E-bike provided. Keep 100% of tips. Must be comfortable riding in urban traffic.", "quickbite", ["delivery", "student-friendly"], 12, 14),
            ("Warehouse Picker", "Pick and pack online orders using a handheld scanner. Modern warehouse with climate control. Morning or afternoon shifts.", "nordfulfillment", ["warehouse"], 14, 17),
            ("Retail Stock Assistant", "Restock shelves, label products, and support customers during peak hours at an electronics store.", "techmart", ["retail", "student-friendly"], 12, 14),
            ("Hotel Housekeeping Support", "Prepare guest rooms alongside the housekeeping team at a boutique hotel. Attention to detail matters. Uniform provided.", "harbor-hotel", ["cleaning", "hospitality"], 13, 16),
            ("Catering Service Helper", "Serve food and beverages at corporate events and weddings. Black attire required. Friendly team, tips often shared.", "taste-serve", ["hospitality", "events"], 14, 18),
        };

        for (var i = 0; i < TargetGigCount; i++)
        {
            var t = templates[i % templates.Length];
            var city = cities[i % cities.Length];
            var suffix = i >= templates.Length ? $" #{i / templates.Length + 1}" : "";
            var remote = i % 17 == 0;

            gigs.Add(new GigSeed(
                t.Title + suffix,
                t.Desc,
                t.CompanySlug,
                remote ? "Remote" : city,
                t.Min + (i % 3),
                t.Max + (i % 4),
                remote,
                t.Tags));
        }

        return gigs;
    }

    private static IReadOnlyList<ItJobSeed> BuildItJobs()
    {
        var cities = new[] { "Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Leipzig", "Remote", "Düsseldorf", "Bremen" };
        var jobs = new List<ItJobSeed>();

        var templates = new (string Title, string Desc, string CompanySlug, JobLevel Level, string[] Tags, decimal Min, decimal Max, bool Remote)[]
        {
            ("Frontend Intern (React)", "Join a product squad shipping user-facing features in React and TypeScript. You'll pair with a senior engineer, join code reviews, and learn modern CI practices.", "pixelforge", JobLevel.Internship, ["frontend", "react", "typescript", "internship"], 900, 1300, true),
            ("Junior React Developer", "Build accessible UI components and integrate REST APIs in a growing SaaS product. You'll work closely with design and backend teams in two-week sprints.", "flowdesk", JobLevel.Junior, ["frontend", "react", "typescript", "junior"], 3800, 4800, false),
            ("Junior Backend Developer (.NET)", "Develop ASP.NET Core APIs and maintain EF Core data models. Exposure to Docker, unit testing, and Azure deployments.", "codenorth", JobLevel.Junior, ["backend", "csharp", "junior"], 4000, 5200, true),
            ("Full Stack Intern", "Rotate between React frontend tasks and .NET backend endpoints on a small startup team. Great for students finishing their second year.", "launchlane", JobLevel.Internship, ["fullstack", "react", "csharp", "internship"], 1000, 1400, false),
            ("Mid-Level Frontend Engineer", "Own feature delivery end-to-end in a React + TypeScript monorepo. Mentor juniors and collaborate on performance and accessibility improvements.", "scalegrid", JobLevel.MidLevel, ["frontend", "react", "mid-level", "remote"], 5500, 7200, true),
            ("Junior Python Developer", "Write data pipelines and internal tooling in Python. Work with PostgreSQL and basic AWS services under senior guidance.", "datapulse", JobLevel.Junior, ["backend", "python", "junior", "data"], 3900, 5000, false),
            ("QA Intern", "Create manual test cases and learn automation basics with Playwright. You'll be embedded in an agile product team shipping weekly.", "qualityfirst", JobLevel.Internship, ["qa", "internship", "student-friendly"], 850, 1150, true),
            ("DevOps Junior Engineer", "Support CI/CD pipelines, monitor staging environments, and document runbooks. Terraform and GitHub Actions exposure.", "cloudlane", JobLevel.Junior, ["devops", "junior", "remote"], 4200, 5400, true),
            ("Mobile Developer Intern (React Native)", "Assist in building cross-platform features for a consumer app with 200k+ downloads. Code reviews and mentorship included.", "appnest", JobLevel.Internship, ["mobile", "react", "internship"], 950, 1250, false),
            ("Mid-Level Full Stack Developer", "Lead small features across React client and .NET API. You'll participate in architecture discussions and on-call rotation (paid).", "productstack", JobLevel.MidLevel, ["fullstack", "react", "csharp", "mid-level"], 6000, 7800, true),
        };

        for (var i = 0; i < TargetItCount; i++)
        {
            var t = templates[i % templates.Length];
            var city = cities[i % cities.Length];
            var isRemote = t.Remote || city == "Remote" || i % 5 == 0;
            var suffix = i >= templates.Length ? $" — Team {(i / templates.Length) + 1}" : "";

            jobs.Add(new ItJobSeed(
                t.Title + suffix,
                t.Desc,
                t.CompanySlug,
                isRemote ? "Remote" : city,
                t.Level,
                isRemote,
                t.Min + (i % 5) * 50,
                t.Max + (i % 7) * 75,
                t.Tags.Concat(isRemote ? new[] { "remote" } : Array.Empty<string>()).Distinct().ToArray()));
        }

        return jobs;
    }
}
