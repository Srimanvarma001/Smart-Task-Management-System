import type { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

interface MongoServerError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      issues: err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({
      error: "Validation failed",
      issues: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
    return;
  }

  const mongoError = err as MongoServerError;
  if (mongoError.code === 11000) {
    const field = Object.keys(mongoError.keyValue ?? {})[0] ?? "field";
    res.status(409).json({ error: `Duplicate value for "${field}"` });
    return;
  }

  logger.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  res.status(500).json({ error: "Internal server error" });
}