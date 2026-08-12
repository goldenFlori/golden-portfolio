/**
 * Client for the f1-lakehouse-proxy Worker (`worker/`) — the one place this
 * site talks to anything resembling a backend, and only because a real
 * Databricks token can't safely live in static frontend code. See
 * `worker/README.md` for what runs behind this.
 *
 * `VITE_PIPELINE_API_URL` is unset until the Worker is actually deployed
 * (see `pipelineLiveEnabled`), so the live-trigger UI stays dark and the F1
 * Lakehouse tile falls back to the static recreation until then.
 */

export type TaskState = "pending" | "running" | "success" | "failed";

export interface TaskStatus {
  key: string;
  status: TaskState;
  startTime?: number;
  endTime?: number;
}

export interface RunSummary {
  runId: number;
  status: TaskState;
  startTime?: number;
  endTime?: number;
  tasks: TaskStatus[];
  tables?: Record<string, number>;
}

export type LatestRun = RunSummary | { status: "never_run" };

export interface TriggerRejected {
  error: "rate_limited";
  retryAfterMs: number;
}

const API_URL = import.meta.env.VITE_PIPELINE_API_URL as string | undefined;

export const pipelineLiveEnabled = Boolean(API_URL);

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("VITE_PIPELINE_API_URL is not configured");
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok && res.status !== 429) {
    throw new Error(`Pipeline API ${path} responded ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchLatestRun(): Promise<LatestRun> {
  return getJson<LatestRun>("/api/latest");
}

export function triggerRun(): Promise<{ runId: number } | TriggerRejected> {
  return getJson("/api/trigger", { method: "POST" });
}

export function fetchRunStatus(runId: number): Promise<RunSummary> {
  return getJson<RunSummary>(`/api/status?runId=${runId}`);
}
