import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import AISummaryCard from "../features/ai/components/AISummaryCard";
import AISuggestionList from "../features/ai/components/AISuggestionList";
import CompletionChart from "../features/dashboard/components/CompletionChart";
import StatsCards from "../features/dashboard/components/StatsCards";
import { useTaskStats } from "../features/dashboard/hooks/useTaskStats";

export default function DashboardPage() {
  const { data, isLoading, isError } = useTaskStats();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 space-y-6 p-6">
          <StatsCards stats={data} isLoading={isLoading} />
          {isError && (
            <p className="text-sm text-ink/70 dark:text-paper/70">
              Stats unavailable right now.
            </p>
          )}
          <CompletionChart
            completionRate={data?.completionRate}
            byPriority={data?.byPriority}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <AISummaryCard />
            <AISuggestionList />
          </div>
        </main>
      </div>
    </div>
  );
}