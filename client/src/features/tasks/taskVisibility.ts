import type { Task } from "./types";

const hiddenCompletedIds: Set<string> = new Set();

export function hideTask(taskId: string): void {
  hiddenCompletedIds.add(taskId);
}

export function getHiddenTaskIds(): Set<string> {
  return hiddenCompletedIds;
}

export function pruneHiddenTaskIds(tasks: Task[]): boolean {
  let changed = false;
  for (const task of tasks) {
    if (task.status !== "completed" && hiddenCompletedIds.delete(task._id)) {
      changed = true;
    }
  }
  return changed;
}