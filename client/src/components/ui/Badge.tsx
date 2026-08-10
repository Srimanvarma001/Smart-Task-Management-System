import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-sm bg-ink/10 px-2 py-0.5 font-mono text-xs text-ink dark:bg-paper/10 dark:text-paper ${className}`}
    >
      {children}
    </span>
  );
}