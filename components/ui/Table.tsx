import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function TableCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("overflow-hidden overflow-x-auto rounded-card border border-border bg-surface", className)}
      {...props}
    />
  );
}

export function TableHeaderRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid min-w-[640px] border-b border-border bg-bg", className)} {...props} />;
}

export function TableHeadCell({ className, ...props }: ThHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 py-3 text-xs font-bold uppercase tracking-wide text-sub", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid min-w-[640px] items-center border-b border-border last:border-b-0", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3.5 text-sm text-sub", className)} {...props} />;
}

export function TableCellStrong({ className, ...props }: TdHTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3.5 text-sm font-semibold text-ink", className)} {...props} />;
}
