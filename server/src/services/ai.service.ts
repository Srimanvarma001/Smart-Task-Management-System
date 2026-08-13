import { Types } from "mongoose";
import { callDeepSeek } from "../config/deepseek";
import { TaskModel } from "../models/Task";
import { AppError } from "../utils/AppError";

const PRIORITIES = ["low", "medium", "high"] as const;
type Priority = (typeof PRIORITIES)[number];

type InferredPriority = "High" | "Medium" | "Low";

const INFERRED_PRIORITIES: InferredPriority[] = ["High", "Medium", "Low"];

export interface ParsedTask {
  title: string;
  dueDate?: string;
  priority: Priority;
  category?: string;
}

export interface TaskSummary {
  summary: string;
  flags: string[];
}

export interface TaskSuggestion {
  title: string;
  reason: string;
}

interface OpenTaskRow {
  _id: Types.ObjectId;
  title: string;
  dueDate?: Date;
  priority?: Priority;
  status?: "pending" | "completed";
}

const CACHE_TTL_MS = 15 * 60 * 1000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function setCache(key: string, value: unknown): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function compactTaskList(tasks: OpenTaskRow[]): Array<{ title: string; dueDate?: string; priority?: Priority }> {
  return tasks.map((task) => ({
    title: task.title,
    ...(task.dueDate ? { dueDate: task.dueDate.toISOString() } : {}),
    ...(task.priority ? { priority: task.priority } : {}),
  }));
}

async function fetchOpenTasks(userId: string): Promise<OpenTaskRow[]> {
  const rows = await TaskModel.find({ userId: new Types.ObjectId(userId) });
  const tasks = rows as unknown as OpenTaskRow[];
  return tasks.filter((task) => task.status !== "completed");
}

function requireText(text: string): void {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new AppError(400, "text is required");
  }
}

function normalizeDueDate(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value !== "string") throw new AppError(502, "AI returned an invalid dueDate");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AppError(502, "AI returned an invalid dueDate");
  return date.toISOString();
}

export async function inferTags(title: string, description?: string): Promise<string[]> {
  const userContent =
    typeof description === "string" && description.trim().length > 0
      ? `Title: ${title}\nDescription: ${description}`
      : `Title: ${title}`;

  try {
    const raw = await callDeepSeek(
      [
        {
          role: "system",
          content:
            'You are a task tagging assistant. Given a task title (and optional description), return 2-4 short, lowercase, single-or-two-word tags relevant to the task\'s topic or context (e.g. "work", "personal", "urgent-followup", "shopping"). Respond with ONLY a JSON array of strings, nothing else. No prose, no markdown fences.',
        },
        { role: "user", content: userContent },
      ],
      { maxTokens: 50 },
    );

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const tags: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string" || item.trim().length === 0) continue;
      const normalized = item.trim().toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      tags.push(normalized);
      if (tags.length >= 5) break;
    }
    return tags;
  } catch {
    return [];
  }
}

export async function inferPriority(title: string, description?: string): Promise<InferredPriority> {
  const userContent =
    typeof description === "string" && description.trim().length > 0
      ? `Title: ${title}\nDescription: ${description}`
      : `Title: ${title}`;

  try {
    const raw = await callDeepSeek(
      [
        {
          role: "system",
          content:
            "You are a task prioritization assistant. Given a task title (and optional description), classify the task's priority based on the urgency and importance implied by the wording. Return ONLY one word: High, Medium, or Low. No JSON, no explanation, no punctuation.",
        },
        { role: "user", content: userContent },
      ],
      { maxTokens: 10 },
    );

    const normalized = raw.trim().toLowerCase();
    return INFERRED_PRIORITIES.find((priority) => priority.toLowerCase() === normalized) ?? "Medium";
  } catch {
    return "Medium";
  }
}

export const aiService = {
  async parseTaskFromText(_userId: string, text: string): Promise<ParsedTask> {
    requireText(text);

    const today = new Date().toISOString().split("T")[0];

    const raw = await callDeepSeek(
      [
        {
          role: "system",
          content:
            "Today's date is " +
            today +
            ". Use this as the reference point for resolving any relative dates mentioned in the task text (e.g. 'tomorrow', 'friday', 'next week'). You are a task parsing assistant. Extract the task from the user's free text and return STRICT JSON ONLY with exactly these fields: title (string, required), dueDate (ISO 8601 string or null), priority (" +
            PRIORITIES.join(", ") +
            " or null), category (short string or null). No prose, no markdown fences, no code blocks.",
        },
        { role: "user", content: text },
      ],
      { maxTokens: 200, json: true },
    );

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new AppError(502, "AI returned malformed JSON");
    }

    const title = parsed.title;
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new AppError(502, "AI returned an invalid task title");
    }

    const priority = parsed.priority ?? "medium";
    if (!PRIORITIES.includes(priority as Priority)) {
      throw new AppError(502, "AI returned an invalid priority");
    }

    const dueDate = normalizeDueDate(parsed.dueDate);

    return {
      title: title.trim(),
      priority: priority as Priority,
      ...(dueDate ? { dueDate } : {}),
      ...(typeof parsed.category === "string" && parsed.category.trim().length > 0
        ? { category: parsed.category.trim() }
        : {}),
    };
  },

  async getSummary(userId: string): Promise<TaskSummary> {
    const cached = getCached<TaskSummary>(`summary:${userId}`);
    if (cached) return cached;

    const openTasks = await fetchOpenTasks(userId);

    if (openTasks.length === 0) {
      const empty: TaskSummary = { summary: "You have no open tasks right now.", flags: [] };
      setCache(`summary:${userId}`, empty);
      return empty;
    }

    const raw = await callDeepSeek(
      [
        {
          role: "system",
          content:
            "You are a productivity assistant. Given a compact JSON list of the user's open tasks (title, dueDate, priority), write a short natural-language summary (2-3 sentences) and flag risks such as overdue tasks or an overloaded day. Return STRICT JSON ONLY: {\"summary\": string, \"flags\": string[]}. No prose, no markdown fences.",
        },
        { role: "user", content: JSON.stringify(compactTaskList(openTasks)) },
      ],
      { maxTokens: 300, json: true },
    );

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new AppError(502, "AI returned malformed JSON");
    }

    if (typeof parsed.summary !== "string" || parsed.summary.length === 0) {
      throw new AppError(502, "AI returned an invalid summary");
    }
    const flags = Array.isArray(parsed.flags)
      ? parsed.flags.filter((flag): flag is string => typeof flag === "string")
      : [];

    const result: TaskSummary = { summary: parsed.summary, flags };
    setCache(`summary:${userId}`, result);
    return result;
  },

  async getSuggestions(userId: string): Promise<TaskSuggestion[]> {
    const cached = getCached<TaskSuggestion[]>(`suggestions:${userId}`);
    if (cached) return cached;

    const openTasks = await fetchOpenTasks(userId);

    if (openTasks.length === 0) {
      setCache(`suggestions:${userId}`, []);
      return [];
    }

    const raw = await callDeepSeek(
      [
        {
          role: "system",
          content:
            "You are a productivity assistant. Given a compact JSON list of the user's open tasks (title, dueDate, priority), rank them by urgency, priority, and due date, and return the top 3 as STRICT JSON ONLY: an array of exactly 3 objects, each {\"title\": string, \"reason\": string} where reason is one short line explaining the ranking. No prose, no markdown fences.",
        },
        { role: "user", content: JSON.stringify(compactTaskList(openTasks)) },
      ],
      { maxTokens: 300, json: true },
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new AppError(502, "AI returned malformed JSON");
    }

    const list = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" &&
          parsed !== null &&
          Array.isArray((parsed as { suggestions?: unknown }).suggestions)
        ? (parsed as { suggestions: unknown[] }).suggestions
        : null;

    if (!list) {
      throw new AppError(502, "AI returned an invalid suggestion list");
    }

    const suggestions: TaskSuggestion[] = list
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      )
      .map((item) => ({ title: String(item.title), reason: String(item.reason) }))
      .filter((item) => item.title.trim().length > 0 && item.reason.trim().length > 0)
      .slice(0, 3);

    if (suggestions.length === 0) {
      throw new AppError(502, "AI returned an invalid suggestion list");
    }

    setCache(`suggestions:${userId}`, suggestions);
    return suggestions;
  },
};