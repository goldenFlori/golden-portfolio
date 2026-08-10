import { Chip, Link } from "@heroui/react";
import { motion } from "motion/react";
import { useRepos } from "../../hooks/useGithub";
import { relativeTime } from "../../lib/github";
import { listItem } from "../../lib/motion";
import { ErrorNote, LoadingRows } from "./states";

export function ReposPanel() {
  const repos = useRepos();

  if (repos.isPending) return <LoadingRows />;
  if (repos.isError) return <ErrorNote />;

  return (
    <ul className="flex flex-col">
      {repos.data.map((repo, i) => (
        <motion.li
          key={repo.id}
          className="flex flex-col gap-0.5 border-b border-border py-2.5 last:border-b-0"
          {...listItem(i)}
        >
          <span className="flex items-center gap-2">
            <Link
              href={repo.html_url}
              target="_blank"
              className="text-sm font-medium text-foreground"
            >
              {repo.name}
            </Link>
            {repo.language && (
              <Chip size="sm" color="accent">
                <Chip.Label>{repo.language}</Chip.Label>
              </Chip>
            )}
          </span>
          {repo.description && (
            <span className="text-xs text-muted">{repo.description}</span>
          )}
          <span className="font-mono text-xs text-muted">
            pushed {relativeTime(repo.pushed_at)}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
