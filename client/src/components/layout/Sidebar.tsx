import { NavLink } from "react-router-dom";
import type { TaskStats } from "../../api/taskApi";
import CompletionDonut from "../../features/dashboard/components/CompletionDonut";
import { useTaskStats } from "../../features/dashboard/hooks/useTaskStats";
import { useSidebar } from "./SidebarContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/calendar", label: "Calendar" },
];

const priorityMeta: { key: keyof TaskStats["byPriority"]; label: string; dotClass: string }[] = [
  { key: "high", label: "High", dotClass: "bg-priorityHigh" },
  { key: "medium", label: "Medium", dotClass: "bg-priorityMedium" },
  { key: "low", label: "Low", dotClass: "bg-priorityLow" },
];

export default function Sidebar() {
  const { collapsed } = useSidebar();
  const { data, isLoading } = useTaskStats();
  const byPriority = data?.byPriority ?? { high: 0, medium: 0, low: 0 };

  return (
    <div
      className={`relative h-screen shrink-0 transition-[width] duration-300 ${
        collapsed ? "w-0" : "w-52"
      }`}
    >
      <aside
        className={`flex h-full w-52 flex-col overflow-hidden border-r border-ink/10 bg-paper transition-transform duration-300 dark:border-paper/10 dark:bg-ink ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <nav className="space-y-1 overflow-y-auto p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${
                  isActive
                    ? "bg-focus text-white"
                    : "text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        {!collapsed && (
          <div className="flex-shrink-0 border-t border-ink/10 p-4 dark:border-paper/10">
            <p className="mb-3 text-sm text-ink/60 dark:text-paper/60">Completion</p>
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div
                  aria-hidden="true"
                  className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-ink/10 dark:bg-paper/10"
                />
              ) : (
                <CompletionDonut rate={data?.completionRate ?? 0} className="h-20 w-20" />
              )}
              <div className="min-w-0 flex-1 space-y-2">
                {priorityMeta.map((meta) => (
                  <p
                    key={meta.key}
                    className="flex items-center justify-between text-sm text-ink/70 dark:text-paper/70"
                  >
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
                      {meta.label}
                    </span>
                    <span className="font-mono text-ink dark:text-paper">{byPriority[meta.key]}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}