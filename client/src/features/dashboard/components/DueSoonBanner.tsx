import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatDueDate, isTaskDueToday, isTaskOverdue, priorityBadge, priorityLabel } from "../../tasks/taskUtils";
import type { Task } from "../../tasks/types";

interface DueSoonBannerProps {
  tasks: Task[] | undefined;
  isLoading?: boolean;
}

const MAX_VISIBLE = 3;

const emptyBoxClasses =
  "rounded-sm border border-dashed border-ink/20 p-6 text-center dark:border-paper/20";

function DueSoonTaskRow({ task }: { task: Task }) {
  return (
    <li>
      <Link
        to="/tasks"
        className="block rounded-sm border border-ink/10 bg-paper px-3 py-2 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/10 dark:bg-ink/60 dark:hover:bg-paper/10"
      >
        <p className="truncate text-sm font-medium">{task.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-xs text-ink/50 dark:text-paper/50">
          <span>Due {formatDueDate(task.dueDate as string)}</span>
          <span
            aria-label={`Priority ${priorityLabel[task.priority]}`}
            className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${priorityBadge[task.priority]}`}
          >
            {priorityLabel[task.priority]}
          </span>
        </p>
      </Link>
    </li>
  );
}

interface DueSoonSectionProps {
  title: string;
  accentClass: string;
  tasks: Task[];
  emptyText: string;
}

function DueSoonSection({ title, accentClass, tasks, emptyText }: DueSoonSectionProps) {
  return (
    <section aria-label={title}>
      <h4 className={`font-mono text-xs font-semibold uppercase tracking-wide ${accentClass}`}>
        {title} &middot; {tasks.length}
      </h4>
      {tasks.length === 0 ? (
        <p className="mt-2 text-sm text-ink/50 dark:text-paper/50">{emptyText}</p>
      ) : (
        <>
          <ul className="mt-2 space-y-2">
            {tasks.slice(0, MAX_VISIBLE).map((task) => (
              <DueSoonTaskRow key={task._id} task={task} />
            ))}
          </ul>
          {tasks.length > MAX_VISIBLE && (
            <p className="mt-2 font-mono text-xs text-ink/50 dark:text-paper/50">
              +{tasks.length - MAX_VISIBLE} more
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default function DueSoonBanner({ tasks = [], isLoading }: DueSoonBannerProps) {
  const { overdue, dueToday } = useMemo(() => {
    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    for (const task of tasks) {
      if (task.status === "completed") continue;
      if (isTaskOverdue(task)) {
        overdue.push(task);
      } else if (isTaskDueToday(task)) {
        dueToday.push(task);
      }
    }
    const byDueDate = (a: Task, b: Task) =>
      String(a.dueDate ?? "").localeCompare(String(b.dueDate ?? "")) || a.title.localeCompare(b.title);
    overdue.sort(byDueDate);
    dueToday.sort(byDueDate);
    return { overdue, dueToday };
  }, [tasks]);

  if (isLoading && tasks.length === 0) {
    return (
      <div role="status" aria-label="Loading due soon tasks" className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
        <div className="h-5 w-28 animate-pulse rounded-sm bg-ink/10 dark:bg-paper/10" />
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((column) => (
            <div key={column} aria-hidden="true" className="space-y-2">
              <div className="h-3 w-32 rounded-sm bg-ink/10 dark:bg-paper/10" />
              {[0, 1].map((row) => (
                <div key={row} className="h-12 animate-pulse rounded-sm bg-ink/5 dark:bg-paper/5" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const caughtUp = overdue.length === 0 && dueToday.length === 0;

  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">Due soon</h3>
      {caughtUp ? (
        <div className={`mt-3 ${emptyBoxClasses}`}>
          <p className="font-display text-base font-medium">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
            Nothing is overdue or due today. Nice work.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <DueSoonSection
            title="Overdue"
            accentClass="text-priorityHigh"
            tasks={overdue}
            emptyText="Nothing overdue."
          />
          <DueSoonSection
            title="Due today"
            accentClass="text-priorityMedium"
            tasks={dueToday}
            emptyText="Nothing due today."
          />
        </div>
      )}
    </div>
  );
}
