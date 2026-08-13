import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect } from "react";

import { useToastStore } from "../../stores/toast.store";

export default function Toast() {
  const toast = useToastStore((state) => state.toast);

  const clearToast = useToastStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(clearToast, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast, clearToast]);

  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";

  const Icon = isSuccess ? CheckCircle2 : CircleAlert;

  return (
    <div
      role="status"
      className="
        fixed bottom-5 right-5
        motion-toast-in z-200 flex max-w-sm
        items-center gap-3
        rounded-2xl border border-border
        bg-surface px-4 py-3
        shadow-xl
      "
    >
      <Icon
        size={19}
        className={isSuccess ? "text-emerald-500" : "text-red-500"}
      />

      <p className="flex-1 text-sm font-medium text-text">{toast.message}</p>

      <button
        type="button"
        onClick={clearToast}
        className="cursor-pointer text-text-muted transition hover:text-text"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
