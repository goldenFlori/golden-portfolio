import { useQuery } from "@tanstack/react-query";
import { fetchLatestCommits, fetchRepos } from "../lib/github";

/** Single source of truth for GitHub query keys (invalidation targets `all`). */
export const githubKeys = {
  all: ["github"] as const,
  commits: () => [...githubKeys.all, "commits"] as const,
  repos: () => [...githubKeys.all, "repos"] as const,
};

const FIVE_MINUTES = 5 * 60_000;

export function useLatestCommits() {
  return useQuery({
    queryKey: githubKeys.commits(),
    queryFn: fetchLatestCommits,
    staleTime: FIVE_MINUTES,
    retry: 1,
  });
}

export function useRepos() {
  return useQuery({
    queryKey: githubKeys.repos(),
    queryFn: fetchRepos,
    staleTime: FIVE_MINUTES,
    retry: 1,
  });
}
