import { NavLink } from "react-router-dom";
import { useSidebar } from "./SidebarContext";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1.5" width="5.5" height="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9" width="5.5" height="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5.5" height="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false">
      <path
        d="M2.5 4.5l2 2 4-4.5M2.5 11.5l2 2 4-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line x1="1.5" y1="6" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.4" />
      <line x1="5" y1="1" x2="5" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11" y1="1" x2="11" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const links = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/tasks", label: "Tasks", icon: <TasksIcon /> },
  { to: "/calendar", label: "Calendar", icon: <CalendarIcon /> },
];

interface SidebarPanelProps {
  onNavigate?: () => void;
  className?: string;
}

function SidebarPanel({ onNavigate, className = "" }: SidebarPanelProps) {
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
              `flex items-center gap-2.5 rounded px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-focus text-white"
                  : "text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <div
        className={`relative hidden h-screen shrink-0 transition-[width] duration-300 md:block ${
          collapsed ? "w-0" : "w-52"
        }`}
      >
        <SidebarPanel
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
          onNavigate={closeMobile}
          className={`absolute inset-y-0 left-0 w-64 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </div>
    </>
  );
}
