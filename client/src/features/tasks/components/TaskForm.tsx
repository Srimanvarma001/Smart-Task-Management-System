import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useCreateTask, useUpdateTask } from "../hooks/useTaskMutations";
import type { Task, TaskPriority } from "../types";

interface TaskFormProps {
  task?: Task | null;
  initialValues?: Partial<Task>;
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

function toDateInputValue(value: string | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

// task (editing) takes priority over initialValues (AI prefill on create)
const initialForm = (task?: Task | null, initialValues?: Partial<Task>): FormState => {
  const source = task ?? initialValues;
  return {
    title: source?.title ?? "",
    description: source?.description ?? "",
    dueDate: toDateInputValue(source?.dueDate),
    priority: source?.priority ?? "medium",
    category: source?.category ?? "",
    tags: task?.tags?.join(", ") ?? "",
  };
};

export default function TaskForm({ task, initialValues, onSuccess, onCancel }: TaskFormProps) {
  const isEditing = Boolean(task);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const mutation = isEditing ? updateTask : createTask;

  const [form, setForm] = useState<FormState>(() => initialForm(task, initialValues));
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
      // only relevant on create: marks a task that originated from AI parsing
      ...(isEditing ? {} : { aiGenerated: Boolean(initialValues?.aiGenerated) }),
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
    </form>
  );
}