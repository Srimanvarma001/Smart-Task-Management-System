import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../../../api/taskApi";
import type { Task } from "../types";

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const invalidateTasks = () => {
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createTask = useMutation({
    mutationFn: (payload: Partial<Task>) => taskApi.create(payload),
    onSuccess: invalidateTasks,
  });

  const updateTask = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Task> }) =>
      taskApi.update(id, payload),
    onSuccess: invalidateTasks,
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task["status"] }) =>
      taskApi.updateStatus(id, status),
    onSuccess: invalidateTasks,
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskApi.remove(id),
    onSuccess: invalidateTasks,
  });

  return { createTask, updateTask, updateTaskStatus, deleteTask };
}