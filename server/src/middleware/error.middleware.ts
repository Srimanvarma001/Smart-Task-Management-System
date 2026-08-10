import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error(err.message);
  res.status(500).json({ error: "Internal server error" });
}