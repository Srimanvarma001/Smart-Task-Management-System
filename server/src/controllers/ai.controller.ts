import type { Request, Response } from "express";
import { aiService } from "../services/ai.service";
import { ok } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const parseTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { text } = req.body as { text: string };
  const result = await aiService.parseTaskFromText(userId, text);
  res.status(200).json(ok(result));
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const result = await aiService.getSummary(userId);
  res.status(200).json(ok(result));
});

export const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const result = await aiService.getSuggestions(userId);
  res.status(200).json(ok(result));
});