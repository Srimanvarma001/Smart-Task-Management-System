import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import { useCreateTask } from "../../tasks/hooks/useTaskMutations";

const inputClass =
  "w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus dark:border-paper/20 dark:bg-ink dark:text-paper";

export default function QuickAdd() {
  const createTask = useCreateTask();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setError(null);
    try {
      await createTask.mutateAsync({ title: trimmed, priority: "medium", tags: [] });
      setTitle("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create task. Please try again."));
    }
  };

  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">Quick add</h3>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          aria-label="New task title"
          disabled={createTask.isPending}
          className={inputClass}
        />
        <Button type="submit" disabled={createTask.isPending || !title.trim()}>
          {createTask.isPending ? "Adding..." : "Add"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-3 rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}