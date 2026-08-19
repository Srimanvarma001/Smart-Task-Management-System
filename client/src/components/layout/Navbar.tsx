import DarkModeToggle from "./DarkModeToggle";
import { useSidebar } from "./SidebarContext";

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" focusable="false">
      <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const { collapsed, toggle, openMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-ink/10 bg-paper/85 px-4 py-3 text-ink backdrop-blur-md dark:border-paper/10 dark:bg-ink/85 dark:text-paper sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          onClick={openMobile}
          className="rounded border border-ink/10 p-2 text-ink hover:bg-ink/5 dark:border-paper/10 dark:text-paper dark:hover:bg-paper/10 md:hidden"
        >
          <HamburgerIcon />
        </button>
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggle}
          className="hidden rounded border border-ink/10 p-2 text-ink hover:bg-ink/5 dark:border-paper/10 dark:text-paper dark:hover:bg-paper/10 md:block"
        >
          <HamburgerIcon />
        </button>
        <span className="hidden h-6 w-1.5 shrink-0 rounded-sm bg-focus sm:block" aria-hidden="true" />
        <span className="truncate font-display text-base sm:text-lg">Smart Task Manager</span>
      </div>
      <DarkModeToggle />
    </header>
  );
}