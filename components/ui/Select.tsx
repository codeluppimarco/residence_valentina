import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldControlClasses } from "./field-classes";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return <select className={cn(fieldControlClasses, className)} {...props} />;
}
