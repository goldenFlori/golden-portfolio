import { motion } from "motion/react";
import { listItem } from "../../lib/motion";
import { goldStep } from "./palette";

interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  ariaLabel: string;
  valueFormat?: (value: number) => string;
}

/** Ranked horizontal bars, colored by the shared gold sequential ramp — the
 * client-side equivalent of the real dashboard's "plasma" ramp bar charts. */
export function BarChart({ data, ariaLabel, valueFormat = String }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div role="img" aria-label={ariaLabel} className="flex flex-col gap-2.5">
      {data.map((d, i) => {
        const rank = data.length <= 1 ? 1 : 1 - i / (data.length - 1);
        return (
          <motion.div key={d.label} {...listItem(i)} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-muted" title={d.label}>
              {d.label}
            </span>
            <div className="h-3.5 flex-1 bg-white/5">
              <div
                className="h-full rounded-r-[4px] transition-[filter] duration-150 hover:brightness-110"
                style={{ width: `${(d.value / max) * 100}%`, background: goldStep(rank) }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">
              {valueFormat(d.value)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
