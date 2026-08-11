import { useMutation, useQuery, useQueryClient, type Query } from "@tanstack/react-query";
import { fetchLatestRun, fetchRunStatus, pipelineLiveEnabled, triggerRun, type RunSummary } from "../lib/pipeline";

/** Single source of truth for pipeline query keys (mirrors `githubKeys`). */
export const pipelineKeys = {
  all: ["pipeline"] as const,
  latest: () => [...pipelineKeys.all, "latest"] as const,
  status: (runId: number) => [...pipelineKeys.all, "status", runId] as const,
};

export function useLatestRun() {
  return useQuery({
    queryKey: pipelineKeys.latest(),
    queryFn: fetchLatestRun,
    enabled: pipelineLiveEnabled,
    staleTime: 5 * 60_000,
  });
}

/** Polls every 3s while the run is in flight, stops once it's terminal. */
export function useRunStatus(runId: number | null) {
  return useQuery({
    queryKey: runId !== null ? pipelineKeys.status(runId) : [...pipelineKeys.all, "status", "idle"],
    queryFn: () => fetchRunStatus(runId as number),
    enabled: pipelineLiveEnabled && runId !== null,
    refetchInterval: (query: Query<RunSummary>) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "running" ? 3000 : false;
    },
  });
}

export function useTriggerRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerRun,
    onSuccess: (result) => {
      if ("runId" in result) {
        queryClient.invalidateQueries({ queryKey: pipelineKeys.latest() });
      }
    },
  });
}
