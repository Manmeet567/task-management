import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const initialTheme = getInitialTheme();

applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: initialTheme,

      toggleTheme: () => {
        set((state) => {
          const nextTheme = state.theme === "light" ? "dark" : "light";

          applyTheme(nextTheme);

          return {
            theme: nextTheme,
          };
        });
      },
    }),
    {
      name: "task-management-theme",

      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    },
  ),
);
