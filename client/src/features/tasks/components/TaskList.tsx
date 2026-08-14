import Spinner from "../../../components/ui/Spinner";
import TaskCard from "./TaskCard";
import type { Task } from "../types";

interface TaskListProps {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
  onEdit: (task: Task) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onClearFilters: () => void;
}

const emptyBoxClasses =
  "rounded-sm border border-dashed border-ink/20 p-8 text-center dark:border-paper/20";

export default function TaskList({
  tasks,
  total,
  page,
  totalPages,
  isLoading,
  error,
  hasActiveFilters,
  onEdit,
  onPageChange,
  onRetry,
  onClearFilters,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={emptyBoxClasses}>
        <h3 className="font-display text-lg">Couldn&apos;t load tasks</h3>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">{error.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded bg-focus px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Try again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={emptyBoxClasses}>
        <h3 className="font-display text-lg font-medium">
          {hasActiveFilters ? "No tasks match these filters" : "No tasks yet"}
        </h3>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          {hasActiveFilters
            ? "Try adjusting or clearing your filters."
            : "Create your first task to get started."}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 rounded border border-ink/20 px-4 py-2 text-sm text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/20 dark:text-paper dark:hover:bg-paper/10"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-1">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onEdit={onEdit} />
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-ink/50 dark:text-paper/50">
          {total} task{total === 1 ? "" : "s"}
        </p>
        {totalPages > 1 && (
          <nav className="flex items-center gap-2" aria-label="Task list pagination">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded border border-ink/20 px-3 py-1.5 font-mono text-xs text-ink hover:bg-ink/5 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/20 dark:text-paper dark:hover:bg-paper/10"
            >
              Previous
            </button>
            <span className="font-mono text-xs text-ink/60 dark:text-paper/60">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded border border-ink/20 px-3 py-1.5 font-mono text-xs text-ink hover:bg-ink/5 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/20 dark:text-paper dark:hover:bg-paper/10"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}