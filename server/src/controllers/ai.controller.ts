import type { Request, Response } from "express";

const notImplemented = (_req: Request, res: Response) => {
  res.status(501).json({ error: "Not implemented" });
};

export const parseTask = notImplemented;
export const getSummary = notImplemented;
export const getSuggestions = notImplemented;