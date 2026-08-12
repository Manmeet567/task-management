import { Moon, Sun } from "lucide-react";

import { useThemeStore } from "../../stores/theme.store";

export default function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);

  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        flex h-10 w-10 cursor-pointer
        items-center justify-center rounded-xl
        border border-border bg-surface
        text-text-muted transition
        hover:bg-surface-muted hover:text-text
      "
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
