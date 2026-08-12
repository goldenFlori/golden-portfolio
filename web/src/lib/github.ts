const API = "https://api.github.com";

export const GITHUB_USER = "goldenFlori";

export interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

interface PushEventCommit {
  sha: string;
  message: string;
}

interface GithubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: { commits?: PushEventCommit[] };
}

export interface CommitEntry {
  sha: string;
  message: string;
  repo: string;
  date: string;
  url: string;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GitHub API responded with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Six most recently pushed, non-fork repositories. */
export async function fetchRepos(): Promise<Repo[]> {
  const repos = await getJson<Repo[]>(
    `/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
  );
  return repos
    .filter((r) => !r.fork)
    .sort(
      (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
    )
    .slice(0, 6);
}

/** Latest commits pulled from the public events feed (most recent first). */
export async function fetchLatestCommits(): Promise<CommitEntry[]> {
  const events = await getJson<GithubEvent[]>(
    `/users/${GITHUB_USER}/events/public?per_page=50`,
  );
  const entries: CommitEntry[] = [];
  for (const event of events) {
    if (event.type !== "PushEvent" || !event.payload.commits) continue;
    // Commits inside a push are oldest-first; reverse so newest leads.
    for (const commit of [...event.payload.commits].reverse()) {
      entries.push({
        sha: commit.sha.slice(0, 7),
        message: commit.message.split("\n")[0],
        repo: event.repo.name.replace(`${GITHUB_USER}/`, ""),
        date: event.created_at,
        url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
      });
      if (entries.length >= 8) return entries;
    }
  }
  return entries;
}

export function relativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(months / 12), "year");
}
