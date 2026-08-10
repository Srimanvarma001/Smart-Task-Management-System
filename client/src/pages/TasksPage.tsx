import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import NLTaskInput from "../features/ai/components/NLTaskInput";
import TaskFilters from "../features/tasks/components/TaskFilters";
import TaskForm from "../features/tasks/components/TaskForm";

export default function TasksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 space-y-6 p-6">
          <NLTaskInput />
          <TaskForm />
          <TaskFilters />
        </main>
      </div>
    </div>
  );
}