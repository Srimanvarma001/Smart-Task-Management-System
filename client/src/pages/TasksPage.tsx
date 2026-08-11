import { useMemo, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Modal from "../components/ui/Modal";
import { useTasks } from "../features/tasks/hooks/useTasks";
import TaskFilters from "../features/tasks/components/TaskFilters";
import TaskForm from "../features/tasks/components/TaskForm";
import TaskList from "../features/tasks/components/TaskList";
import type { Task, TaskFilters as TaskFiltersState } from "../features/tasks/types";

const defaultFilters: TaskFiltersState = { sort: "createdAt", order: "desc", page: 1 };

const newTaskButtonClass =
  "rounded bg-focus px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFiltersState>(defaultFilters);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, error, refetch } = useTasks(filters);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const task of data?.tasks ?? []) {
      if (task.category) seen.add(task.category);
    }
    return [...seen].sort();
  }, [data]);

  const hasActiveFilters =
    Boolean(filters.status || filters.priority || filters.category || filters.search) ||
    (filters.page ?? 1) > 1;

  const updateFilters = (next: TaskFiltersState) => setFilters(next);

  const clearFilters = () => setFilters(defaultFilters);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl">Tasks</h2>
            <button type="button" onClick={openCreate} className={newTaskButtonClass}>
              New task
            </button>
          </div>

          <TaskFilters filters={filters} categories={categories} onChange={updateFilters} />

          <TaskList
            tasks={data?.tasks ?? []}
            total={data?.total ?? 0}
            page={data?.page ?? 1}
            totalPages={data?.totalPages ?? 1}
            isLoading={isLoading}
            error={error}
            hasActiveFilters={hasActiveFilters}
            onEdit={openEdit}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onRetry={() => void refetch()}
            onClearFilters={clearFilters}
          />

          <Modal open={formOpen} onClose={closeForm}>
            <TaskForm
              key={editingTask?._id ?? "new"}
              task={editingTask}
              onSuccess={closeForm}
              onCancel={closeForm}
            />
          </Modal>
        </main>
      </div>
    </div>
  );
}