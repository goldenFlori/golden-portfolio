import { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { useRunStatus, useTriggerRun } from "../../hooks/usePipeline";
import { pipelineLiveEnabled, type RunStatus } from "../../lib/pipeline";
import { ExecutionHistory } from "./ExecutionHistory";
import { PipelineDiagram } from "./PipelineDiagram";

function taskStatusMap(tasks: { key: string; status: RunStatus }[] | undefined): Record<string, RunStatus> | undefined {
  return tasks ? Object.fromEntries(tasks.map((t) => [t.key, t.status])) : undefined;
}

function formatCooldown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  return totalSeconds < 60 ? `${totalSeconds}s` : `${Math.ceil(totalSeconds / 60)}m`;
}

/**
 * Pipeline tab content. Static DAG always renders; triggering a real run and
 * the read-only execution history are both progressive enhancement, gated on
 * `VITE_PIPELINE_API_URL` (see `lib/pipeline.ts`).
 */
export function LiveRunPanel() {
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [cooldownMs, setCooldownMs] = useState<number | null>(null);

  const activeStatus = useRunStatus(activeRunId);
  const trigger = useTriggerRun();

  useEffect(() => {
    if (cooldownMs === null || cooldownMs <= 0) return;
    const timer = setTimeout(() => setCooldownMs((ms) => (ms === null ? null : ms - 1000)), 1000);
    return () => clearTimeout(timer);
  }, [cooldownMs]);

  if (!pipelineLiveEnabled) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs text-muted">
          Live triggering isn't connected yet — the backend (<code>api/</code>) isn't deployed. This is
          the pipeline's real, verified design; the data below is a recreation, not a live run.
        </p>
        <PipelineDiagram />
      </div>
    );
  }

  const run = activeStatus.data;
  const isRunning = run?.status === "pending" || run?.status === "running";
  const isCoolingDown = cooldownMs !== null && cooldownMs > 0;

  const handleRun = () => {
    trigger.mutate(undefined, {
      onSuccess: (result) => {
        if (result.kind === "rate_limited") {
          setCooldownMs(result.retryAfterSeconds * 1000);
          return;
        }
        setActiveRunId(result.runId);
        setCooldownMs(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white/5 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          {run ? (
            <>
              <Chip
                size="sm"
                color={run.status === "success" ? "success" : run.status === "failed" ? "danger" : "accent"}
              >
                <Chip.Label>{run.status}</Chip.Label>
              </Chip>
              <span>run #{run.id}</span>
              {isRunning && <span>· real run, usually 2–3 min</span>}
            </>
          ) : (
            <span>Runs a real Databricks job — takes a few minutes, watch the DAG below light up.</span>
          )}
        </div>
        <Button size="sm" variant="primary" isDisabled={isRunning || trigger.isPending || isCoolingDown} onPress={handleRun}>
          {isRunning ? "Running…" : isCoolingDown ? `Retry in ${formatCooldown(cooldownMs as number)}` : "Run pipeline"}
        </Button>
      </div>

      <PipelineDiagram taskStatuses={taskStatusMap(run?.tasks)} />

      <div>
        <h4 className="mb-2 font-display text-sm font-semibold text-foreground">Execution history</h4>
        <ExecutionHistory />
      </div>
    </div>
  );
}
