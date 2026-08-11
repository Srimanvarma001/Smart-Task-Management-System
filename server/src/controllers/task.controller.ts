import type { Request, Response } from "express";
import { taskService } from "../services/task.service";
import { ok } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from "../validators/task.schema";

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const filters = req.query as unknown as TaskQueryInput;
  const result = await taskService.listTasks(userId, filters);
  res.status(200).json(ok(result));
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const task = await taskService.createTask(userId, req.body as CreateTaskInput);
  res.status(201).json(ok(task));
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const task = await taskService.getTaskById(userId, req.params.id);
  res.status(200).json(ok(task));
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const task = await taskService.updateTask(userId, req.params.id, req.body as UpdateTaskInput);
  res.status(200).json(ok(task));
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const task = await taskService.toggleStatus(userId, req.params.id);
  res.status(200).json(ok(task));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await taskService.deleteTask(userId, req.params.id);
  res.status(200).json(ok({ message: "Task deleted" }));
});

export const getTaskStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const stats = await taskService.getTaskStats(userId);
  res.status(200).json(ok(stats));
});