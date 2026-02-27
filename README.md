# Local Job Platform (2-branch)

A fully local prototype built with .NET 8 + React (Vite). Runs entirely on localhost with SQLite persistence.

## Project Structure

```
/server   ASP.NET Core Web API (.NET 8)
/client   React + Vite (TypeScript)
/samples  Sample import files (CSV + JSON)
```

## Prerequisites

- .NET 8 SDK
- Node.js 18+ (or 20+ recommended)

## Run (two terminals)

### 1) API

```bash
dotnet run --project server
```

- API: http://localhost:5000
- Swagger (dev): http://localhost:5000/swagger

### 2) Client

```bash
cd client
npm install
npm run dev
```

- UI: http://localhost:5173

## Run (single command)

Windows:

```bash
run-local.cmd
```

This opens the API in a new PowerShell window and starts the client in the current one.

- UI: http://localhost:5173

## Database & Migrations

- SQLite file: `server/jobaggregator.db`
- EF Core migrations are applied automatically on startup.

## Seed Demo Data

- UI: click **Seed demo** in the top bar
- API: `POST http://localhost:5000/api/seed`

Seed is idempotent: safe to run multiple times.

## Import / Export

### Import

- UI: **Import** page
- API: `POST /api/import?format=csv|json` (multipart `file` field)

### Export

- UI: Jobs list → Export CSV/JSON
- API: `GET /api/export?format=csv|json&...same filters as /api/jobs`

## Filters & Query Parameters

`GET /api/jobs` supports:

- `search` (title/company/description)
- `branch` (Gigs | ItJobs)
- `city`, `country`
- `remote` (true/false)
- `employmentType`
- `payMin`, `payMax`
- `postedFrom`, `postedTo`
- `tags` (comma-separated)
- `tagsMode` (any | all)
- `sourceId`
- `status` (Active | Archived)
- `sort` (newest | oldest | pay_high | pay_low)
- `page`, `pageSize`

## Sample Import Formats

Samples live in `/samples`.

### CSV

Headers (recommended):

```
Id,Branch,Title,CompanyOrPerson,Description,City,Country,IsRemote,EmploymentType,DurationDays,PayMin,PayMax,Currency,PostedAt,ApplyUrl,Contact,Status,Source,Tags
```

Notes:
- `Tags` can be separated by commas or semicolons.
- `EmploymentType` required for IT jobs.
- `DurationDays` required for gigs.

### JSON

Array of objects:

```json
[
  {
    "branch": "ItJobs",
    "title": "Junior .NET Developer",
    "companyOrPerson": "Tech Corp",
    "description": "Work on ASP.NET Core APIs.",
    "city": "Berlin",
    "country": "Germany",
    "isRemote": false,
    "employmentType": "FullTime",
    "payMin": 2500,
    "payMax": 3200,
    "currency": "EUR",
    "postedAt": "2026-02-20",
    "applyUrl": "https://example.com/apply",
    "contact": "jobs@techcorp.com",
    "status": "Active",
    "source": "Manual",
    "tags": "C#, ASP.NET Core, SQL"
  }
]
```

## Troubleshooting

- **CORS**: API allows `http://localhost:5173` by default.
- **Ports**: API is `5000`, Vite is `5173`. Update Program.cs + vite config if you change them.
- **Database reset**: delete `server/jobaggregator.db` then restart the API to re-apply migrations.
