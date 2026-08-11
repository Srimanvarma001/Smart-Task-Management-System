import { useQuery } from "@tanstack/react-query";
import { aiApi, type TaskSuggestion } from "../../../api/aiApi";

const AI_INSIGHTS_STALE_MS = 15 * 60 * 1000;

export function useAISuggestions() {
  return useQuery<TaskSuggestion[]>({
    queryKey: ["ai", "suggestions"],
    queryFn: () => aiApi.getSuggestions(),
    staleTime: AI_INSIGHTS_STALE_MS,
  });
}