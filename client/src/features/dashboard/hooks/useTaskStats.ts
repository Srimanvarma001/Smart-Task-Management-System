import { useQuery } from "@tanstack/react-query";
import { taskApi, type TaskStats } from "../../../api/taskApi";

export function useTaskStats() {
  return useQuery<TaskStats>({
    queryKey: ["tasks", "stats"],
    queryFn: () => taskApi.getTaskStats(),
  });
}