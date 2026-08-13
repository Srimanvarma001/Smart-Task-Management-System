interface CompletionDonutProps {
  rate: number;
  className?: string;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CompletionDonut({
  rate,
  className = "h-24 w-24",
}: CompletionDonutProps) {
  const clampedRate = Math.min(100, Math.max(0, rate));

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${clampedRate}% of tasks completed`}
      className={`shrink-0 ${className}`}
    >
      <title>{`${clampedRate}% of tasks completed`}</title>
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
        strokeDasharray={`${(clampedRate / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        className="stroke-focus"
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
        className="fill-ink font-mono dark:fill-paper"
      >
        {clampedRate}%
      </text>
    </svg>
  );
}