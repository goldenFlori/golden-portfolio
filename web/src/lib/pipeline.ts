/**
 * Client for `api/` — the one place this site talks to anything
 * backend-shaped, and only because a Databricks token can't safely live in
 * static frontend code. See `api/README.md` for what runs behind this.
 *
 * `VITE_PIPELINE_API_URL` is unset until the API is actually deployed (see
 * `pipelineLiveEnabled`), so the live section stays dark and the F1
 * Lakehouse tile falls back to the static recreation until then — same gate
 * the earlier Cloudflare Worker prototype used.
 */

export type RunStatus = "pending" | "running" | "success" | "failed";

export interface PipelineRun {
  id: number;
  status: RunStatus;
  startedAt: string | null;
  /** Null while the run is still in progress — render that distinctly, not as 0s. */
  durationSeconds: number | null;
}

const API_URL = import.meta.env.VITE_PIPELINE_API_URL as string | undefined;

export const pipelineLiveEnabled = Boolean(API_URL);

export async function fetchPipelineHistory(): Promise<PipelineRun[]> {
  if (!API_URL) throw new Error("VITE_PIPELINE_API_URL is not configured");
  const res = await fetch(`${API_URL}/api/pipeline/history`);
  if (!res.ok) {
    throw new Error(`Pipeline API responded ${res.status}`);
  }
  return res.json() as Promise<PipelineRun[]>;
}
