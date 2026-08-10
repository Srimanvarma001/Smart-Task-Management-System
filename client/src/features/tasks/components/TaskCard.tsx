import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-medium">{task.title}</h3>
    </div>
  );
}