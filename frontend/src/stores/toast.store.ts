import { create } from "zustand";

export type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toast: Toast | null;

  showToast: (message: string, type?: ToastType) => void;

  clearToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,

  showToast: (message, type = "success") => {
    set({
      toast: {
        id: Date.now(),
        message,
        type,
      },
    });
  },

  clearToast: () => {
    set({
      toast: null,
    });
  },
}));
