import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus dark:border-paper/20 dark:bg-ink dark:text-paper ${className}`}
      {...props}
    />
  );
}