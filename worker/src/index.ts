/**
 * Serverless proxy in front of a real Databricks workspace, so the static
 * portfolio (no backend, GitHub Pages) can trigger and poll a real job run
 * without ever holding a Databricks token client-side. Scale-to-zero, free
 * tier — deliberately not the "always-on backend" the rest of the site
 * avoids; see CLAUDE.md.
 *
 * Routes:
 *   GET  /api/latest             — cached summary of the last successful run
 *   POST /api/trigger            — starts a run (rate-limited)
 *   GET  /api/status?runId=<id>  — live task-by-task status for a run
 */

export interface Env {
  PIPELINE_KV: KVNamespace;
  ALLOWED_ORIGIN: string;
  DATABRICKS_HOST: string;
  DATABRICKS_TOKEN: string;
  DATABRICKS_JOB_ID: string;
  DATABRICKS_WAREHOUSE_ID: string;
  DATABRICKS_CATALOG: string;
  RATE_LIMIT_MS: string;
}

const LATEST_KEY = "latest-run";
const RATE_LIMIT_KEY = "last-triggered-at";

/** Mirrors `src/components/f1-lakehouse/data.ts`'s `goldTables` — the final
 * output tables worth showing a real row count for after a run completes. */
const GOLD_TABLES = ["dim_races", "dim_constructors", "dim_drivers", "fact_session_results", "ref_nationality_region"];

type TaskState = "pending" | "running" | "success" | "failed";

interface TaskStatus {
  key: string;
  status: TaskState;
  startTime?: number;
  endTime?: number;
}

interface RunSummary {
  runId: number;
  status: TaskState;
  startTime?: number;
  endTime?: number;
  tasks: TaskStatus[];
  tables?: Record<string, number>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const headers = corsHeaders(env);

    if (request.method === "OPTIONS") return new Response(null, { headers });

    try {
      if (url.pathname === "/api/latest" && request.method === "GET") {
        const cached = await env.PIPELINE_KV.get(LATEST_KEY, "json");
        return json(cached ?? { status: "never_run" }, headers);
      }

      if (url.pathname === "/api/trigger" && request.method === "POST") {
        return await handleTrigger(env, headers);
      }

      if (url.pathname === "/api/status" && request.method === "GET") {
        return await handleStatus(env, headers, url.searchParams.get("runId"));
      }

      return json({ error: "not_found" }, headers, 404);
    } catch (err) {
      return json({ error: "internal_error", message: String(err) }, headers, 500);
    }
  },
};

async function handleTrigger(env: Env, headers: Record<string, string>): Promise<Response> {
  const rateLimitMs = Number(env.RATE_LIMIT_MS) || 60 * 60 * 1000;
  const lastTriggered = Number((await env.PIPELINE_KV.get(RATE_LIMIT_KEY)) ?? 0);
  const now = Date.now();
  const elapsed = now - lastTriggered;

  if (elapsed < rateLimitMs) {
    return json({ error: "rate_limited", retryAfterMs: rateLimitMs - elapsed }, headers, 429);
  }

  const run = await databricksFetch<{ run_id: number }>(env, "/api/2.2/jobs/run-now", {
    method: "POST",
    body: JSON.stringify({ job_id: Number(env.DATABRICKS_JOB_ID) }),
  });

  await env.PIPELINE_KV.put(RATE_LIMIT_KEY, String(now));
  return json({ runId: run.run_id }, headers);
}

async function handleStatus(env: Env, headers: Record<string, string>, runId: string | null): Promise<Response> {
  if (!runId) return json({ error: "missing runId" }, headers, 400);

  const run = await databricksFetch<DatabricksRun>(env, `/api/2.2/jobs/runs/get?run_id=${encodeURIComponent(runId)}`);
  const summary = summarizeRun(run);

  if (summary.status === "success") {
    summary.tables = await fetchGoldTableCounts(env);
    await env.PIPELINE_KV.put(LATEST_KEY, JSON.stringify(summary));
  }

  return json(summary, headers);
}

interface DatabricksState {
  life_cycle_state?: string;
  result_state?: string;
}

interface DatabricksTask {
  task_key: string;
  state?: DatabricksState;
  start_time?: number;
  end_time?: number;
}

interface DatabricksRun {
  run_id: number;
  state?: DatabricksState;
  start_time?: number;
  end_time?: number;
  tasks?: DatabricksTask[];
}

function summarizeRun(run: DatabricksRun): RunSummary {
  return {
    runId: run.run_id,
    status: mapState(run.state),
    startTime: run.start_time,
    endTime: run.end_time,
    tasks: (run.tasks ?? []).map((t) => ({
      key: t.task_key,
      status: mapState(t.state),
      startTime: t.start_time,
      endTime: t.end_time,
    })),
  };
}

function mapState(state: DatabricksState | undefined): TaskState {
  const lifeCycle = state?.life_cycle_state;
  const result = state?.result_state;
  if (!lifeCycle || ["PENDING", "QUEUED", "BLOCKED"].includes(lifeCycle)) return "pending";
  if (["RUNNING", "TERMINATING"].includes(lifeCycle)) return "running";
  if (lifeCycle === "TERMINATED" && result === "SUCCESS") return "success";
  return "failed";
}

async function fetchGoldTableCounts(env: Env): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const table of GOLD_TABLES) {
    try {
      const res = await databricksFetch<SqlStatementResponse>(env, "/api/2.0/sql/statements", {
        method: "POST",
        body: JSON.stringify({
          warehouse_id: env.DATABRICKS_WAREHOUSE_ID,
          catalog: env.DATABRICKS_CATALOG,
          schema: "gold",
          statement: `SELECT COUNT(*) FROM ${table}`,
          wait_timeout: "30s",
        }),
      });
      counts[table] = Number(res.result?.data_array?.[0]?.[0] ?? 0);
    } catch {
      // A single failed count shouldn't take down the whole summary — the
      // task DAG status is the primary signal, table counts are a bonus.
      counts[table] = -1;
    }
  }
  return counts;
}

interface SqlStatementResponse {
  result?: { data_array?: string[][] };
}

async function databricksFetch<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://${env.DATABRICKS_HOST}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.DATABRICKS_TOKEN}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Databricks API ${path} responded ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

function corsHeaders(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data: unknown, headers: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
