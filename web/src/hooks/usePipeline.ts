import { useMutation, useQuery, useQueryClient, type Query } from "@tanstack/react-query";
import {
  fetchPipelineHistory,
  fetchRunStatus,
  pipelineLiveEnabled,
  triggerRun,
  type RunStatusDetail,
} from "../lib/pipeline";

/** Single source of truth for pipeline query keys (mirrors `githubKeys`). */
export const pipelineKeys = {
  all: ["pipeline"] as const,
  history: () => [...pipelineKeys.all, "history"] as const,
  status: (runId: number) => [...pipelineKeys.all, "status", runId] as const,
};

export function usePipelineHistory() {
  return useQuery({
    queryKey: pipelineKeys.history(),
    queryFn: fetchPipelineHistory,
    enabled: pipelineLiveEnabled,
    staleTime: 60_000,
    // The API's own HttpClient already retries the Databricks call
    // server-side (AddStandardResilienceHandler) — TanStack Query's default
    // of 3 retries would stack on top of that and turn one ~6s failure into
    // a ~30s wait before the error state ever shows. One retry here is
    // still enough to ride out a dropped connection to the API itself.
    retry: 1,
  });
}

/** Polls every 3s while the run is in flight, stops once it's terminal. */
export function useRunStatus(runId: number | null) {
  return useQuery({
    queryKey: runId !== null ? pipelineKeys.status(runId) : [...pipelineKeys.all, "status", "idle"],
    queryFn: () => fetchRunStatus(runId as number),
    enabled: pipelineLiveEnabled && runId !== null,
    retry: 1,
    refetchInterval: (query: Query<RunStatusDetail>) => {
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
      if (result.kind === "started" || result.kind === "attached") {
        queryClient.invalidateQueries({ queryKey: pipelineKeys.history() });
      }
    },
  });
}
