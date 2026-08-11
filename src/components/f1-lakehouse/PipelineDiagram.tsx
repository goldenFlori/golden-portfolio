import { Chip } from "@heroui/react";
import { motion } from "motion/react";
import type { TaskState } from "../../lib/pipeline";
import { listItem, rise } from "../../lib/motion";
import { ChevronDownIcon } from "../icons";
import { pipelineMeta, pipelineTasks, type PipelineLayer } from "./data";

const LAYERS: { key: PipelineLayer; label: string; description: string }[] = [
  { key: "bronze", label: "Bronze", description: "6 sources ingested in parallel" },
  { key: "silver", label: "Silver", description: "cleaned, deduped, typed" },
  { key: "gold", label: "Gold", description: "star schema — dimensions + fact" },
];

interface PipelineDiagramProps {
  /** Live per-task state from a real run (see `usePipeline`). When omitted,
   * chips fall back to the static bronze/silver/gold coloring. */
  taskStatuses?: Record<string, TaskState>;
}

/** The real 17-task medallion DAG from the full-refresh job, reproduced from
 * `resources/jobs/job_formula1_lakehouse_full_refresh.yml` — see `data.ts`. */
export function PipelineDiagram({ taskStatuses }: PipelineDiagramProps) {
  return (
    <div className="flex flex-col">
      {LAYERS.map((layer, layerIndex) => {
        const tasks = pipelineTasks.filter((t) => t.layer === layer.key);
        return (
          <div key={layer.key}>
            <motion.div {...rise(layerIndex * 0.08)} className="mb-2 flex items-baseline justify-between gap-2">
              <h4 className="font-display text-sm font-semibold text-foreground">{layer.label}</h4>
              <span className="text-xs text-muted">{layer.description}</span>
            </motion.div>
            <div className="flex flex-wrap gap-1.5">
              {tasks.map((task, i) => {
                const live = taskStatuses?.[task.key];
                const { color, variant } = chipAppearance(live, layer.key);
                return (
                  <motion.div key={task.key} {...listItem(i)}>
                    <Chip size="sm" color={color} variant={variant} className={live === "running" ? "animate-pulse" : undefined}>
                      <Chip.Label>
                        {task.label}
                        {task.dependsOn.length > 1 && (
                          <span className="ml-1 text-accent" aria-label={`joins ${task.dependsOn.length} upstream tasks`}>
                            ×{task.dependsOn.length}
                          </span>
                        )}
                      </Chip.Label>
                    </Chip>
                  </motion.div>
                );
              })}
            </div>
            {layerIndex < LAYERS.length - 1 && (
              <div className="flex justify-center py-2 text-muted" aria-hidden="true">
                <ChevronDownIcon />
              </div>
            )}
          </div>
        );
      })}
      <p className="mt-3 font-mono text-xs text-muted">
        {pipelineTasks.length} tasks · {pipelineMeta.tableCount} tables · {pipelineMeta.cluster}
      </p>
    </div>
  );
}

function chipAppearance(live: TaskState | undefined, layer: PipelineLayer): { color: "default" | "accent" | "success" | "danger"; variant: "secondary" | "soft" } {
  if (live === "success") return { color: "success", variant: "soft" };
  if (live === "failed") return { color: "danger", variant: "soft" };
  if (live === "running") return { color: "accent", variant: "soft" };
  if (live === "pending") return { color: "default", variant: "secondary" };
  return layer === "gold" ? { color: "accent", variant: "soft" } : { color: "default", variant: "secondary" };
}
