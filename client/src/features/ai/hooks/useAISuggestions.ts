import { useQuery } from "@tanstack/react-query";
import { aiApi } from "../../../api/aiApi";

export function useAISuggestions() {
  return useQuery({
    queryKey: ["ai", "suggestions"],
    queryFn: () => aiApi.suggestions(),
  });
}