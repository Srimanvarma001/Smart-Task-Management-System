import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import type { Task, TaskPriority } from "../types";
import { useTaskMutations } from "../hooks/useTaskMutations";

interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSaved?: () => void;
}

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

function toDateInputValue(value: string | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function TaskForm({ initialValues, onSaved }: TaskFormProps) {
  const { createTask } = useTaskMutations();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(initialValues?.dueDate));
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? "medium");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
        priority,
        ...(category.trim() ? { category: category.trim() } : {}),
        aiGenerated: Boolean(initialValues?.aiGenerated),
      },
      {
        onSuccess: onSaved,
        onError: (err) => setError(getApiErrorMessage(err, "Unable to save the task. Please try again.")),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <Input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="font-mono text-xs text-ink/60 dark:text-paper/60">Due date</span>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="font-mono text-xs text-ink/60 dark:text-paper/60">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus dark:border-paper/20 dark:bg-ink dark:text-paper"
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Input
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <Button type="submit" className="w-full" disabled={createTask.isPending}>
        {createTask.isPending ? "Saving..." : "Add task"}
      </Button>
    </form>
  );
}