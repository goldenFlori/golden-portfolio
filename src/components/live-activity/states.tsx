import { Link, Skeleton } from "@heroui/react";
import { GITHUB_USER } from "../../lib/github";

export function LoadingRows() {
  return (
    <div className="flex flex-col gap-3 py-2">
      {[0, 1, 2, 3].map((i) => (
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
      GitHub didn't answer — likely a rate limit.{" "}
      <Link href={`https://github.com/${GITHUB_USER}`} target="_blank">
        Open the profile instead
      </Link>
    </p>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-sm text-muted">{children}</p>;
}
