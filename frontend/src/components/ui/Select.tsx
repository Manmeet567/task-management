import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SelectOption<T extends string> {
  label: string;
  value: T;
}

interface SelectProps<T extends string> {
  value: T | "";
  options: SelectOption<T>[];
  placeholder: string;
  onChange: (value: T | "") => void;
}

export default function Select<T extends string>({
  value,
  options,
  placeholder,
  onChange,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

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
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="
          flex w-full cursor-pointer
          items-center justify-between gap-3
          rounded-xl border border-border
          bg-background px-3 py-2.5
          text-left text-sm text-text
          outline-none transition
          hover:bg-surface-muted
          focus:border-primary
          focus:ring-4 focus:ring-indigo-100
          dark:focus:ring-indigo-950
        "
      >
        <span className={selectedOption ? "text-text" : "text-text-muted"}>
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          size={16}
          className={[
            "shrink-0 text-text-muted transition-transform duration-200 ease-out",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="
            absolute left-0 right-0
            top-[calc(100%+0.4rem)] z-40
            max-h-64 overflow-y-auto
            motion-popover-in rounded-xl border border-border
            bg-surface p-1.5
            shadow-xl
            shadow-slate-200/40
            dark:shadow-black/30
          "
        >
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="
              flex w-full cursor-pointer
              items-center justify-between
              rounded-lg px-3 py-2.5
              text-left text-sm
              text-text-muted transition
              hover:bg-surface-muted
              hover:text-text
            "
          >
            {placeholder}

            {value === "" && <Check size={16} className="text-primary" />}
          </button>

          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);

                  setIsOpen(false);
                }}
                className={[
                  "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition",
                  isSelected
                    ? "bg-accent-soft font-medium text-indigo-700 dark:text-indigo-200"
                    : "text-text hover:bg-surface-muted",
                ].join(" ")}
              >
                {option.label}

                {isSelected && <Check size={16} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
