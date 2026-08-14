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

interface SidebarPanelProps {
  data?: TaskStats;
  isLoading: boolean;
  onNavigate?: () => void;
  className?: string;
  showCompletion?: boolean;
}

function SidebarPanel({
  data,
  isLoading,
  onNavigate,
  className = "",
  showCompletion = true,
}: SidebarPanelProps) {
  const byPriority = data?.byPriority ?? { high: 0, medium: 0, low: 0 };

  return (
    <aside
      className={`flex h-full flex-col overflow-hidden border-r border-ink/10 bg-paper transition-transform duration-300 dark:border-paper/10 dark:bg-ink ${className}`}
    >
      <nav className="space-y-1 overflow-y-auto p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={onNavigate}
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
      {showCompletion && (
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
  );
}

export default function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const { data, isLoading } = useTaskStats();

  return (
    <>
      <div
        className={`relative hidden h-screen shrink-0 transition-[width] duration-300 md:block ${
          collapsed ? "w-0" : "w-52"
        }`}
      >
        <SidebarPanel
          data={data}
          isLoading={isLoading}
          showCompletion={!collapsed}
          className={`w-52 ${collapsed ? "-translate-x-full" : "translate-x-0"}`}
        />
      </div>

      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 transition-[visibility] duration-300 md:hidden ${
          mobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <div
          aria-hidden="true"
          onClick={closeMobile}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <SidebarPanel
          data={data}
          isLoading={isLoading}
          onNavigate={closeMobile}
          className={`absolute inset-y-0 left-0 w-64 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </div>
    </>
  );
}