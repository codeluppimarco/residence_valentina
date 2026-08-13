import { cn } from "@/lib/cn";

type LogoBadgeProps = {
  size?: "sm" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-[34px] h-[34px] rounded-[9px] text-[13px]",
  lg: "w-12 h-12 rounded-xl text-lg",
};

export function LogoBadge({ size = "lg", className }: LogoBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 bg-primary text-white font-bold",
        sizeClasses[size],
        className,
      )}
    >
      RV
    </div>
  );
}
