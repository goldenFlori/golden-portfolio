import { Chip } from "@heroui/react";
import { motion } from "motion/react";
import { usePipelineHistory } from "../../hooks/usePipeline";
import type { RunStatus } from "../../lib/pipeline";
import { listItem } from "../../lib/motion";
import { EmptyNote, ErrorNote, LoadingRows } from "./states";

const STATUS_COLOR: Record<RunStatus, "default" | "accent" | "success" | "danger"> = {
  pending: "default",
  running: "accent",
  success: "success",
  failed: "danger",
};

function formatDate(iso: string | null): string {
  if (!iso) return "unknown";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "in progress";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

/** Read-only list of real Databricks job runs — always visible (no trigger
 * button yet, that's stage 3), proving the pipeline runs without anyone
 * having to click anything. */
export function ExecutionHistory() {
  const history = usePipelineHistory();

  if (history.isPending) return <LoadingRows />;
  if (history.isError) return <ErrorNote />;
  if (history.data.length === 0) return <EmptyNote />;

  return (
    <ul className="flex flex-col">
      {history.data.map((run, i) => (
        <motion.li
          key={run.id}
          className="flex items-center justify-between gap-2 border-b border-border py-2.5 last:border-b-0"
          {...listItem(i)}
        >
          <span className="flex items-center gap-2">
            <Chip size="sm" color={STATUS_COLOR[run.status]}>
              <Chip.Label>{run.status}</Chip.Label>
            </Chip>
            <span className="text-xs text-muted">{formatDate(run.startedAt)}</span>
          </span>
          <span className="font-mono text-xs text-muted">{formatDuration(run.durationSeconds)}</span>
        </motion.li>
      ))}
    </ul>
  );
}
