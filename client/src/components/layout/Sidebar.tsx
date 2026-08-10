import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
];

export default function Sidebar() {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            `rounded px-3 py-2 text-sm ${
              isActive ? "bg-focus text-white" : "text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}