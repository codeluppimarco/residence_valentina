"use client";

import { cn } from "@/lib/cn";

type ToggleProps = {
  checked: boolean;
  onChange: () => void;
  label?: string;
  id?: string;
};

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-[22px] w-10 shrink-0 cursor-pointer rounded-pill border-0 transition-colors",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-[18px] w-[18px] rounded-pill bg-white transition-all",
          checked ? "right-0.5" : "left-0.5",
        )}
      />
    </button>
  );
}
