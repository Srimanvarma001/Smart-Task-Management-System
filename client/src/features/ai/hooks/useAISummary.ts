import { useQuery } from "@tanstack/react-query";
import { aiApi, type TaskSummary } from "../../../api/aiApi";

const AI_INSIGHTS_STALE_MS = 15 * 60 * 1000;

export function useAISummary() {
  return useQuery<TaskSummary>({
    queryKey: ["ai", "summary"],
    queryFn: () => aiApi.getSummary(),
    staleTime: AI_INSIGHTS_STALE_MS,
  });
}