import Spinner from "../../../components/ui/Spinner";
import { useAISuggestions } from "../hooks/useAISuggestions";

export default function AISuggestionList() {
  const { data, isLoading, isError } = useAISuggestions();

  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">Suggestions</h3>
      {isLoading && (
        <div className="mt-3 flex items-center gap-2">
          <Spinner />
          <span className="text-sm text-ink/60 dark:text-paper/60">Ranking your tasks...</span>
        </div>
      )}
      {isError && (
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">
          Insights unavailable right now.
        </p>
      )}
      {!isLoading && !isError && data && data.length === 0 && (
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">
          No suggestions yet — add a few tasks to get started.
        </p>
      )}
      {!isLoading && !isError && data && data.length > 0 && (
        <ol className="mt-3 space-y-3">
          {data.map((suggestion) => (
            <li key={`${suggestion.title}-${suggestion.reason}`}>
              <div className="rounded-sm border border-ink/10 bg-paper p-3 dark:border-paper/10 dark:bg-ink/60">
                <p className="text-sm font-medium">{suggestion.title}</p>
                <p className="text-xs leading-relaxed text-ink/70 dark:text-paper/70">
                  {suggestion.reason}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}