# florjan-portfolio

Personal portfolio of **Florjan Mema** — full-stack software engineer & data engineer in Tirana, Albania.

Built with the stack I use professionally, plus current UI tooling: **React 19 + TypeScript + HeroUI v3 + Tailwind CSS v4**, with **TanStack Query** streaming my live GitHub activity into the page — real commits, not screenshots.

The repo grows commit by commit, on purpose: v0.1 is a small, polished, interactive start; each following commit ships one interactive project demo.

## Stack

- React 19 + TypeScript, bundled with Vite
- HeroUI v3 (React Aria based) on Tailwind CSS v4, dark theme with a gold accent
- TanStack Query v5 — live GitHub commits & repos, cached, refreshable
- Motion for entrance and list animations; ambient background is CSS-only, `transform`-driven, and `prefers-reduced-motion` aware
- GitHub Actions: typecheck + build + deploy to GitHub Pages on every push to `main`

## Project structure

```
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
      PipelineDiagram.tsx    # the real 17-task medallion DAG
      StandingsView.tsx      # season standings: table + bar + pie
      AllTimeView.tsx        # career "greatness score" leaderboards
      BarChart.tsx           # sequential-gold ranked bar chart
      PieChart.tsx           # categorical pie + legend
      palette.ts             # chart color system (validated with the dataviz skill)
      data.ts                # real F1 standings/career stats + the pipeline DAG as data
      LiveRunPanel.tsx       # live trigger/poll UI for a real Databricks run (dormant, see below)
      index.ts               # public surface of the module
  hooks/
    useGithub.ts             # query hooks + `githubKeys` key factory
    usePipeline.ts           # query/mutation hooks + `pipelineKeys` key factory
  lib/
    github.ts                # typed GitHub API client (no React)
    pipeline.ts               # client for worker/ — the one place this site calls anything backend-shaped
    motion.ts                # shared animation presets
  data/
    content.ts               # profile, projects, experience — content only
  index.css                  # sectioned: tokens → base → ambient → glass → utilities
worker/                      # Cloudflare Worker: proxies real Databricks API calls, holds the token
                              # server-side. Not deployed yet — see worker/README.md.
```

Conventions: UI components hold no fetching logic (hooks do); the API client holds no React; query keys come from a single factory so cache invalidation has one source of truth; animation presets are shared so motion stays consistent; each file stays small enough to read in one pass.

## Scripts

```bash
npm install     # install dependencies
npm run dev     # local dev server
npm run build   # typecheck + production build to dist/
npm run preview # serve the production build locally
```

## Deploy

GitHub Pages via `.github/workflows/deploy.yml`. One-time setup: **Settings → Pages → Source: GitHub Actions**. The workflow computes the base path from the repo name automatically.

## Live F1 pipeline (optional, currently dormant)

The F1 Lakehouse tile's Pipeline tab can trigger and poll a **real** run of the [formula1-databricks](https://github.com/goldenFlori/formula1-databricks) full-refresh job, through a small Cloudflare Worker (`worker/`) that holds the Databricks token server-side — a static site has nowhere safe to keep that secret client-side. This isn't a step back from "no backend": the Worker is stateless and scale-to-zero, not a server anyone has to keep running, and it's the only piece of this repo that talks to anything backend-shaped.

It isn't deployed yet — the Databricks student subscription behind it is exhausted and renews in a few months. Until `VITE_PIPELINE_API_URL` is set, the tile shows the static recreation instead and the live-trigger UI doesn't render. Setup steps for when it's ready: `worker/README.md`.

## Roadmap

- [x] v0.1 — hero + live GitHub activity card (tabs, skeletons, refresh) on a glass surface
- [ ] v0.2 — interactive demo tile: payments state machine (Raiffeisen write-up)
- [x] v0.3 — interactive demo tile: F1 lakehouse pipeline + dashboard recreation, real standings data, real 17-task DAG; live-trigger path built, dormant until the Databricks subscription renews
- [ ] v0.4 — Python + Selenium smoke suite in CI against the built site
- [ ] Custom domain

## License

MIT
