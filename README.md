# SwipeJobs

Modern job discovery platform for students, beginners, and short-term work seekers.

## Phase 1: Foundation

This repository contains the architectural foundation only. Business features (job listings, apply, profile CRUD) arrive in Phase 2.

## Structure

```
/server          ASP.NET Core Web API (Clean Architecture)
/client          React + TypeScript + Vite
```

### Backend layers

| Layer | Project | Responsibility |
|-------|---------|----------------|
| Domain | `SwipeJobs.Domain` | Entities, enums, no dependencies |
| Application | `SwipeJobs.Application` | Service interfaces, repository contracts, DI |
| Infrastructure | `SwipeJobs.Infrastructure` | EF Core, SQLite, repositories, seeding |
| API | `SwipeJobs.Api` | HTTP, Swagger, CORS, migrations on startup |

### Frontend structure

| Folder | Purpose |
|--------|---------|
| `src/pages` | Route-level pages |
| `src/components` | Layout and UI |
| `src/api` | HTTP client and API modules |
| `src/services` | Business logic (Phase 2) |
| `src/models` | TypeScript types matching backend |
| `src/theme` | Light/dark theme provider |

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) (10.x installed; targets `net10.0`, API-compatible with ASP.NET Core 8 patterns)
- [Node.js](https://nodejs.org/) 20+ with npm

## Run locally

### Backend

```bash
cd server
dotnet run --project src/SwipeJobs.Api
```

- API: http://localhost:5000 (or port in launchSettings)
- Swagger: http://localhost:5000/swagger
- Health: http://localhost:5000/api/health
- SQLite DB: `server/src/SwipeJobs.Api/swipejobs.db` (auto-migrated on startup)

### Frontend

```bash
cd client
npm install
npm run dev
```

- App: http://localhost:5173
- API proxy: `/api` → backend

## Design tokens

- Accent: `#FFD600`
- Light mode: white background, black text
- Dark mode: black background, white text
- Mobile-first layout (max-width 480px)

## Phase 2: Core Product (current)

Jobs API, profile CRUD, **Quick Apply** (application record + tracking — not employer delivery yet), saved jobs.

## Honest product language

**Quick Apply** = user submits from saved profile; application is tracked in-app.  
**True one-click apply** (future) = CV delivered to employer, status updates from company.

## Next steps (before Phase 3)

1. UX pass — use the app yourself; fix friction before new features
2. Realistic seed data — 50–100 jobs that feel alive
3. User feedback — show to students/juniors without pitching the vision

## Phase 3: Swipe Mode (current)

- **Route:** `/swipe` — Tinder-like job discovery
- **Gestures:** ← Skip · → Save · ↑ Quick Apply · Tap → details
- **Desktop:** mouse drag + action buttons
- **Animations:** Framer Motion spring physics

## Phase 4 (future)

- AI matching, Telegram ingestion, smart recommendations — after core validation
