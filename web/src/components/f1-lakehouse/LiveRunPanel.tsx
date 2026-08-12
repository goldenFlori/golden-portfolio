import { pipelineLiveEnabled } from "../../lib/pipeline";
import { ExecutionHistory } from "./ExecutionHistory";
import { PipelineDiagram } from "./PipelineDiagram";

/**
 * Pipeline tab content. The static DAG always renders; the read-only
 * execution history is progressive enhancement gated on
 * `VITE_PIPELINE_API_URL` (see `lib/pipeline.ts`) — same fallback pattern
 * the earlier Cloudflare Worker prototype used. No trigger button yet: `api/`
 * only supports reading history so far, triggering is a later stage.
 */
export function LiveRunPanel() {
  return (
    <div className="flex flex-col gap-3">
      {!pipelineLiveEnabled && (
        <p className="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs text-muted">
          Live data isn't connected yet — the backend (<code>api/</code>) isn't deployed, and the
          Databricks workspace behind it is being re-provisioned. This is the pipeline's real, verified
          design; the data below is a recreation, not a live run.
        </p>
      )}

      <PipelineDiagram />

      {pipelineLiveEnabled && (
        <div>
          <h4 className="mb-2 font-display text-sm font-semibold text-foreground">Execution history</h4>
          <ExecutionHistory />
        </div>
      )}
    </div>
  );
}
