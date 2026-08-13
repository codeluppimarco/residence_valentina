import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-surface text-ink border border-border hover:bg-bg",
  danger: "bg-danger-soft text-danger border border-danger-soft hover:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-3 text-[15px]",
  sm: "min-h-11 px-4 py-2.5 text-sm",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "sm",
  fullWidth?: boolean,
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center rounded-input font-semibold font-sans cursor-pointer whitespace-nowrap transition-colors",
    variantClasses[variant],
    sizeClasses[size],
    variant === "primary" && "font-bold",
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "sm",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonClasses(variant, size, fullWidth, className)}
      {...props}
    />
  );
}
