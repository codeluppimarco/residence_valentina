import { statusBadgeClasses } from "@/lib/status";
import type { StatusLabel } from "@/lib/types";
import { cn } from "@/lib/cn";

type BadgeProps = {
  status: StatusLabel;
  className?: string;
};

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 rounded-pill text-[12.5px] font-semibold whitespace-nowrap",
        statusBadgeClasses[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
