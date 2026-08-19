import { useDarkMode } from "../../hooks/useDarkMode";

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line x1="8" y1="1" x2="8" y2="2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="13.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="1" y1="8" x2="2.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="13.5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="3.1" y1="3.1" x2="4.2" y2="4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11.8" y1="11.8" x2="12.9" y2="12.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12.9" y1="3.1" x2="11.8" y2="4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="4.2" y1="11.8" x2="3.1" y2="12.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" focusable="false">
      <path
        d="M13 9.2A5.6 5.6 0 0 1 6.8 3a5.6 5.6 0 1 0 6.2 6.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded border border-ink/10 p-2 text-ink hover:bg-ink/5 dark:border-paper/10 dark:text-paper dark:hover:bg-paper/10"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
