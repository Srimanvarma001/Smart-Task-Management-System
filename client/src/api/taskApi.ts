import { axiosClient } from "./axiosClient";
import type { Task } from "../features/tasks/types";

export interface TaskQueryParams {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
}

export const taskApi = {
  list: async (params?: TaskQueryParams): Promise<Task[]> => {
    const { data } = await axiosClient.get<Task[]>("/tasks", { params });
    return data;
  },
  get: async (id: string): Promise<Task> => {
    const { data } = await axiosClient.get<Task>(`/tasks/${id}`);
    return data;
  },
  create: async (payload: Partial<Task>): Promise<Task> => {
    const { data } = await axiosClient.post<Task>("/tasks", payload);
    return data;
  },
  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await axiosClient.put<Task>(`/tasks/${id}`, payload);
    return data;
  },
  updateStatus: async (id: string, status: Task["status"]): Promise<Task> => {
    const { data } = await axiosClient.patch<Task>(`/tasks/${id}/status`, { status });
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/tasks/${id}`);
  },
};