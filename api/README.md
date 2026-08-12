# api/

ASP.NET Core backend for the F1 Lakehouse tile's live-trigger feature. Stage 1
(this stage): a single read-only endpoint proving the token, the hosting, and
the Databricks connectivity work, before anything with more moving parts
(persistence, rate limiting, triggering, realtime) gets added on top.

**Not deployed yet.** The code is complete and locally verified (see
"Verifying without real credentials" below), but going live needs a real
Databricks workspace and a real Azure Container Apps environment — neither of
which I can provision. That's on you; this doc is the checklist.

## What it does

`GET /api/pipeline/history` — the last 10 runs of the F1 full-refresh job,
proxied from Databricks Jobs API 2.2 (`GET /api/2.2/jobs/runs/list`). Nothing
else yet: no trigger endpoint, no database, no realtime — those are stage 2/3.

`GET /healthz` — plain liveness check, no Databricks call.

## Project layout

```
api/
  Api.slnx
  src/Api/              # the actual API — Program.cs, Controllers/, Services/, Options/, Models/
  tests/Api.Tests/       # fixture-based unit tests, no live credentials needed
```

`Controllers/` stays thin — it only calls `IDatabricksJobsService` and maps
exceptions to a clean response. The Databricks call, the snake_case→DTO
mapping, and the short-lived cache all live in `Services/DatabricksJobsService.cs`.

## Local development

```bash
cd api/src/Api
dotnet user-secrets init
dotnet user-secrets set "Databricks:Token" "<your-token>"
```

`Databricks:Host` and `Databricks:JobId` aren't secret — set them in
`appsettings.Development.json` (already git-tracked, just fill in the blanks)
rather than user-secrets. Then:

```bash
dotnet run
```

Hits `http://localhost:5139` by default. Run the tests with:

```bash
dotnet test
```

## Verifying without real credentials

You don't need a real workspace to confirm the code is correct:

- `dotnet test` — 16 fixture-based tests cover the one real risk in this
  stage: Databricks' JSON is snake_case, `System.Text.Json` doesn't convert
  that automatically, and getting a `[JsonPropertyName]` wrong would compile
  fine and silently return empty history forever. The tests feed a static
  fixture (shaped like a real `runs/list` response) through the actual
  deserialization + mapping code.
- Point `Databricks:Host` at anything unreachable and hit
  `/api/pipeline/history` — you should get a clean `502` with a friendly
  message, not a crash. That's the graceful-degradation path doing its job
  before there's anything real to degrade from.

## Prerequisites for actually deploying this

None of this can happen from CI alone — each step below needs your Azure/Databricks
account access, which I don't have.

**Databricks:**
1. Create a Databricks Free Edition account (not the old exhausted student one).
2. Deploy the `formula1-databricks` Asset Bundle to it.
3. Load the F1 source files into a volume (Free Edition restricts outbound
   internet, so the job can't download them at run time).
4. Create a personal access token; verify it works with one trivial API call
   before wiring it in here. Note the workspace host and the job ID.

**Azure — one-time setup:**
1. Create a resource group, an Azure Container Registry, and a Container Apps
   environment (Consumption plan).
2. Create the Container App itself with `--min-replicas 0` (scale-to-zero —
   this is what keeps it free) and ingress `targetPort 8080` (must match the
   Dockerfile's `ASPNETCORE_URLS`).
3. Set the real config on the Container App directly (not via this repo):
   ```bash
   az containerapp secret set --name <app> --resource-group <rg> \
     --secrets databricks-token="<your-token>"
   az containerapp update --name <app> --resource-group <rg> \
     --set-env-vars \
       Databricks__Host="<your-workspace-host>" \
       Databricks__JobId="<your-job-id>" \
       Databricks__Token=secretref:databricks-token \
       Cors__AllowedOrigins__0="https://goldenflori.github.io"
   ```
   This is a one-time step, not something `deploy-api.yml` re-applies on every
   push — CI only rebuilds and redeploys the image; environment config persists
   on the Container App across revisions.
4. Create a Microsoft Entra app registration with a federated credential
   scoped to this repo (`repo:goldenFlori/golden-portfolio:ref:refs/heads/main`)
   so `azure/login@v2` can authenticate via OIDC — no long-lived Azure secret
   stored in GitHub. Grant it `AcrPush` on the registry and `Contributor` (or
   a narrower custom role) on the Container App.
5. Add these as GitHub Actions repo secrets: `AZURE_CLIENT_ID`,
   `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_CONTAINER_REGISTRY`,
   `AZURE_RESOURCE_GROUP`, `AZURE_CONTAINER_APP_NAME`.

**Frontend:** once the API is live, set `VITE_PIPELINE_API_URL` to its URL
when building `web/` (see the root README) — the history list starts
rendering with no other change needed, same gate as before.

## Why no database or rate limiting yet

Deliberately out of scope for stage 1 — "prove token + hosting + connectivity
with minimal surface area." A 60-second in-memory cache in
`DatabricksJobsService` keeps a page full of visitors from each hitting
Databricks directly, but it's not persistent: Container Apps scale-to-zero
means the process — and anything in memory — disappears when idle. Real,
persistent rate limiting (so a public trigger button can't drain a finite
Databricks quota) needs a database, which is stage 2.
