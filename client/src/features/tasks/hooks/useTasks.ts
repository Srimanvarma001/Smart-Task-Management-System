import { useQuery } from "@tanstack/react-query";
import { taskApi } from "../../../api/taskApi";
import type { Task, TaskPriority, TaskStatus } from "../types";

interface UseTasksOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  search?: string;
}

export function useTasks(options: UseTasksOptions = {}) {
  return useQuery<Task[]>({
    queryKey: ["tasks", options],
    queryFn: () => taskApi.list(options),
  });
}