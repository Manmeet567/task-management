import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  closeDisabled = false,
}: ModalProps) {
  const titleId = useId();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setShouldRender(true);
    }
  }

  useEffect(() => {
    if (isOpen || !shouldRender) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, 200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, closeDisabled]);

  if (!shouldRender) {
    return null;
  }

  const motionState = isOpen ? "open" : "closed";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        aria-label="Close modal"
        disabled={closeDisabled}
        onClick={onClose}
        data-state={motionState}
        className="motion-modal-backdrop absolute inset-0 cursor-default bg-slate-950/30 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-state={motionState}
        className="motion-modal-panel relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-surface shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-5">
          <h2 id={titleId} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>

          <button
            type="button"
            disabled={closeDisabled}
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-text-muted transition hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}
