import { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { useLatestRun, useRunStatus, useTriggerRun } from "../../hooks/usePipeline";
import { pipelineLiveEnabled, type RunSummary } from "../../lib/pipeline";
import { PipelineDiagram } from "./PipelineDiagram";

function formatDate(ms: number | undefined): string {
  if (!ms) return "unknown";
  return new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function taskStatusMap(run: RunSummary | undefined) {
  return run ? Object.fromEntries(run.tasks.map((t) => [t.key, t.status])) : undefined;
}

/** Pipeline tab content. Owns the trigger/poll/rate-limit state; falls back
 * to the plain static `PipelineDiagram` until a Worker URL is configured —
 * see `lib/pipeline.ts`'s `pipelineLiveEnabled`. */
export function LiveRunPanel() {
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [cooldownMs, setCooldownMs] = useState<number | null>(null);

  const latest = useLatestRun();
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
          Live triggering isn't connected yet — the Databricks workspace is being re-provisioned (see the
          note in <code>worker/README.md</code>). This is the pipeline's real, verified design; the data
          below is a recreation, not a live run.
        </p>
        <PipelineDiagram />
      </div>
    );
  }

  const cachedRun = latest.data && "runId" in latest.data ? latest.data : undefined;
  const displayRun = activeStatus.data ?? cachedRun;
  const isRunning = displayRun?.status === "pending" || displayRun?.status === "running";
  const isCoolingDown = cooldownMs !== null && cooldownMs > 0;

  const handleRun = () => {
    trigger.mutate(undefined, {
      onSuccess: (result) => {
        if ("runId" in result) {
          setActiveRunId(result.runId);
          setCooldownMs(null);
        } else {
          setCooldownMs(result.retryAfterMs);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white/5 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          {displayRun ? (
            <>
              <Chip size="sm" color={displayRun.status === "success" ? "success" : displayRun.status === "failed" ? "danger" : "accent"}>
                <Chip.Label>{displayRun.status}</Chip.Label>
              </Chip>
              <span>last verified run: {formatDate(displayRun.endTime)}</span>
            </>
          ) : (
            <span>No verified run yet.</span>
          )}
        </div>
        <Button size="sm" variant="primary" isDisabled={isRunning || trigger.isPending || isCoolingDown} onPress={handleRun}>
          {isRunning ? "Running…" : isCoolingDown ? `Retry in ${Math.ceil((cooldownMs as number) / 60_000)}m` : "Run pipeline"}
        </Button>
      </div>

      <PipelineDiagram taskStatuses={taskStatusMap(displayRun)} />

      {displayRun?.tables && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
          {Object.entries(displayRun.tables).map(([table, count]) => (
            <span key={table}>
              {table}: {count >= 0 ? count.toLocaleString() : "—"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
