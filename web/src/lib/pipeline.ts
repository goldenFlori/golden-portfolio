/**
 * Client for `api/` — the one place this site talks to anything
 * backend-shaped, and only because a Databricks token can't safely live in
 * static frontend code. See `api/README.md` for what runs behind this.
 *
 * `VITE_PIPELINE_API_URL` is unset until the API is actually deployed (see
 * `pipelineLiveEnabled`), so the live section stays dark and the F1
 * Lakehouse tile falls back to the static recreation until then.
 */

export type RunStatus = "pending" | "running" | "success" | "failed";

export interface PipelineRun {
  id: number;
  status: RunStatus;
  startedAt: string | null;
  /** Null while the run is still in progress — render that distinctly, not as 0s. */
  durationSeconds: number | null;
}

export interface TaskStatus {
  key: string;
  status: RunStatus;
}

export interface RunStatusDetail extends PipelineRun {
  tasks: TaskStatus[];
}

export type TriggerResult =
  | { kind: "started" | "attached"; runId: number }
  | { kind: "rate_limited"; retryAfterSeconds: number };

const API_URL = import.meta.env.VITE_PIPELINE_API_URL as string | undefined;

export const pipelineLiveEnabled = Boolean(API_URL);

async function getJson<T>(path: string): Promise<T> {
  if (!API_URL) throw new Error("VITE_PIPELINE_API_URL is not configured");
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Pipeline API responded ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchPipelineHistory(): Promise<PipelineRun[]> {
  return getJson<PipelineRun[]>("/api/pipeline/history");
}

export function fetchRunStatus(runId: number): Promise<RunStatusDetail> {
  return getJson<RunStatusDetail>(`/api/pipeline/status/${runId}`);
}

export async function triggerRun(): Promise<TriggerResult> {
  if (!API_URL) throw new Error("VITE_PIPELINE_API_URL is not configured");
  const res = await fetch(`${API_URL}/api/pipeline/trigger`, { method: "POST" });

  if (res.status === 429) {
    const body = (await res.json()) as { retryAfterSeconds: number };
    return { kind: "rate_limited", retryAfterSeconds: body.retryAfterSeconds };
  }
  if (!res.ok) {
    throw new Error(`Pipeline API responded ${res.status}`);
  }
  const body = (await res.json()) as { runId: number; attached: boolean };
  return { kind: body.attached ? "attached" : "started", runId: body.runId };
}
