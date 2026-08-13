import { DayPicker } from "@daypicker/react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function parseDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatValue(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function displayDate(value: string): string {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function isSameLocalDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select due date",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selected = parseDate(value);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="
          flex w-full cursor-pointer
          items-center gap-3
          rounded-xl border border-border
          bg-background px-4 py-3
          text-left text-sm outline-none
          transition
          hover:bg-surface-muted
          focus:border-primary
          focus:ring-4
          focus:ring-indigo-100
          dark:focus:ring-indigo-950
        "
      >
        <CalendarDays size={17} className="text-text-muted" />

        <span
          className={[
            "flex-1",
            value ? "text-text" : "text-text-muted/60",
          ].join(" ")}
        >
          {value ? displayDate(value) : placeholder}
        </span>

        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onChange("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onChange("");
              }
            }}
            className="rounded-md p-1 text-text-muted transition hover:bg-surface hover:text-text"
            aria-label="Clear due date"
          >
            <X size={15} />
          </span>
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </button>

      {isOpen && (
        <div
          className="
            absolute bottom-[calc(100%+0.5rem)]
            left-0 z-50
            rounded-2xl border border-border
            bg-surface p-3
            shadow-2xl
          "
        >
          <DayPicker
            disabled={(date) => {
              const candidate = new Date(date);

              candidate.setHours(0, 0, 0, 0);

              if (selected && isSameLocalDay(candidate, selected)) {
                return false;
              }

              return candidate < today;
            }}
            animate
            mode="single"
            selected={selected}
            defaultMonth={selected ?? new Date()}
            onSelect={(date) => {
              if (!date) {
                return;
              }

              onChange(formatValue(date));

              setIsOpen(false);
            }}
            className="task-calendar"
          />
        </div>
      )}
    </div>
  );
}
