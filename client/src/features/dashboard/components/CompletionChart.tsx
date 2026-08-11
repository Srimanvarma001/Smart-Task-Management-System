import type { TaskStats } from "../../../api/taskApi";

interface CompletionChartProps {
  completionRate?: number;
  byPriority?: TaskStats["byPriority"];
}

const priorityMeta: { key: keyof TaskStats["byPriority"]; label: string; barClass: string }[] = [
  { key: "high", label: "High priority", barClass: "bg-priorityHigh" },
  { key: "medium", label: "Medium priority", barClass: "bg-priorityMedium" },
  { key: "low", label: "Low priority", barClass: "bg-priorityLow" },
];

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CompletionChart({
  completionRate = 0,
  byPriority = { high: 0, medium: 0, low: 0 },
}: CompletionChartProps) {
  const rate = Math.min(100, Math.max(0, completionRate));
  const priorityTotal = byPriority.high + byPriority.medium + byPriority.low;

  const segmentWidth = (count: number): number =>
    priorityTotal === 0 ? 0 : Math.round((count / priorityTotal) * 100);

  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">Completion</h3>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-label={`${rate}% of tasks completed`}
          className="h-28 w-28 shrink-0"
        >
          <title>{`${rate}% of tasks completed`}</title>
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            className="stroke-ink/10 dark:stroke-paper/10"
          />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            strokeDasharray={`${(rate / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            className="stroke-focus"
          />
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={21}
            className="fill-ink font-mono dark:fill-paper"
          >
            {rate}%
          </text>
        </svg>

        <div className="min-w-0 flex-1 space-y-3">
          <div
            role="img"
            aria-label={`By priority: ${byPriority.high} high, ${byPriority.medium} medium, ${byPriority.low} low`}
            className="flex h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10"
          >
            {priorityMeta.map((meta) => {
              const width = segmentWidth(byPriority[meta.key]);
              return width > 0 ? (
                <div
                  key={meta.key}
                  style={{ width: `${width}%` }}
                  className={meta.barClass}
                />
              ) : null;
            })}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {priorityMeta.map((meta) => (
              <li key={meta.key} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${meta.barClass}`} />
                <span className="text-xs text-ink/60 dark:text-paper/60">{meta.label}</span>
                <span className="font-mono text-xs text-ink dark:text-paper">
                  {byPriority[meta.key]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}