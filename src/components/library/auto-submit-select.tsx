"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AutoSubmitSelectProps = {
  className?: string;
  defaultValue: string;
  id?: string;
  name: string;
  options: Array<[string, string]>;
};

export function AutoSubmitSelect({ className, defaultValue, id, name, options }: AutoSubmitSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const selected = options.find(([optionValue]) => optionValue === value) ?? options[0];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <input name={name} type="hidden" value={value} />
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "pf-select-trigger sm:w-72",
          className
        )}
        id={id}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{selected?.[1] ?? "Most relevant"}</span>
        <ChevronDown aria-hidden="true" className={cn("h-5 w-5 shrink-0 text-white transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="pf-select-content absolute left-0 right-0 mt-2 p-1.5" role="listbox">
          {options.map(([optionValue, label]) => {
            const isSelected = optionValue === value;

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  "pf-select-item",
                  isSelected && "bg-violet-500/18 text-white"
                )}
                key={optionValue}
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  setValue(optionValue);
                  setOpen(false);
                  window.setTimeout(() => form?.requestSubmit(), 0);
                }}
                role="option"
                type="button"
              >
                <span className="truncate">{label}</span>
                {isSelected ? <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-lime-400" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
