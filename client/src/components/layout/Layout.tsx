import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <Outlet />
    </div>
  );
}
