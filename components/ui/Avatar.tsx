import type { AriaAttributes } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  ariaHasPopup?: AriaAttributes["aria-haspopup"];
  ariaExpanded?: boolean;
};

const sizeClasses = {
  sm: "w-[30px] h-[30px] text-[11.5px]",
  md: "w-11 h-11 text-[13px]",
  lg: "w-[60px] h-[60px] text-xl",
};

export function Avatar({ name, size = "md", onClick, className, ariaHasPopup, ariaExpanded }: AvatarProps) {
  const classes = cn(
    "inline-flex items-center justify-center shrink-0 rounded-pill bg-primary-soft text-primary-dark font-bold",
    sizeClasses[size],
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaExpanded}
        className={cn(classes, "cursor-pointer border-0")}
      >
        {initials(name)}
      </button>
    );
  }

  return <div className={classes}>{initials(name)}</div>;
}
