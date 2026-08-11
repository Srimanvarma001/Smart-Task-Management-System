import { useQuery } from "@tanstack/react-query";
import { taskApi } from "../../../api/taskApi";
import type { TaskFilters, TaskListResponse } from "../types";

export function useTasks(filters: TaskFilters) {
  return useQuery<TaskListResponse>({
    queryKey: ["tasks", filters],
    queryFn: () => taskApi.listTasks(filters),
  });
}