import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "accent";
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`book-badge book-badge--${tone}`}>{children}</span>;
}
