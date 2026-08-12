import { useDarkMode } from "../../hooks/useDarkMode";

export default function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded border border-ink/10 px-3 py-1.5 font-mono text-xs text-ink hover:bg-ink/5 dark:border-paper/10 dark:text-paper dark:hover:bg-paper/10"
    >
      {isDark ? "light" : "dark"}
    </button>
  );
}
