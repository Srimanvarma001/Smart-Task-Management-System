import { useState } from "react";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { useTaskFade } from "../hooks/useTaskFade";
import { useDeleteTask, useToggleTaskStatus } from "../hooks/useTaskMutations";
import type { Task, TaskPriority } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  fadeWhenCompleted?: boolean;
  onFadeComplete?: (taskId: string) => void;
}

const priorityBorder: Record<TaskPriority, string> = {
  low: "border-l-priorityLow",
  medium: "border-l-priorityMedium",
  high: "border-l-priorityHigh",
};

const priorityBadge: Record<TaskPriority, string> = {
  low: "bg-priorityLow/15 text-priorityLow dark:bg-priorityLow/25 dark:text-priorityLow",
  medium: "bg-priorityMedium/15 text-priorityMedium dark:bg-priorityMedium/25 dark:text-priorityMedium",
  high: "bg-priorityHigh/15 text-priorityHigh dark:bg-priorityHigh/25 dark:text-priorityHigh",
};

const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return dueDate;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TaskCard({ task, onEdit, fadeWhenCompleted = false, onFadeComplete }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const toggleStatus = useToggleTaskStatus();
  const deleteTask = useDeleteTask();

  const completed = task.status === "completed";
  const fadeEnabled = completed && fadeWhenCompleted && Boolean(onFadeComplete);
  const fading = useTaskFade(task._id, fadeEnabled, onFadeComplete);
  const meta = [
    task.dueDate ? `Due ${formatDueDate(task.dueDate)}` : null,
    task.category,
    task.tags.length > 0 ? task.tags.join(", ") : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join("  \u00b7  ");

  const handleToggle = () => {
    toggleStatus.mutate(task._id);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteTask.mutateAsync(task._id);
      setConfirmDelete(false);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, "Unable to delete task. Please try again."));
    }
  };

  return (
    <li className="list-none">
      <div
        className={`flex items-start gap-3 rounded-sm border border-ink/10 border-l-4 bg-white px-3 py-2 motion-safe:transition-opacity motion-safe:duration-700 dark:border-paper/10 dark:bg-ink ${
          priorityBorder[task.priority]
        } ${fading ? "opacity-0" : completed ? "opacity-60" : ""}`}
      >
        <input
          type="checkbox"
          checked={completed}
          onChange={handleToggle}
          aria-label={completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
          className="mt-1 h-4 w-4 shrink-0 accent-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={handleToggle}
            className={`block w-full text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
              completed ? "line-through text-ink/50 dark:text-paper/50" : ""
            }`}
          >
            {task.title}
          </button>
          {task.description && (
            <p
              className={`mt-0.5 text-sm ${
                completed ? "text-ink/40 dark:text-paper/40" : "text-ink/70 dark:text-paper/70"
              }`}
            >
              {task.description}
            </p>
          )}
          {meta && (
            <p
              className={`mt-0.5 font-mono text-xs ${
                completed ? "text-ink/40 dark:text-paper/40" : "text-ink/50 dark:text-paper/50"
              }`}
            >
              {meta}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            aria-label={`Priority ${priorityLabel[task.priority]}`}
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${priorityBadge[task.priority]}`}
          >
            {priorityLabel[task.priority]}
          </span>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded px-1.5 py-0.5 font-mono text-xs text-ink/60 hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:text-paper/60 dark:hover:bg-paper/10 dark:hover:text-paper"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded px-1.5 py-0.5 font-mono text-xs text-ink/60 hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:text-paper/60 dark:hover:bg-paper/10 dark:hover:text-paper"
          >
            Delete
          </button>
        </div>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <h3 className="font-display text-xl">Delete task</h3>
        <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
          &ldquo;{task.title}&rdquo; will be permanently deleted. This can&apos;t be undone.
        </p>
        {deleteError && (
          <p role="alert" className="mt-3 rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {deleteError}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded border border-ink/20 px-4 py-2 text-sm text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/20 dark:text-paper dark:hover:bg-paper/10"
          >
            Cancel
          </button>
          <Button type="button" onClick={() => void handleDelete()} disabled={deleteTask.isPending}>
            {deleteTask.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </li>
  );
}