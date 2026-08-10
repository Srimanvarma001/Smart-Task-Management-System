export default function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
        <span className="font-mono text-xs text-ink/60 dark:text-paper/60">Total</span>
      </div>
      <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
        <span className="font-mono text-xs text-ink/60 dark:text-paper/60">Completed</span>
      </div>
      <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
        <span className="font-mono text-xs text-ink/60 dark:text-paper/60">Pending</span>
      </div>
      <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
        <span className="font-mono text-xs text-ink/60 dark:text-paper/60">Overdue</span>
      </div>
    </div>
  );
}