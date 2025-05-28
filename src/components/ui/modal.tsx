import { useEffect, useRef } from "react";

interface ModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  buttonLabel?: string;
  onAction?: () => void;
}

export function Modal({
  title,
  message,
  isOpen,
  onClose,
  buttonLabel = "OK",
  onAction,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg shadow-xl p-0 w-full max-w-sm border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      role="alertdialog"
      onClose={onClose}
    >
      <form method="dialog" className="p-6">
        <h2 id="modal-title" className="text-lg font-bold mb-2">
          {title}
        </h2>
        <p id="modal-desc" className="mb-6 text-base">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              onAction?.();
              onClose();
            }}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            autoFocus
          >
            {buttonLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
