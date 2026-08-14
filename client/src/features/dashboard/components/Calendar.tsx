import { useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import { useCreateTask, useToggleTaskStatus } from "../../tasks/hooks/useTaskMutations";
import { useTasks } from "../../tasks/hooks/useTasks";
import type { Task, TaskPriority } from "../../tasks/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const priorityDot: Record<TaskPriority, string> = {
  low: "bg-priorityLow",
  medium: "bg-priorityMedium",
  high: "bg-priorityHigh",
};

const priorityCellTint: Record<TaskPriority, string> = {
  low: "bg-priorityLow/15 dark:bg-priorityLow/25",
  medium: "bg-priorityMedium/15 dark:bg-priorityMedium/25",
  high: "bg-priorityHigh/15 dark:bg-priorityHigh/25",
};

const priorityRank: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 };

const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const inputClass =
  "w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus dark:border-paper/20 dark:bg-ink dark:text-paper";

const navButtonClass =
  "rounded border border-ink/20 px-2 py-1 text-sm text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/20 dark:text-paper dark:hover:bg-paper/10";

interface CalendarCell {
  year: number;
  month: number;
  day: number;
  inMonth: boolean;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function monthLabelOf(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function longDateLabel(year: number, month: number, day: number): string {
  return new Date(year, month, day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function topPriorityOf(tasks: Task[]): TaskPriority {
  let top: TaskPriority = "low";
  for (const task of tasks) {
    if (priorityRank[task.priority] > priorityRank[top]) top = task.priority;
  }
  return top;
}

interface DayTaskRowProps {
  task: Task;
}

function DayTaskRow({ task }: DayTaskRowProps) {
  const completed = task.status === "completed";
  const toggleStatus = useToggleTaskStatus();

  return (
    <li
      className={`flex items-center gap-2 ${
        completed ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={() => toggleStatus.mutate(task._id)}
        aria-label={completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
        className="h-4 w-4 shrink-0 accent-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      />
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${priorityDot[task.priority]}`}
      />
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          completed ? "line-through text-ink/50 dark:text-paper/50" : ""
        }`}
      >
        {task.title}
      </span>
      <span className="shrink-0 font-mono text-xs text-ink/50 dark:text-paper/50">
        {completed ? "Completed" : "Pending"} &middot; {priorityLabel[task.priority]}
      </span>
    </li>
  );
}

export default function Calendar() {
  const [visible, setVisible] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hovered, setHovered] = useState<{ key: string; left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createTask = useCreateTask();

  const { year, month } = visible;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dueDateFrom = `${year}-${pad(month + 1)}-01`;
  const dueDateTo = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

  const { data, isLoading, isError } = useTasks({
    dueDateFrom,
    dueDateTo,
    sort: "dueDate",
    order: "asc",
  });

  const tasksByDay = useMemo(() => {
    const byDay = new Map<string, Task[]>();
    for (const task of data?.tasks ?? []) {
      if (!task.dueDate || task.status === "completed") continue;
      const due = new Date(task.dueDate);
      if (Number.isNaN(due.getTime())) continue;
      const key = toDateKey(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
      const tasks = byDay.get(key);
      if (tasks) {
        tasks.push(task);
      } else {
        byDay.set(key, [task]);
      }
    }
    return byDay;
  }, [data]);

  const cells = useMemo<CalendarCell[]>(() => {
    const result: CalendarCell[] = [];
    for (let offset = firstWeekday; offset > 0; offset -= 1) {
      const date = new Date(year, month, 1 - offset);
      result.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push({ year, month, day, inMonth: true });
    }
    const trailing = (7 - (result.length % 7)) % 7;
    for (let day = 1; day <= trailing; day += 1) {
      const date = new Date(year, month + 1, day);
      result.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), inMonth: false });
    }
    return result;
  }, [year, month, daysInMonth, firstWeekday]);

  const todayKey = useMemo(() => {
    const now = new Date();
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const goToPrevMonth = () => {
    setSelectedKey(null);
    setHovered(null);
    setVisible(({ year: y, month: m }) => (m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 }));
  };

  const goToNextMonth = () => {
    setSelectedKey(null);
    setHovered(null);
    setVisible(({ year: y, month: m }) => (m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 }));
  };

  const handleCellMouseEnter = (event: MouseEvent<HTMLButtonElement>, cell: CalendarCell) => {
    const key = toDateKey(cell.year, cell.month, cell.day);
    const tasks = tasksByDay.get(key);
    if (!tasks || tasks.length === 0 || !containerRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const cardRect = containerRef.current.getBoundingClientRect();
    setHovered({
      key,
      left: rect.left - cardRect.left + rect.width / 2,
      top: rect.top - cardRect.top + rect.height / 2,
    });
  };

  const handleCellMouseLeave = () => {
    setHovered(null);
  };

  const handleDayClick = (cell: CalendarCell) => {
    const key = toDateKey(cell.year, cell.month, cell.day);
    setHovered(null);
    if (key === selectedKey) {
      setSelectedKey(null);
    } else {
      setSelectedKey(key);
      setTitle("");
      setError(null);
    }
  };

  const selectedTasks = useMemo(() => {
    if (!selectedKey) return [];
    return tasksByDay.get(selectedKey) ?? [];
  }, [selectedKey, tasksByDay]);

  const selectedCell = useMemo(() => {
    if (!selectedKey) return null;
    const [y, m, d] = selectedKey.split("-").map(Number);
    return { year: y, month: m - 1, day: d };
  }, [selectedKey]);

  const hoveredTasks = useMemo(() => {
    if (!hovered) return null;
    return tasksByDay.get(hovered.key) ?? null;
  }, [hovered, tasksByDay]);

  const handleQuickAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !selectedKey) return;
    setError(null);
    try {
      await createTask.mutateAsync({
        title: trimmed,
        priority: "medium",
        tags: [],
        dueDate: selectedKey,
      });
      setTitle("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create task. Please try again."));
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg">Calendar</h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={goToPrevMonth} aria-label="Previous month" className={navButtonClass}>
            &lsaquo;
          </button>
          <span className="w-28 text-center font-mono text-sm text-ink/70 dark:text-paper/70">
            {monthLabelOf(year, month)}
          </span>
          <button type="button" onClick={goToNextMonth} aria-label="Next month" className={navButtonClass}>
            &rsaquo;
          </button>
        </div>
      </div>

      {isLoading && !data && (
        <div
          role="status"
          aria-label="Loading month tasks"
          className="mt-3 grid grid-cols-7 gap-px overflow-hidden rounded-sm border border-ink/10 bg-ink/10 dark:border-paper/10 dark:bg-paper/10"
        >
          {Array.from({ length: 42 }, (_, index) => (
            <div key={index} aria-hidden="true" className="h-14 animate-pulse bg-white dark:bg-ink" />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          <div className="mt-3 grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="py-1 text-center font-mono text-xs text-ink/50 dark:text-paper/50">
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-sm border border-ink/10 bg-ink/10 dark:border-paper/10 dark:bg-paper/10">
            {cells.map((cell) => {
              const key = toDateKey(cell.year, cell.month, cell.day);
              const dayTasks = tasksByDay.get(key);
              const taskCount = dayTasks?.length ?? 0;
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;

              if (!cell.inMonth) {
                return (
                  <div
                    key={key}
                    aria-hidden="true"
                    className="flex h-14 flex-col items-center gap-1 bg-white p-1 pt-1.5 text-ink/30 dark:bg-ink dark:text-paper/30"
                  >
                    <span className="text-sm">{cell.day}</span>
                  </div>
                );
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDayClick(cell)}
                  onMouseEnter={(event) => handleCellMouseEnter(event, cell)}
                  onMouseLeave={handleCellMouseLeave}
                  aria-label={`${longDateLabel(cell.year, cell.month, cell.day)}${taskCount > 0 ? `, ${taskCount} task${taskCount === 1 ? "" : "s"}` : ""}${isSelected ? ", selected" : ""}`}
                  className={`flex h-14 flex-col items-center gap-1 p-1 pt-1.5 transition hover:scale-[1.03] hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:hover:bg-paper/10 ${
                    taskCount > 0 && dayTasks ? priorityCellTint[topPriorityOf(dayTasks)] : "bg-white dark:bg-ink"
                  } ${
                    isToday ? "ring-2 ring-inset ring-focus" : ""
                  } ${isSelected ? "bg-focus/10 dark:bg-focus/20" : ""}`}
                >
                  <span className={`text-sm ${isToday ? "font-bold" : ""}`}>{cell.day}</span>
                  {taskCount > 0 && dayTasks && (
                    <span aria-hidden="true" className="flex items-center gap-0.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <span key={task._id} className={`h-2 w-2 rounded-full ${priorityDot[task.priority]}`} />
                      ))}
                      {taskCount > 3 && (
                        <span className="font-mono text-[10px] leading-none text-ink/60 dark:text-paper/60">
                          +{taskCount - 3}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {isError && (
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">
          Unable to load calendar tasks right now.
        </p>
      )}

      {selectedKey && selectedCell && (
        <div className="mt-3 rounded-sm border border-ink/10 bg-paper p-3 dark:border-paper/10 dark:bg-ink/60">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-display text-base">
              {longDateLabel(selectedCell.year, selectedCell.month, selectedCell.day)}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              aria-label="Close day panel"
              className="rounded px-1.5 py-0.5 font-mono text-xs text-ink/60 hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:text-paper/60 dark:hover:bg-paper/10 dark:hover:text-paper"
            >
              Close
            </button>
          </div>

          {selectedTasks.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {selectedTasks.map((task) => (
                <DayTaskRow key={task._id} task={task} />
              ))}
            </ul>
          ) : (
            <form onSubmit={handleQuickAdd} className="mt-2 flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a task for this day..."
                aria-label="New task title"
                disabled={createTask.isPending}
                className={inputClass}
              />
              <Button type="submit" disabled={createTask.isPending || !title.trim()}>
                {createTask.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-3 rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {hovered && hoveredTasks && hoveredTasks.length > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-sm border border-ink/10 bg-ink px-2.5 py-1.5 text-xs text-white shadow-md dark:border-paper/10 dark:bg-paper dark:text-ink"
          style={{ left: hovered.left, top: hovered.top }}
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-white/70 dark:text-ink/70">
            {(() => {
              const [y, m, d] = hovered.key.split("-").map(Number);
              return longDateLabel(y, m - 1, d);
            })()}
          </p>
          <ul className="mt-1 max-w-48 space-y-0.5">
            {hoveredTasks.slice(0, 2).map((task) => (
              <li
                key={task._id}
                className={`truncate ${
                  task.status === "completed" ? "line-through text-white/50 dark:text-ink/50" : ""
                }`}
              >
                {task.title}
              </li>
            ))}
          </ul>
          {hoveredTasks.length > 2 && (
            <p className="mt-0.5 font-mono text-[10px] text-white/70 dark:text-ink/70">
              +{hoveredTasks.length - 2} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
