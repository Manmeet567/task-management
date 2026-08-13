import { X } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
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

  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  /*
   * Close through one shared function.
   *
   * Focus is restored BEFORE the parent changes
   * isOpen to false.
   */
  const handleClose = useCallback(() => {
    if (closeDisabled) {
      return;
    }

    previouslyFocusedElement.current?.focus();

    onClose();
  }, [closeDisabled, onClose]);

  /*
   * Mount immediately when opening.
   *
   * When closing, leave the modal mounted for
   * 200ms so the CSS exit animation can finish.
   */
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      setShouldRender(true);

      return;
    }

    /*
     * This also handles programmatic closes,
     * such as closing after a successful save.
     */
    previouslyFocusedElement.current?.focus();

    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, 200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isOpen]);

  /*
   * Move focus into the dialog when it opens.
   */
  useEffect(() => {
    if (!isOpen || !shouldRender) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen, shouldRender]);

  /*
   * Lock page scrolling while modal is open
   * and support Escape-to-close.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!shouldRender) {
    return null;
  }

  const motionState = isOpen ? "open" : "closed";

  return createPortal(
    <div
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        !isOpen ? "pointer-events-none" : "",
      ].join(" ")}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        data-state={motionState}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            handleClose();
          }
        }}
        className="motion-modal-backdrop absolute inset-0 cursor-default bg-slate-950/30 backdrop-blur-[2px]"
      />

      {/* Dialog */}
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
            ref={closeButtonRef}
            type="button"
            disabled={closeDisabled}
            onClick={handleClose}
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
