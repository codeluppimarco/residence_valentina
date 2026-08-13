import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type FieldGroupProps = HTMLAttributes<HTMLDivElement> & {
  full?: boolean;
};

export function FieldGroup({ className, full, ...props }: FieldGroupProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 mb-4", full && "lg:col-span-2", className)}
      {...props}
    />
  );
}
