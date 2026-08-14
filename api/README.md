# api/

ASP.NET Core backend for the F1 Lakehouse tile's live-trigger feature.

**Deployed and live**, on Azure Container Apps, scale-to-zero, behind a real
Databricks Free Edition workspace. A visitor on the live site can click "Run
pipeline" and watch an actual Databricks job run. What's still a deliberate
simplification: rate limiting and "attach to an in-progress run" live in an
in-memory cache, not a database — Container Apps loses that state on
scale-to-zero, so it's not a durable guard against abuse yet. Real
persistence (Azure SQL) and pushing live per-task status via SignalR instead
of client-side polling are the remaining stages, not built yet. The
"Prerequisites" section below is kept as the from-scratch setup checklist —
useful if this ever needs rebuilding in a new workspace/environment.

## What it does

`GET /api/pipeline/history` — the last 10 runs of the F1 full-refresh job,
proxied from Databricks Jobs API 2.2 (`GET /api/2.2/jobs/runs/list`).

`GET /api/pipeline/status/{runId}` — detailed status of one run, including
per-task state. Polled client-side every 3s while a run is live.

`POST /api/pipeline/trigger` — starts a real run of the full-refresh job,
subject to a cooldown (see the in-memory caveat above); attaches the caller
to a run already in progress instead of starting a second one.

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

## Prerequisites for deploying this (from-scratch checklist)

None of this can happen from CI alone — each step below needs Azure/Databricks
account access. This is the actual path used to stand up the current live
deployment, kept here for rebuilding in a new workspace/environment.

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
   `Databricks__Host` must be the **bare hostname, no `https://` prefix**
   (e.g. `dbc-xxxxxxxx-xxxx.cloud.databricks.com`) —
   `DatabricksJobsService` builds the base address as `$"https://{Host}"`
   itself. Passing a value that already includes the scheme silently breaks
   URL parsing (host resolves to the literal string `https`) and every
   request fails with a generic 502, which took real debugging to track down
   the first time.

   This is a one-time step, not something `deploy-api.yml` re-applies on every
   push — CI only rebuilds and redeploys the image; environment config persists
   on the Container App across revisions.
4. Create a Microsoft Entra app registration with a federated credential for
   `azure/login@v2` to authenticate via OIDC — no long-lived Azure secret
   stored in GitHub. Because `deploy-api.yml`'s `deploy` job declares
   `environment: production`, GitHub's OIDC subject claim is
   `repo:<org>/<repo>:environment:production`, **not** the more commonly
   documented branch-based `...ref:refs/heads/main` — scope the federated
   credential's Entity type to **Environment** (`production`), or the OIDC
   handshake fails with `AADSTS700213: No matching federated identity
   record found`. Grant the app `AcrPush` on the registry and `Contributor`
   (or a narrower custom role) on the resource group.
5. Add these as GitHub Actions repo secrets: `AZURE_CLIENT_ID`,
   `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_CONTAINER_REGISTRY`,
   `AZURE_RESOURCE_GROUP`, `AZURE_CONTAINER_APP_NAME`.
6. Grant the Container App itself pull access to the registry — pushing and
   pulling are separate permissions. `container-apps-deploy-action` doesn't
   call `az acr login` on its own under OIDC/RBAC, so `deploy-api.yml` does
   it explicitly before pushing. But the Container App still needs its own
   identity to *pull*:
   ```bash
   az containerapp identity assign --name <app> --resource-group <rg> --system-assigned
   principalId=$(az containerapp identity show --name <app> --resource-group <rg> --query principalId -o tsv)
   az role assignment create --assignee $principalId --role AcrPull \
     --scope $(az acr show --name <registry> --query id -o tsv)
   az containerapp registry set --name <app> --resource-group <rg> \
     --server <registry>.azurecr.io --identity system
   ```

**Frontend:** `VITE_PIPELINE_API_URL` is set to the live API's URL when
building `web/` (see `.github/workflows/deploy.yml` and the root README) —
the history list and trigger button render with no other change needed.

## Why no database or persistent rate limiting yet

Deliberately out of scope so far — "prove token + hosting + connectivity
with minimal surface area" first, then add a trigger endpoint before
persistence. A 60-second in-memory cache in `DatabricksJobsService` keeps a
page full of visitors from each hitting Databricks directly, and the same
cache backs the trigger cooldown and "attach to an in-progress run" — but
none of it is persistent: Container Apps scale-to-zero means the process,
and anything in memory, disappears when idle. In practice this means the
live trigger button's cooldown resets on a cold start, so it's not yet a
durable guard against a determined visitor draining a finite Databricks
quota. Real, persistent rate limiting needs a database — that's the next
stage.
