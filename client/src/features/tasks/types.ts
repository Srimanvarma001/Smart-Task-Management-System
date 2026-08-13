export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";
export type TaskSort = "createdAt" | "dueDate" | "priority";
export type SortOrder = "asc" | "desc";

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  tags: string[];
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sort?: TaskSort;
  order?: SortOrder;
  page?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  aiGenerated?: boolean;
  category?: string;
  tags?: string[];
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;