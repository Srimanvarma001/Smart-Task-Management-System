const mockCards = [
  {
    title: "Review Q3 roadmap",
    description: "Align on milestones with the design team and flag blockers early.",
    meta: "Due Aug 20  \u00b7  Work",
    priorityClass: "border-l-priorityHigh",
    tilt: "-rotate-2 translate-x-5",
  },
  {
    title: "Ship onboarding flow",
    description: "Final polish pass on empty states and keyboard navigation.",
    meta: "Due Aug 22  \u00b7  Product",
    priorityClass: "border-l-priorityMedium",
    tilt: "rotate-1 -translate-x-3",
  },
  {
    title: "Weekly retro notes",
    description: "Capture action items from Monday's sync and assign owners.",
    meta: "Due Aug 25  \u00b7  Team",
    priorityClass: "border-l-priorityLow",
    tilt: "-rotate-1 translate-x-2",
  },
  {
    title: "Clear inbox backlog",
    description: "Triage the old queue and archive everything that's done.",
    meta: "Due Aug 27  \u00b7  Personal",
    priorityClass: "border-l-priorityHigh",
    tilt: "rotate-2 -translate-x-5",
  },
];

export default function AuthBrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="hidden w-1/2 shrink-0 flex-col items-center justify-center bg-ink px-8 text-paper md:flex lg:w-[55%] dark:bg-paper dark:text-ink"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-focus">
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-white" focusable="false">
            <path
              d="M3 8.5 6.5 12 13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="font-display text-xl">Smart Task Manager</p>
      </div>
      <p className="mt-2 text-sm text-paper/70 dark:text-ink/70">A calm, focused home for all your tasks.</p>

      <div className="mt-16 w-full max-w-sm space-y-6">
        {mockCards.map((card) => (
          <div
            key={card.title}
            className={`flex items-start gap-3 rounded-sm border border-ink/10 border-l-4 bg-white px-3 py-2 shadow-xl shadow-black/20 dark:border-paper/10 dark:bg-ink ${card.priorityClass} ${card.tilt}`}
          >
            <span className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-ink/30 dark:border-paper/30" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink dark:text-paper">{card.title}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-ink/70 dark:text-paper/70">
                {card.description}
              </p>
              <p className="mt-0.5 font-mono text-xs text-ink/50 dark:text-paper/50">{card.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}