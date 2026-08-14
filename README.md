# golden-portfolio

Personal portfolio of **Florjan Mema** — full-stack software engineer & data engineer in Tirana, Albania.

A monorepo: a static React frontend (`web/`) deployed free on GitHub Pages, and — for one feature that genuinely needs it — a real ASP.NET Core backend (`api/`) deployed free on Azure Container Apps. Built with the stack I use professionally: **React 19 + TypeScript + HeroUI v3 + Tailwind CSS v4** on the frontend, **ASP.NET Core (C#)** on the backend, with **TanStack Query** streaming live data into the page on both sides — real GitHub commits, and real Databricks pipeline runs (`api/` is live, backed by a real Databricks workspace), not screenshots or invented numbers.

The repo grows commit by commit, on purpose: v0.1 is a small, polished, interactive start; each following commit ships one interactive project demo.

## Stack

**Frontend (`web/`)**
- React 19 + TypeScript, bundled with Vite
- HeroUI v3 (React Aria based) on Tailwind CSS v4, dark theme with a gold accent
- TanStack Query v5 — live GitHub commits & repos, cached, refreshable
- Motion for entrance and list animations; ambient background is CSS-only, `transform`-driven, and `prefers-reduced-motion` aware

**Backend (`api/`)** — only for the F1 Lakehouse tile's live-trigger feature; see [Why a backend at all](#why-a-backend-at-all) below
- ASP.NET Core on .NET 10, controllers + typed services, nullable reference types enabled
- Deployed to Azure Container Apps, Consumption plan, scale-to-zero (`min replicas 0`) — free
- xUnit, fixture-based tests for the one part that can't be verified against a real workspace yet

**CI**
- `.github/workflows/deploy.yml` — typecheck + build + deploy `web/` to GitHub Pages on every push touching `web/**`
- `.github/workflows/deploy-api.yml` — test + build + deploy `api/` to Azure Container Apps (OIDC, no long-lived Azure credential) on every push touching `api/**`

## Project structure

```
web/
  src/
    App.tsx                    # composition only — no logic, no markup details
    components/
      AmbientBackground.tsx    # slow-drifting gold particle field (styles in index.css §4)
      Hero.tsx                 # intro: name, status, contact actions
      SiteFooter.tsx
      icons.tsx
      live-activity/           # the interactive GitHub card as a module
        LiveActivity.tsx       # card shell: header, refresh, tabs
        CommitsPanel.tsx       # one panel = one file
        ReposPanel.tsx
        states.tsx             # shared loading / error / empty states
        index.ts               # public surface of the module
      f1-lakehouse/            # v0.3 demo tile — Databricks pipeline + dashboard recreation
        F1Lakehouse.tsx        # card shell: header, tabs (Pipeline / Standings / All-Time)
        LiveRunPanel.tsx       # Pipeline tab: static DAG + gated ExecutionHistory
        ExecutionHistory.tsx   # read-only list of real runs, via api/
        states.tsx             # loading / error / empty for ExecutionHistory
        PipelineDiagram.tsx    # the real 17-task medallion DAG
        StandingsView.tsx      # season standings: table + bar + pie
        AllTimeView.tsx        # career "greatness score" leaderboards
        BarChart.tsx           # sequential-gold ranked bar chart
        PieChart.tsx           # categorical pie + legend
        palette.ts             # chart color system (validated with the dataviz skill)
        data.ts                # real F1 standings/career stats + the pipeline DAG as data
        index.ts               # public surface of the module
    hooks/
      useGithub.ts             # query hooks + `githubKeys` key factory
      usePipeline.ts           # query hooks + `pipelineKeys` key factory
    lib/
      github.ts                # typed GitHub API client (no React)
      pipeline.ts               # client for api/ — the one place this site calls anything backend-shaped
      motion.ts                # shared animation presets
    data/
      content.ts               # profile, projects, experience — content only
    index.css                  # sectioned: tokens → base → ambient → glass → utilities
  package.json / vite.config.ts / tsconfig.json / index.html / public/

api/
  Api.slnx
  src/Api/
    Program.cs                 # hosting, DI, CORS (origins from config), health check
    Controllers/
      PipelineController.cs    # thin — history, per-run status, trigger
    Services/
      DatabricksJobsService.cs # the Databricks call, snake_case mapping, short-lived cache
    Options/
      DatabricksOptions.cs     # Host/Token/JobId, validated at startup
    Models/
      PipelineRunDto.cs
    Dockerfile
  tests/Api.Tests/             # fixture-based tests, no live credentials needed
  README.md                    # setup prerequisites for actually deploying this
```

Conventions (frontend): UI components hold no fetching logic (hooks do); the API client holds no React; query keys come from a single factory so cache invalidation has one source of truth; animation presets are shared so motion stays consistent; each file stays small enough to read in one pass. Conventions (backend): controllers stay thin; the Databricks call, the JSON mapping, and the caching live in a single service class behind an interface; config is strongly typed and validated at startup rather than read ad hoc.

## Scripts

```bash
# Frontend
cd web
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build to dist/
npm run preview  # serve the production build locally

# Backend
cd api
dotnet build
dotnet test       # fixture-based, no live Databricks credentials needed
dotnet run --project src/Api
```

## Deploy

**Frontend:** GitHub Pages via `.github/workflows/deploy.yml`. One-time setup: **Settings → Pages → Source: GitHub Actions**. The workflow computes the base path from the repo name automatically.

**Backend:** live on Azure Container Apps, scale-to-zero. `api/README.md` has the full setup checklist (Databricks workspace, Container Apps environment, OIDC deploy pipeline) for anyone rebuilding this from scratch.

## Why a backend at all

The rest of this site is deliberately backend-free — that's what keeps it free to host forever. The one exception is the F1 Lakehouse tile's live-trigger feature: to let a visitor watch a **real** Databricks pipeline run (not a recreation), something has to hold a Databricks token server-side, because a static site has nowhere safe to keep a secret. `api/` is scale-to-zero Azure Container Apps — no idle cost, not a server anyone has to keep running — which is why this doesn't quietly reopen the door to "just add a backend" for anything else. See `CLAUDE.md`'s "No always-on backend" rule for the exact boundary.

This mirrors my actual day-job stack (React + ASP.NET Core + SQL Server + realtime) rather than a generic serverless function — an earlier version of this feature used a Cloudflare Worker, which worked but proved less, so it was replaced.

**Where this stands today:** `api/` is deployed and live — `GET /api/pipeline/history`, `GET /api/pipeline/status/{runId}`, and `POST /api/pipeline/trigger` all call a real Databricks Free Edition workspace. A visitor can click "Run pipeline" on the live site and watch an actual job run, polled client-side every 3s while in flight. What's still a deliberate simplification: rate limiting and "attach to an in-progress run" live in an in-memory cache, not a database — Container Apps loses that state on scale-to-zero, so a determined visitor could in theory outrun the cooldown across a cold start. Real persistence (Azure SQL) and pushing live per-task status via SignalR instead of polling are the remaining stages, not built yet. Until `VITE_PIPELINE_API_URL` is unset, the tile falls back to the static recreation — same progressive-enhancement gate as before.

## Roadmap

- [x] v0.1 — hero + live GitHub activity card (tabs, skeletons, refresh) on a glass surface
- [ ] v0.2 — interactive demo tile: payments state machine
- [x] v0.3 — interactive demo tile: F1 lakehouse pipeline + dashboard recreation, real standings data, real 17-task DAG. Live backend (`api/`) deployed on Azure Container Apps against a real Databricks Free Edition workspace — execution history, per-run status polling, and a real trigger button all live. Persistent rate limiting (Azure SQL) and SignalR-pushed live status are the remaining, not-yet-built stages.
- [ ] v0.4 — Python + Selenium smoke suite in CI against the built site
- [ ] Custom domain

## License

MIT
