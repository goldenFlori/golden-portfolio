import { Skeleton } from "@heroui/react";

/** Loading/error/empty for ExecutionHistory — module-scoped like
 * live-activity/states.tsx, not shared: the copy differs enough ("backend
 * unavailable" vs. "GitHub didn't answer") that a shared generic version
 * would need parameterizing, which is premature for two call sites. */
export function LoadingRows() {
  return (
    <div className="flex flex-col gap-3 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <Skeleton className="h-3 w-2/5 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ErrorNote() {
  return (
    <p className="py-3 text-sm text-muted">
      Backend didn't answer — it may still be waking up from scale-to-zero (Container Apps cold starts
      can take a few seconds). Refreshing usually fixes it.
    </p>
  );
}

export function EmptyNote() {
  return <p className="py-3 text-sm text-muted">No verified runs yet.</p>;
}
