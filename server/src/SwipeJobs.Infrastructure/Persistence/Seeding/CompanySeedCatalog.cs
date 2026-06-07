namespace SwipeJobs.Infrastructure.Persistence.Seeding;

internal sealed record CompanySeed(
    string Slug,
    string Name,
    string Description,
    string Industry,
    string Location,
    string CompanySize,
    string? Website);

internal static class CompanySeedCatalog
{
    public static IReadOnlyList<CompanySeed> Companies { get; } =
    [
        new("eventbridge", "EventBridge GmbH", "EventBridge runs conferences, trade fairs, and brand activations across Germany. We hire flexible crews for registration desks, stage builds, and guest services at tech and lifestyle events.", "Events & Hospitality", "Berlin, Germany", "51–200 employees", "https://eventbridge.example.com"),
        new("stageone", "StageOne Events", "StageOne builds unforgettable festival experiences — from stage rigging to artist hospitality. Our teams work on music festivals, city celebrations, and outdoor corporate events.", "Events & Production", "Munich, Germany", "11–50 employees", "https://stageone.example.com"),
        new("cleanspace", "CleanSpace Berlin", "CleanSpace provides evening and weekend cleaning for co-working spaces, offices, and retail locations. We offer predictable shifts and fair hourly pay for reliable workers.", "Facilities Services", "Berlin, Germany", "11–50 employees", "https://cleanspace.example.com"),
        new("moveeasy", "MoveEasy", "MoveEasy is a student-friendly moving service connecting small crews with apartment moves across major German cities. No truck license required — just teamwork and care.", "Logistics & Moving", "Hamburg, Germany", "11–50 employees", "https://moveeasy.example.com"),
        new("parcelone", "ParcelOne Logistics", "ParcelOne operates urban distribution hubs for e-commerce brands. Pickers and sorters work in modern, climate-controlled warehouses with scanner-based workflows.", "Logistics", "Frankfurt, Germany", "201–500 employees", "https://parcelone.example.com"),
        new("quickbite", "QuickBite Delivery", "QuickBite is a bike-first food delivery platform serving dense city neighborhoods. Riders keep tips, use company e-bikes, and choose flexible shift blocks.", "Food Delivery", "Cologne, Germany", "51–200 employees", "https://quickbite.example.com"),
        new("nordfulfillment", "NordFulfillment", "NordFulfillment handles pick-pack-ship operations for D2C brands. We invest in ergonomic workstations, clear SOPs, and cross-training so warehouse roles grow into team lead paths.", "E-commerce Fulfillment", "Leipzig, Germany", "201–500 employees", "https://nordfulfillment.example.com"),
        new("techmart", "TechMart Retail", "TechMart is a consumer electronics retailer with stores in ten cities. Stock assistants and floor staff help customers compare products and keep shelves organized during peak seasons.", "Retail", "Stuttgart, Germany", "501–1,000 employees", "https://techmart.example.com"),
        new("harbor-hotel", "Harbor Hotel Group", "Harbor Hotel Group operates boutique hotels along the North Sea and Baltic coasts. Housekeeping and front-of-house teams deliver calm, detail-oriented guest experiences.", "Hospitality", "Bremen, Germany", "201–500 employees", "https://harborhotel.example.com"),
        new("taste-serve", "Taste & Serve", "Taste & Serve staffs corporate catering, weddings, and gala dinners. Servers work event-based shifts with clear dress codes and shared tip pools.", "Catering", "Düsseldorf, Germany", "11–50 employees", "https://tasteandserve.example.com"),
        new("pixelforge", "PixelForge Labs", "PixelForge Labs builds design-led SaaS tools for creative teams. Our product squads ship React features weekly with strong mentorship for interns and juniors.", "Software / SaaS", "Berlin, Germany", "11–50 employees", "https://pixelforge.example.com"),
        new("flowdesk", "Flowdesk GmbH", "Flowdesk helps operations teams automate workflows with a no-code builder and integrations marketplace. Engineering culture emphasizes accessibility, code review, and predictable sprints.", "Software / SaaS", "Munich, Germany", "51–200 employees", "https://flowdesk.example.com"),
        new("codenorth", "CodeNorth AG", "CodeNorth AG develops enterprise APIs and data services on .NET and Azure. Junior engineers pair with seniors on EF Core models, integration tests, and containerized deployments.", "Software / Enterprise", "Hamburg, Germany", "201–500 employees", "https://codenorth.example.com"),
        new("launchlane", "LaunchLane", "LaunchLane is an early-stage startup studio spinning up B2B products. Interns rotate between React UI tasks and ASP.NET Core endpoints on small, autonomous teams.", "Software / Startup", "Berlin, Germany", "11–50 employees", "https://launchlane.example.com"),
        new("scalegrid", "ScaleGrid", "ScaleGrid delivers analytics dashboards for mid-market retailers. Frontend engineers own features end-to-end in a TypeScript monorepo with strong performance budgets.", "Software / Analytics", "Remote-first, Germany", "51–200 employees", "https://scalegrid.example.com"),
        new("datapulse", "DataPulse", "DataPulse builds data pipelines and internal tooling for fintech clients. Python developers work with PostgreSQL, Airflow-style schedulers, and AWS under senior guidance.", "Data & Analytics", "Frankfurt, Germany", "51–200 employees", "https://datapulse.example.com"),
        new("qualityfirst", "QualityFirst", "QualityFirst embeds QA engineers in agile product teams. Interns learn manual test design and Playwright automation while shipping alongside developers every week.", "Software QA", "Remote-first, Germany", "11–50 employees", "https://qualityfirst.example.com"),
        new("cloudlane", "CloudLane", "CloudLane helps SaaS companies run reliable CI/CD on GitHub Actions and Terraform. DevOps engineers monitor staging, document runbooks, and improve deployment safety.", "DevOps / Cloud", "Remote-first, Germany", "51–200 employees", "https://cloudlane.example.com"),
        new("appnest", "AppNest", "AppNest ships a consumer mobile app with 200k+ downloads. React Native developers build cross-platform features with code review, design pairing, and weekly releases.", "Mobile Apps", "Cologne, Germany", "11–50 employees", "https://appnest.example.com"),
        new("productstack", "ProductStack GmbH", "ProductStack GmbH builds vertical SaaS for logistics SMBs. Full-stack developers lead small features across React clients and .NET APIs with architecture discussions and paid on-call.", "Software / SaaS", "Stuttgart, Germany", "51–200 employees", "https://productstack.example.com"),
    ];
}
