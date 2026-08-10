import { useQuery } from "@tanstack/react-query";
import { aiApi } from "../../../api/aiApi";

export function useAISummary() {
  return useQuery({
    queryKey: ["ai", "summary"],
    queryFn: () => aiApi.summary(),
  });
}