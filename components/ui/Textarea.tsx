import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldControlClasses } from "./field-classes";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(fieldControlClasses, "min-h-[80px] resize-y", className)}
      {...props}
    />
  );
}
