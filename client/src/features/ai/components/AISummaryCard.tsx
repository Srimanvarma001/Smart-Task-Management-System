import Spinner from "../../../components/ui/Spinner";
import Badge from "../../../components/ui/Badge";
import { useAISummary } from "../hooks/useAISummary";

export default function AISummaryCard() {
  const { data, isLoading, isError } = useAISummary();

  return (
    <div className="rounded-sm border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink">
      <h3 className="font-display text-lg">AI Summary</h3>
      {isLoading && (
        <div className="mt-2 flex items-center gap-2">
          <Spinner />
          <span className="text-sm text-ink/60 dark:text-paper/60">Summarizing your week...</span>
        </div>
      )}
      {isError && (
        <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
          Insights unavailable right now.
        </p>
      )}
      {!isLoading && !isError && data && (
        <div className="mt-2 space-y-2">
          <p className="text-sm leading-relaxed text-ink/80 dark:text-paper/80">{data.summary}</p>
          {data.flags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {data.flags.map((flag) => (
                <li key={flag}>
                  <Badge>{flag}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}