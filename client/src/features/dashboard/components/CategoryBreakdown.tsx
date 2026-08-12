import type { TaskStats } from "../../../api/taskApi";

interface CategoryBreakdownProps {
  items?: TaskStats["categoryBreakdown"];
  isLoading?: boolean;
}

const segmentColors = [
  "bg-focus",
  "bg-priorityMedium",
  "bg-priorityLow",
  "bg-priorityHigh",
  "bg-ink/60 dark:bg-paper/60",
];

export default function CategoryBreakdown({ items = [], isLoading }: CategoryBreakdownProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const segmentWidth = (count: number): number =>
    total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">Categories</h3>
      {isLoading && (
        <div role="status" aria-label="Loading category breakdown" className="mt-3 space-y-3">
          <div aria-hidden="true" className="h-2 w-full animate-pulse rounded-full bg-ink/10 dark:bg-paper/10" />
          {[0, 1, 2].map((index) => (
            <div key={index} aria-hidden="true" className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-ink/10 dark:bg-paper/10" />
              <span className="h-3 w-1/3 animate-pulse rounded-sm bg-ink/10 dark:bg-paper/10" />
            </div>
          ))}
        </div>
      )}
      {!isLoading && items.length === 0 && (
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">No categories yet.</p>
      )}
      {!isLoading && items.length > 0 && (
        <>
          <div
            role="img"
            aria-label={`By category: ${items.map((item) => `${item.category} ${item.count}`).join(", ")}`}
            className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10"
          >
            {items.map((item, index) => {
              const width = segmentWidth(item.count);
              return width > 0 ? (
                <div
                  key={item.category}
                  style={{ width: `${width}%` }}
                  className={`${segmentColors[index % segmentColors.length]}`}
                />
              ) : null;
            })}
          </div>
          <ul className="mt-4 space-y-2">
            {items.map((item, index) => (
              <li key={item.category} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${segmentColors[index % segmentColors.length]}`}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink/80 dark:text-paper/80">
                  {item.category}
                </span>
                <span className="font-mono text-xs text-ink dark:text-paper">{item.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}