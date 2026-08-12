import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { SidebarProvider } from "../components/layout/SidebarContext";
import AISummaryCard from "../features/ai/components/AISummaryCard";
import AISuggestionList from "../features/ai/components/AISuggestionList";
import CategoryBreakdown from "../features/dashboard/components/CategoryBreakdown";
import CompletionChart from "../features/dashboard/components/CompletionChart";
import QuickAdd from "../features/dashboard/components/QuickAdd";
import RecentActivity from "../features/dashboard/components/RecentActivity";
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
          <main className="flex-1 space-y-4 p-6">
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
            <div className="grid gap-4 lg:grid-cols-2">
              <AISummaryCard />
              <AISuggestionList />
            </div>
            <QuickAdd />
            <div className="grid gap-4 lg:grid-cols-2">
              <RecentActivity items={data?.recentActivity} isLoading={isLoading} />
              <UpcomingDeadlines items={data?.upcomingDeadlines} isLoading={isLoading} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <CategoryBreakdown items={data?.categoryBreakdown} isLoading={isLoading} />
              <TrendIndicator
                completedThisWeek={data?.weeklyTrend.completedThisWeek}
                isLoading={isLoading}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}