import type { Request, Response } from "express";

const notImplemented = (_req: Request, res: Response) => {
  res.status(501).json({ error: "Not implemented" });
};

export const listTasks = notImplemented;
export const createTask = notImplemented;
export const getTask = notImplemented;
export const updateTask = notImplemented;
export const updateTaskStatus = notImplemented;
export const deleteTask = notImplemented;