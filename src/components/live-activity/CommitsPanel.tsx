import { Chip, Link } from "@heroui/react";
import { motion } from "motion/react";
import { useLatestCommits } from "../../hooks/useGithub";
import { relativeTime } from "../../lib/github";
import { listItem } from "../../lib/motion";
import { EmptyNote, ErrorNote, LoadingRows } from "./states";

export function CommitsPanel() {
  const commits = useLatestCommits();

  if (commits.isPending) return <LoadingRows />;
  if (commits.isError) return <ErrorNote />;
  if (commits.data.length === 0) {
    return <EmptyNote>No public pushes in the recent window.</EmptyNote>;
  }

  return (
    <ul className="flex flex-col">
      {commits.data.map((commit, i) => (
        <motion.li
          key={commit.url}
          className="flex flex-col gap-0.5 border-b border-border py-2.5 last:border-b-0"
          {...listItem(i)}
        >
          <Link href={commit.url} target="_blank" className="text-sm text-foreground">
            {commit.message}
          </Link>
          <span className="flex items-center gap-2 font-mono text-xs text-muted">
            <Chip size="sm" color="default">
              <Chip.Label>{commit.repo}</Chip.Label>
            </Chip>
            {commit.sha} · {relativeTime(commit.date)}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
