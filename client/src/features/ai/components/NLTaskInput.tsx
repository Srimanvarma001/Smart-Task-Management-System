import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../api/axiosClient";
import type { ParsedTask } from "../../../api/aiApi";
import type { TaskPriority } from "../../tasks/types";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import TaskForm from "../../tasks/components/TaskForm";
import { useAIParse } from "../hooks/useAIParse";

interface DraftTask {
  title: string;
  dueDate?: string;
  priority: TaskPriority;
  category?: string;
  aiGenerated: boolean;
}

export default function NLTaskInput() {
  const parseMutation = useAIParse();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<DraftTask | null>(null);

  const openForm = (parsed: ParsedTask | null) => {
    setDraft(
      parsed
        ? { ...parsed, aiGenerated: true }
        : { title: "", priority: "medium", aiGenerated: false },
    );
    setModalOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Describe a task in plain language, for example: \"Pick up dry cleaning tomorrow by 5pm\".");
      return;
    }

    parseMutation.mutate(text.trim(), {
      onSuccess: (parsed) => {
        setText("");
        openForm(parsed);
      },
      onError: (err) => {
        setError(getApiErrorMessage(err, "AI parsing is unavailable right now. Add the task manually instead."));
      },
    });
  };

  return (
    <>
      <section className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
        <h2 className="font-display text-lg">Add with AI</h2>
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder='Describe a task in plain language, e.g. "Submit report Friday at noon, high priority"'
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Describe a task in plain language"
          />
          <Button type="submit" disabled={parseMutation.isPending} className="sm:shrink-0">
            {parseMutation.isPending ? "Parsing..." : "Add with AI"}
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-xs text-ink/60 dark:text-paper/60">or</span>
          <button
            type="button"
            onClick={() => openForm(null)}
            className="font-medium text-focus hover:underline"
          >
            New task
          </button>
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="mb-1 font-display text-lg">
          {draft?.aiGenerated ? "Review your AI-parsed task" : "New task"}
        </h2>
        <p className="mb-4 text-sm text-ink/70 dark:text-paper/70">
          {draft?.aiGenerated
            ? "Nothing is saved yet — review the fields below and edit before adding."
            : "Use the AI input to draft a task, or fill in the fields below."}
        </p>
        {draft && (
          <TaskForm initialValues={draft} onSaved={() => setModalOpen(false)} />
        )}
      </Modal>
    </>
  );
}