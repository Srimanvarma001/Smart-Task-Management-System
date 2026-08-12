import type { TaskStats } from "../../../api/taskApi";

interface RecentActivityProps {
  items?: TaskStats["recentActivity"];
  isLoading?: boolean;
}

// Note: the server derives `timestamp` from max(createdAt, updatedAt), so
// editing an old completed task's title/priority can make it surface here as
// "recent" even without a real completion-status change.
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentActivity({ items = [], isLoading }: RecentActivityProps) {
  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">Recent activity</h3>
      {isLoading && (
        <div role="status" aria-label="Loading recent activity" className="mt-3 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="animate-pulse rounded-sm border border-ink/10 bg-paper p-3 dark:border-paper/10 dark:bg-ink/60"
            >
              <div className="h-3 w-2/3 rounded-sm bg-ink/10 dark:bg-paper/10" />
              <div className="mt-2 h-2 w-1/3 rounded-sm bg-ink/10 dark:bg-paper/10" />
            </div>
          ))}
        </div>
      )}
      {!isLoading && items.length === 0 && (
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">No recent activity yet.</p>
      )}
      {!isLoading && items.length > 0 && (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <div className="rounded-sm border border-ink/10 bg-paper p-3 dark:border-paper/10 dark:bg-ink/60">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 font-mono text-xs text-ink/50 dark:text-paper/50">
                  {item.status} &middot; {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
