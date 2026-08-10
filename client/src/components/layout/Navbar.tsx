import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4 dark:border-paper/10">
      <span className="font-display text-lg">Smart Task Manager</span>
      <DarkModeToggle />
    </header>
  );
}