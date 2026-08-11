# f1-lakehouse-proxy

A small Cloudflare Worker that lets the static portfolio (no backend, hosted
free on GitHub Pages) trigger and poll a real run of the
[formula1-databricks](https://github.com/goldenFlori/formula1-databricks)
full-refresh job — without ever putting a Databricks token in client-side
code. See `src/index.ts` for the routes and `../CLAUDE.md` for why this is a
deliberate, scoped exception to the site's "no backend" rule rather than a
contradiction of it: it's scale-to-zero and stateless, not a server anyone
has to keep running.

**This is not deployed yet.** It's written and ready; deploying it needs a
live Databricks workspace, which currently doesn't exist (see the note in the
F1 Lakehouse tile). Come back to this once the student subscription renews.

## One-time setup

1. **Re-provision the Databricks workspace** (see the `migration/` folder in
   `formula1-databricks`) and deploy the DAB bundle so
   `job_formula1_lakehouse_full_refresh` and a SQL warehouse both exist.

2. **Collect three values from the workspace:**
   - `DATABRICKS_HOST` — your workspace URL without `https://`, e.g.
     `adb-1234567890123456.7.azuredatabricks.net`.
   - `DATABRICKS_JOB_ID` — Workflows → the full-refresh job → the numeric ID
     in the URL or the job details panel.
   - `DATABRICKS_WAREHOUSE_ID` — SQL Warehouses → your warehouse → Connection
     details → the ID in the HTTP Path (`/sql/1.0/warehouses/<this part>`).

3. **Create a personal access token**: workspace user Settings → Developer →
   Access tokens. Copy it once — it isn't shown again.

4. **Install dependencies and log in to Cloudflare:**
   ```bash
   cd worker
   npm install
   npx wrangler login
   ```

5. **Create the KV namespace** (stores the rate-limit timestamp and the
   cached last-successful-run summary):
   ```bash
   npx wrangler kv namespace create PIPELINE_KV
   ```
   Paste the returned `id` into `wrangler.toml`'s `[[kv_namespaces]]` block.

6. **Fill in the non-secret vars** in `wrangler.toml`: `DATABRICKS_HOST`,
   `DATABRICKS_JOB_ID`, `DATABRICKS_WAREHOUSE_ID`. Confirm `ALLOWED_ORIGIN`
   matches the site's real deployed URL (`https://goldenflori.github.io`) —
   the Worker rejects requests from anywhere else via CORS.

7. **Set the token as a secret — never in `wrangler.toml`, never committed:**
   ```bash
   npx wrangler secret put DATABRICKS_TOKEN
   ```

8. **Deploy:**
   ```bash
   npm run deploy
   ```
   Wrangler prints the Worker's URL (`https://f1-lakehouse-proxy.<subdomain>.workers.dev`).

9. **Point the frontend at it.** Set `VITE_PIPELINE_API_URL` to that URL when
   building the site (a repo variable in the GitHub Actions workflow, or a
   local `.env.production`). Until this is set, the F1 Lakehouse tile shows
   the static recreation and the live-trigger UI doesn't render at all — see
   `src/lib/pipeline.ts`'s `pipelineLiveEnabled`.

## Rate limiting

`RATE_LIMIT_MS` in `wrangler.toml` (default: 1 hour) is a *global* cooldown
between triggers, enforced server-side via KV — not per-visitor. This exists
because your Databricks credits are finite; a public "run it" button with no
gate is an open invitation to drain them. Raise or lower it there.

## Local development

```bash
npm run dev
```
Wrangler will prompt for local versions of the vars/secrets (or read them
from a git-ignored `.dev.vars` file) so you can hit `http://localhost:8787`
without touching the deployed Worker.
