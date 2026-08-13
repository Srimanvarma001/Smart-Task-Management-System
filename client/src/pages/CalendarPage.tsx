import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { SidebarProvider } from "../components/layout/SidebarContext";
import Calendar from "../features/dashboard/components/Calendar";

export default function CalendarPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 space-y-4 p-6">
            <Calendar />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}