import { motion } from "motion/react";
import { listItem } from "../../lib/motion";
import { CARD_SURFACE, CATEGORICAL } from "./palette";

interface PieDatum {
  label: string;
  value: number;
}

interface PieChartProps {
  data: PieDatum[];
  ariaLabel: string;
}

/** Categorical pie + legend. Values are direct-labeled in the legend, not
 * hover-gated, so every value is reachable without a pointer. */
export function PieChart({ data, ariaLabel }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let cursor = 0;
  const stops = data.map((d, i) => {
    const start = (cursor / total) * 360;
    cursor += d.value;
    const end = (cursor / total) * 360;
    return `${CATEGORICAL[i % CATEGORICAL.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex items-center gap-5">
      <div
        role="img"
        aria-label={ariaLabel}
        className="h-24 w-24 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${stops.join(", ")})`,
          boxShadow: `0 0 0 2px ${CARD_SURFACE}`,
        }}
      />
      <ul className="flex flex-1 flex-col gap-1.5">
        {data.map((d, i) => (
          <motion.li key={d.label} {...listItem(i)} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ background: CATEGORICAL[i % CATEGORICAL.length] }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-muted">{d.label}</span>
            <span className="font-mono tabular-nums text-foreground">
              {d.value} · {Math.round((d.value / total) * 100)}%
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
