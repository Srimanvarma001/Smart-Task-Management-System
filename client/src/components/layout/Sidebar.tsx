import { NavLink } from "react-router-dom";
import { useSidebar } from "./SidebarContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
];

export default function Sidebar() {
  const { collapsed } = useSidebar();

  return (
    <div
      className={`relative shrink-0 transition-[width] duration-300 ${
        collapsed ? "w-0" : "w-52"
      }`}
    >
      <aside
        className={`h-full w-52 overflow-hidden transition-transform duration-300 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <nav className="flex h-full w-52 flex-col gap-1 p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${
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
    </div>
  );
}