import { useTheme } from "../../context/ThemeContext";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="rounded border border-ink/10 px-3 py-1.5 font-mono text-xs text-ink hover:bg-ink/5 dark:border-paper/10 dark:text-paper dark:hover:bg-paper/10"
    >
      {theme === "dark" ? "light" : "dark"}
    </button>
  );
}