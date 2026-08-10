import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import AISummaryCard from "../features/ai/components/AISummaryCard";
import AISuggestionList from "../features/ai/components/AISuggestionList";
import CompletionChart from "../features/dashboard/components/CompletionChart";
import StatsCards from "../features/dashboard/components/StatsCards";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 space-y-6 p-6">
          <StatsCards />
          <div className="grid gap-6 lg:grid-cols-2">
            <AISummaryCard />
            <AISuggestionList />
          </div>
          <CompletionChart />
        </main>
      </div>
    </div>
  );
}