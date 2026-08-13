import { useEffect, useState } from "react";
import type { TaskFilters, TaskPriority, TaskStatus } from "../types";

interface TaskFiltersProps {
  filters: TaskFilters;
  categories: string[];
  hasActiveFilters: boolean;
  onChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
}

const selectClass =
  "rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus dark:border-paper/20 dark:bg-ink dark:text-paper";

const statusValues: Array<{ value: TaskStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const priorityValues: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function TaskFilters({
  filters,
  categories,
  hasActiveFilters,
  onChange,
  onClearFilters,
}: TaskFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [lastExternalSearch, setLastExternalSearch] = useState(filters.search);
  if (lastExternalSearch !== filters.search) {
    setLastExternalSearch(filters.search);
    setSearch(filters.search ?? "");
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (search !== (filters.search ?? "")) {
        onChange({ ...filters, search: search || undefined, page: 1 });
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search, filters, onChange]);

  const update = (patch: Partial<TaskFilters>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  return (
    <div className="flex flex-wrap items-end gap-2" role="group" aria-label="Task filters">
      <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1">
        <label htmlFor="filter-search" className="font-mono text-xs text-ink/50 dark:text-paper/50">
          Search
        </label>
        <input
          id="filter-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks"
          className={selectClass}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="filter-status" className="font-mono text-xs text-ink/50 dark:text-paper/50">
          Status
        </label>
        <select
          id="filter-status"
          value={filters.status ?? ""}
          onChange={(e) => update({ status: (e.target.value || undefined) as TaskStatus | undefined })}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {statusValues.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="filter-priority" className="font-mono text-xs text-ink/50 dark:text-paper/50">
          Priority
        </label>
        <select
          id="filter-priority"
          value={filters.priority ?? ""}
          onChange={(e) =>
            update({ priority: (e.target.value || undefined) as TaskPriority | undefined })
          }
          className={selectClass}
        >
          <option value="">All priorities</option>
          {priorityValues.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="filter-category" className="font-mono text-xs text-ink/50 dark:text-paper/50">
          Category
        </label>
        <select
          id="filter-category"
          value={filters.category ?? ""}
          onChange={(e) => update({ category: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded border border-ink/20 px-3 py-2 text-sm text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/20 dark:text-paper dark:hover:bg-paper/10"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}