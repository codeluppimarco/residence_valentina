"use client";

import { useEffect, useId, type ReactNode } from "react";
import { Button } from "./Button";
import { FormError } from "./FormError";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  error?: string;
  saveLabel?: string;
  children: ReactNode;
};

export function Modal({ open, title, onClose, onSave, error, saveLabel = "Salva", children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[85vh] w-full max-w-[460px] flex-col rounded-card bg-surface px-[26px] pt-[22px] shadow-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-[18px] flex shrink-0 items-center justify-between">
          <div id={titleId} className="text-lg font-bold text-ink">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-input border-0 bg-transparent text-xl leading-none text-sub hover:bg-bg"
            aria-label="Chiudi"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            {children}
            <FormError message={error} />
          </div>

          <div className="flex shrink-0 gap-2.5 py-4">
            <Button type="submit" variant="primary" size="sm">
              {saveLabel}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Annulla
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
