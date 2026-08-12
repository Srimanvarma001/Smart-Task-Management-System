import type { TaskStats } from "../../../api/taskApi";
import type { TaskPriority } from "../../tasks/types";

interface UpcomingDeadlinesProps {
  items?: TaskStats["upcomingDeadlines"];
  isLoading?: boolean;
}

const priorityBorder: Record<TaskPriority, string> = {
  low: "border-l-priorityLow",
  medium: "border-l-priorityMedium",
  high: "border-l-priorityHigh",
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

export default function UpcomingDeadlines({ items = [], isLoading }: UpcomingDeadlinesProps) {
  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">Upcoming deadlines</h3>
      {isLoading && (
        <div role="status" aria-label="Loading upcoming deadlines" className="mt-3 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="animate-pulse rounded-sm border border-ink/10 border-l-4 bg-paper p-3 dark:border-paper/10 dark:bg-ink/60"
            >
              <div className="h-3 w-2/3 rounded-sm bg-ink/10 dark:bg-paper/10" />
              <div className="mt-2 h-2 w-1/3 rounded-sm bg-ink/10 dark:bg-paper/10" />
            </div>
          ))}
        </div>
      )}
      {!isLoading && items.length === 0 && (
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">No upcoming deadlines.</p>
      )}
      {!isLoading && items.length > 0 && (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <div
                className={`rounded-sm border border-ink/10 border-l-4 bg-paper p-3 dark:border-paper/10 dark:bg-ink/60 ${priorityBorder[item.priority]}`}
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 font-mono text-xs text-ink/50 dark:text-paper/50">
                  Due {formatDueDate(item.dueDate)} &middot; {priorityLabel[item.priority]} priority
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}