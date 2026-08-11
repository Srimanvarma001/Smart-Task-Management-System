import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type ValidateTarget = "body" | "query";

export const validate =
  (schema: ZodSchema, target: ValidateTarget = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const source = target === "query" ? req.query : req.body;
    const result = schema.safeParse(source);
    if (!result.success) {
      res.status(400).json({ error: "Validation failed", issues: result.error.issues });
      return;
    }
    if (target === "query") {
      req.query = result.data as Request["query"];
    } else {
      req.body = result.data;
    }
    next();
  };