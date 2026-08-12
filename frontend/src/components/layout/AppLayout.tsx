import { LayoutDashboard, ListTodo, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../../stores/auth.store";
import ThemeToggle from "../ui/ThemeToggle";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Tasks",
    to: "/tasks",
    icon: ListTodo,
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();

    queryClient.clear();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
            T
          </div>

          <div>
            <p className="font-semibold tracking-tight text-text">TaskFlow</p>

            <p className="text-xs text-text-muted">Task management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-accent-soft text-indigo-700 dark:text-indigo-200"
                    : "text-text-muted hover:bg-surface-muted hover:text-text",
                ].join(" ")
              }
            >
              <Icon size={19} />

              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-xl bg-surface-muted px-4 py-3">
          <p className="truncate text-sm font-medium text-text">
            {user?.email}
          </p>

          <p className="mt-0.5 text-xs text-text-muted">Signed in</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-text-muted lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="lg:hidden">
            <p className="font-semibold">TaskFlow</p>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative h-full w-72 max-w-[85vw] border-r border-border bg-surface shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted"
              aria-label="Close navigation"
            >
              <X size={19} />
            </button>

            <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      <main className="lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
