import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex bg-ink/40 p-4" onClick={onClose}>
      <div
        className="m-auto max-h-full w-full max-w-md overflow-y-auto rounded-lg bg-paper p-6 shadow-xl dark:bg-ink"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}