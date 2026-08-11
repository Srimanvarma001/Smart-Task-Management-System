import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
<<<<<<< HEAD
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
=======
import { useCreateTask, useUpdateTask } from "../hooks/useTaskMutations";
import type { Task, TaskPriority } from "../types";

interface TaskFormProps {
  task?: Task | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  category: string;
  tags: string;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
  form?: string;
}

const inputClass =
  "w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus dark:border-paper/20 dark:bg-ink dark:text-paper";

const initialForm = (task?: Task | null): FormState => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
  priority: task?.priority ?? "medium",
  category: task?.category ?? "",
  tags: task?.tags.join(", ") ?? "",
});

export default function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const isEditing = Boolean(task);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const mutation = isEditing ? updateTask : createTask;

  const [form, setForm] = useState<FormState>(() => initialForm(task));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (state: FormState): FormErrors => {
    const next: FormErrors = {};
    if (!state.title.trim()) {
      next.title = "Title is required";
    }
    if (state.dueDate && Number.isNaN(new Date(state.dueDate).getTime())) {
      next.dueDate = "Due date must be a valid date";
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setSaved(false);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      category: form.category.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({ id: task._id, payload });
      } else {
        await createTask.mutateAsync(payload);
      }
      setSaved(true);
      window.setTimeout(() => onSuccess?.(), 800);
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, "Unable to save task. Please try again.") });
    }
>>>>>>> origin/develop
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD
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
=======
      <h3 className="font-display text-xl">{isEditing ? "Edit task" : "New task"}</h3>

      <div>
        <label htmlFor="task-title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <Input
          id="task-title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Task title"
          required
        />
        {errors.title && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="task-description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Optional details"
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-due" className="mb-1 block text-sm font-medium">
            Due date
          </label>
          <input
            id="task-due"
            type="date"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
            className={inputClass}
          />
          {errors.dueDate && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.dueDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-priority" className="mb-1 block text-sm font-medium">
            Priority
          </label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={(e) => setField("priority", e.target.value as TaskPriority)}
            className={inputClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-category" className="mb-1 block text-sm font-medium">
            Category
          </label>
          <Input
            id="task-category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="e.g. Work"
          />
        </div>

        <div>
          <label htmlFor="task-tags" className="mb-1 block text-sm font-medium">
            Tags
          </label>
          <Input
            id="task-tags"
            value={form.tags}
            onChange={(e) => setField("tags", e.target.value)}
            placeholder="Comma-separated"
          />
        </div>
      </div>

      {errors.form && (
        <p role="alert" className="rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {errors.form}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded border border-focus/30 bg-focus/10 px-3 py-2 text-sm text-focus">
          Task saved
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-ink/20 px-4 py-2 text-sm text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-paper/20 dark:text-paper dark:hover:bg-paper/10"
          >
            Cancel
          </button>
        )}
        <Button type="submit" disabled={mutation.isPending || saved}>
          {mutation.isPending ? "Saving..." : "Save task"}
        </Button>
      </div>
>>>>>>> origin/develop
    </form>
  );
}