import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const variantClass = variant === "secondary" ? "button-secondary" : "";
  return <button className={`${variantClass} ${className}`.trim()} {...props}>{children}</button>;
}
