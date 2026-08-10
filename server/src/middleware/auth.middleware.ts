import type { NextFunction, Request, Response } from "express";

export function authenticate(_req: Request, _res: Response, next: NextFunction): void {
  next();
}