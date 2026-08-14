import { NavLink } from "react-router-dom";
import { useSidebar } from "./SidebarContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/calendar", label: "Calendar" },
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
