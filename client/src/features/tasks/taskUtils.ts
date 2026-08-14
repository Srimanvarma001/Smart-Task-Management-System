import type { Task, TaskPriority } from "./types";

export const priorityBorder: Record<TaskPriority, string> = {
  low: "border-l-priorityLow",
  medium: "border-l-priorityMedium",
  high: "border-l-priorityHigh",
};

export const priorityBadge: Record<TaskPriority, string> = {
  low: "bg-priorityLow/15 text-priorityLow dark:bg-priorityLow/25 dark:text-priorityLow",
  medium: "bg-priorityMedium/15 text-priorityMedium dark:bg-priorityMedium/25 dark:text-priorityMedium",
  high: "bg-priorityHigh/15 text-priorityHigh dark:bg-priorityHigh/25 dark:text-priorityHigh",
};

export const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return dueDate;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDueDate(dueDate: string | undefined): Date | null {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isTaskOverdue(task: Pick<Task, "status" | "dueDate">): boolean {
  if (task.status === "completed") return false;
  const due = parseDueDate(task.dueDate);
  return due !== null && due < startOfToday();
}

export function isTaskDueToday(task: Pick<Task, "dueDate">): boolean {
  const due = parseDueDate(task.dueDate);
  const start = startOfToday();
  const tomorrow = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
  return due !== null && due >= start && due < tomorrow;
}
