import { axiosClient, type ApiResponse } from "./axiosClient";
import type {
  CreateTaskPayload,
  Task,
  TaskFilters,
  TaskListResponse,
  UpdateTaskPayload,
} from "../features/tasks/types";

export const taskApi = {
  listTasks: async (filters: TaskFilters): Promise<TaskListResponse> => {
    const { data } = await axiosClient.get<ApiResponse<TaskListResponse>>("/tasks", {
      params: filters,
    });
    return data.data;
  },
  getTask: async (id: string): Promise<Task> => {
    const { data } = await axiosClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data;
  },
  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await axiosClient.post<ApiResponse<Task>>("/tasks", payload);
    return data.data;
  },
  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await axiosClient.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },
  toggleTaskStatus: async (id: string): Promise<Task> => {
    const { data } = await axiosClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`);
    return data.data;
  },
  deleteTask: async (id: string): Promise<void> => {
    await axiosClient.delete(`/tasks/${id}`);
  },
};