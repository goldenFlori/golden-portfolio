import { useQuery } from "@tanstack/react-query";
import { fetchPipelineHistory, pipelineLiveEnabled } from "../lib/pipeline";

/** Single source of truth for pipeline query keys (mirrors `githubKeys`). */
export const pipelineKeys = {
  all: ["pipeline"] as const,
  history: () => [...pipelineKeys.all, "history"] as const,
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
