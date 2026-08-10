import type { ButtonHTMLAttributes } from "react";

export default function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded bg-focus px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}