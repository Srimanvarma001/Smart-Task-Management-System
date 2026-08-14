import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { SidebarProvider } from "../components/layout/SidebarContext";
import AISummaryCard from "../features/ai/components/AISummaryCard";
import AISuggestionList from "../features/ai/components/AISuggestionList";
import NLTaskInput from "../features/ai/components/NLTaskInput";
import CategoryBreakdown from "../features/dashboard/components/CategoryBreakdown";
import StatsCards from "../features/dashboard/components/StatsCards";
import TrendIndicator from "../features/dashboard/components/TrendIndicator";
import UpcomingDeadlines from "../features/dashboard/components/UpcomingDeadlines";
import { useTaskStats } from "../features/dashboard/hooks/useTaskStats";

export default function DashboardPage() {
  const { data, isLoading, isError } = useTaskStats();

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="min-w-0 flex-1 space-y-4 p-4 sm:p-6">
            <StatsCards stats={data} isLoading={isLoading} />
            {isError && (
              <p className="text-sm text-ink/70 dark:text-paper/70">
                Stats unavailable right now.
              </p>
            )}
            <NLTaskInput />
            <div className="grid gap-4 lg:grid-cols-2">
              <AISummaryCard />
              <AISuggestionList />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <UpcomingDeadlines items={data?.upcomingDeadlines} isLoading={isLoading} />
              <div className="space-y-4">
                <CategoryBreakdown items={data?.categoryBreakdown} isLoading={isLoading} />
                <TrendIndicator
                  completedThisWeek={data?.weeklyTrend.completedThisWeek}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}