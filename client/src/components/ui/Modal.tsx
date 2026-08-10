import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl dark:bg-ink"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}