import { axiosClient, type ApiResponse } from "./axiosClient";
import type { TaskPriority } from "../features/tasks/types";

export interface ParsedTask {
  title: string;
  dueDate?: string;
  priority: TaskPriority;
  category?: string;
}

export interface TaskSummary {
  summary: string;
  flags: string[];
}

export interface TaskSuggestion {
  title: string;
  reason: string;
}

export const aiApi = {
  parseTask: async (text: string): Promise<ParsedTask> => {
    const { data } = await axiosClient.post<ApiResponse<ParsedTask>>("/ai/parse", { text });
    return data.data;
  },
  getSummary: async (): Promise<TaskSummary> => {
    const { data } = await axiosClient.get<ApiResponse<TaskSummary>>("/ai/summary");
    return data.data;
  },
  getSuggestions: async (): Promise<TaskSuggestion[]> => {
    const { data } = await axiosClient.get<ApiResponse<TaskSuggestion[]>>("/ai/suggestions");
    return data.data;
  },
};