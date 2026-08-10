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
  hooks/
    useGithub.ts             # query hooks + `githubKeys` key factory
  lib/
    github.ts                # typed GitHub API client (no React)
    motion.ts                # shared animation presets
  data/
    content.ts               # profile, projects, experience — content only
  index.css                  # sectioned: tokens → base → ambient → glass → utilities
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

## Roadmap

- [x] v0.1 — hero + live GitHub activity card (tabs, skeletons, refresh) on a glass surface
- [ ] v0.2 — interactive demo tile: payments state machine (Raiffeisen write-up)
- [ ] v0.3 — interactive demo tile: F1 lakehouse pipeline animation
- [ ] v0.4 — Python + Selenium smoke suite in CI against the built site
- [ ] Custom domain

## License

MIT
