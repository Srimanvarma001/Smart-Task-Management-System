import { Types, type FilterQuery, type FlattenMaps, type SortOrder } from "mongoose";
import { TaskModel, type ITask, type TaskPriority, type TaskStatus } from "../models/Task";
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

export interface RecentActivityItem {
  id: Types.ObjectId;
  title: string;
  status: TaskStatus;
  timestamp: Date;
}

export interface UpcomingDeadlineItem {
  id: Types.ObjectId;
  title: string;
  dueDate: Date;
  priority: TaskPriority;
}

export interface CategoryBreakdownItem {
  category: string;
  count: number;
}

export interface TaskStatsResult {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: Record<TaskPriority, number>;
  completionRate: number;
  recentActivity: RecentActivityItem[];
  upcomingDeadlines: UpcomingDeadlineItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  weeklyTrend: { completedThisWeek: number };
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

  async getTaskStats(userId: string): Promise<TaskStatsResult> {
    const userFilter: FilterQuery<ITask> = { userId: new Types.ObjectId(userId) };
    const pendingFilter: FilterQuery<ITask> = { ...userFilter, status: "pending" };
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, completed, pending, overdue, priorityCounts, recentActivity, upcomingDeadlines, categoryCounts, completedThisWeek] =
      await Promise.all([
        TaskModel.countDocuments(userFilter),
        TaskModel.countDocuments({ ...userFilter, status: "completed" }),
        TaskModel.countDocuments(pendingFilter),
        TaskModel.countDocuments({ ...pendingFilter, dueDate: { $lt: now } }),
        TaskModel.aggregate<{ _id: TaskPriority; count: number }>([
          { $match: userFilter },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        TaskModel.aggregate<RecentActivityItem>([
          { $match: userFilter },
          {
            $project: {
              _id: 0,
              id: "$_id",
              title: 1,
              status: 1,
              timestamp: { $max: ["$createdAt", "$updatedAt"] },
            },
          },
          { $sort: { timestamp: -1 } },
          { $limit: 5 },
        ]),
        TaskModel.find({ ...userFilter, dueDate: { $gt: now } })
          .sort({ dueDate: 1, _id: 1 })
          .limit(5)
          .select("title dueDate priority")
          .lean()
          .then((tasks) =>
            tasks.map((task) => ({
              id: task._id,
              title: task.title,
              dueDate: task.dueDate as Date,
              priority: task.priority,
            })),
          ),
        TaskModel.aggregate<{ _id: string | null; count: number }>([
          { $match: userFilter },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ]),
        TaskModel.countDocuments({
          ...userFilter,
          status: "completed",
          updatedAt: { $gte: sevenDaysAgo },
        }),
      ]);

    const countFor = (priority: TaskPriority): number =>
      priorityCounts.find((entry) => entry._id === priority)?.count ?? 0;

    return {
      total,
      completed,
      pending,
      overdue,
      byPriority: {
        high: countFor("high"),
        medium: countFor("medium"),
        low: countFor("low"),
      },
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
      recentActivity,
      upcomingDeadlines,
      categoryBreakdown: categoryCounts.map((entry) => ({
        category: entry._id == null || entry._id === "" ? "Uncategorized" : entry._id,
        count: entry.count,
      })),
      weeklyTrend: { completedThisWeek },
    };
  },
};