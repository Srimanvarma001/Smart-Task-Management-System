import { Types, type FilterQuery, type FlattenMaps, type SortOrder } from "mongoose";
import { TaskModel, type ITask } from "../models/Task";
import { AppError } from "../utils/AppError";
import type { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from "../validators/task.schema";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertValidTaskId(taskId: string): void {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(404, "Task not found");
  }
}

export interface TaskListResult {
  tasks: Array<FlattenMaps<ITask> & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date }>;
  total: number;
  page: number;
  totalPages: number;
}

export const taskService = {
  async listTasks(userId: string, filters: TaskQueryInput): Promise<TaskListResult> {
    const query: FilterQuery<ITask> = { userId: new Types.ObjectId(userId) };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.search) {
      query.title = { $regex: escapeRegex(filters.search), $options: "i" };
    }

    const direction: SortOrder = filters.order === "asc" ? 1 : -1;
    const sort: Record<string, SortOrder> = { [filters.sort]: direction, _id: direction };

    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      TaskModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      TaskModel.countDocuments(query),
    ]);

    return { tasks, total, page, totalPages: Math.ceil(total / limit) };
  },

  async createTask(userId: string, data: CreateTaskInput) {
    return TaskModel.create({ ...data, userId: new Types.ObjectId(userId) });
  },

  async getTaskById(userId: string, taskId: string) {
    assertValidTaskId(taskId);
    const task = await TaskModel.findOne({ _id: taskId, userId: new Types.ObjectId(userId) }).lean();
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    return task;
  },

  async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    assertValidTaskId(taskId);
    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    return task;
  },

  async toggleStatus(userId: string, taskId: string) {
    assertValidTaskId(taskId);
    const task = await TaskModel.findOne({ _id: taskId, userId: new Types.ObjectId(userId) });
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    task.status = task.status === "completed" ? "pending" : "completed";
    await task.save();
    return task.toObject();
  },

  async deleteTask(userId: string, taskId: string) {
    assertValidTaskId(taskId);
    const task = await TaskModel.findOneAndDelete({
      _id: taskId,
      userId: new Types.ObjectId(userId),
    });
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    return task.toObject();
  },
};