export default function Spinner() {
  return (
    <div
      aria-label="Loading"
      role="status"
      className="h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-focus dark:border-paper/20"
    />
  );
}