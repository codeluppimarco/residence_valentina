import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type PanelProps = HTMLAttributes<HTMLDivElement>;

export function Panel({ className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-card p-5 sm:p-[22px]",
        className,
      )}
      {...props}
    />
  );
}
