import type { Request, Response } from "express";

const notImplemented = (_req: Request, res: Response) => {
  res.status(501).json({ error: "Not implemented" });
};

export const register = notImplemented;
export const login = notImplemented;
export const getMe = notImplemented;