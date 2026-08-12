import DarkModeToggle from "./DarkModeToggle";
import { useSidebar } from "./SidebarContext";

export default function Navbar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-paper px-6 py-4 text-ink dark:border-paper/10 dark:bg-ink dark:text-paper">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggle}
          className="rounded border border-ink/10 p-2 text-ink hover:bg-ink/5 dark:border-paper/10 dark:text-paper dark:hover:bg-paper/10"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4"
            aria-hidden="true"
            focusable="false"
          >
            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="font-display text-lg">Smart Task Manager</span>
      </div>
      <DarkModeToggle />
    </header>
  );
}