import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldControlClasses } from "./field-classes";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(fieldControlClasses, className)} {...props} />;
}
