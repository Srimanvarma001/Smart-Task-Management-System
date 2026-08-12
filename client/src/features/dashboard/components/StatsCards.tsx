import type { TaskStats } from "../../../api/taskApi";

interface StatsCardsProps {
  stats?: TaskStats;
  isLoading?: boolean;
}

const emptyStats: TaskStats = {
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0,
  byPriority: { high: 0, medium: 0, low: 0 },
  completionRate: 0,
  recentActivity: [],
  upcomingDeadlines: [],
  categoryBreakdown: [],
  weeklyTrend: { completedThisWeek: 0 },
};

const cards = [
  { key: "total", label: "Total" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
] as const;

export default function StatsCards({ stats = emptyStats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading task stats"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((card) => (
          <div
            key={card.key}
            aria-hidden="true"
            className="animate-pulse rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink"
          >
            <div className="h-8 w-16 rounded-sm bg-ink/10 dark:bg-paper/10" />
            <div className="mt-3 h-3 w-20 rounded-sm bg-ink/10 dark:bg-paper/10" />
          </div>
        ))}
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="rounded-sm border border-dashed border-ink/20 p-8 text-center dark:border-paper/20">
        <h3 className="font-display text-lg font-medium">No stats yet</h3>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          Create a task to start tracking progress.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink"
        >
          <p
            className={`font-mono text-2xl ${
              card.key === "overdue" ? "text-priorityHigh" : "text-ink dark:text-paper"
            }`}
          >
            {stats[card.key]}
          </p>
          <p className="mt-1 text-xs text-ink/50 dark:text-paper/50">{card.label}</p>
        </div>
      ))}
    </div>
  );
}