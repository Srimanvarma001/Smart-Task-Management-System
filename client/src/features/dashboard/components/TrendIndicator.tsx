interface TrendIndicatorProps {
  completedThisWeek?: number;
  isLoading?: boolean;
}

export default function TrendIndicator({
  completedThisWeek = 0,
  isLoading,
}: TrendIndicatorProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading weekly trend"
        className="animate-pulse rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink"
      >
        <div aria-hidden="true" className="h-8 w-16 rounded-sm bg-ink/10 dark:bg-paper/10" />
        <div aria-hidden="true" className="mt-3 h-3 w-28 rounded-sm bg-ink/10 dark:bg-paper/10" />
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <p
        className={`font-mono text-2xl ${
          completedThisWeek > 0 ? "text-priorityLow" : "text-ink dark:text-paper"
        }`}
      >
        +{completedThisWeek}
      </p>
      <p className="mt-1 text-xs text-ink/50 dark:text-paper/50">completed this week</p>
      {completedThisWeek === 0 && (
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">
          Nothing completed yet this week.
        </p>
      )}
    </div>
  );
}