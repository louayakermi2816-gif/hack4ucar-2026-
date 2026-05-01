/**
 * Text.tsx — Typography primitive with strict hierarchy.
 *
 * Enforces the design system's typographic scale across all pages.
 * Maps variant names to exact size/weight/tracking combos.
 */
import type { ElementType, ReactNode, HTMLAttributes } from "react";

type TextVariant =
  | "display"      // Massive KPI metrics: 48px extrabold
  | "heading-lg"   // Page titles: 24px bold
  | "heading-md"   // Section titles: 18px semibold
  | "body"         // Body text: 14px regular
  | "label"        // KPI labels, badges: 12px medium uppercase
  | "micro";       // Timestamps, metadata: 11px medium uppercase

interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Typographic variant */
  variant?: TextVariant;
  /** HTML element to render */
  as?: ElementType;
  /** Text content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Text color override */
  color?: string;
}

const variantStyles: Record<TextVariant, string> = {
  display: "text-5xl font-extrabold tracking-tight text-zinc-50 leading-none",
  "heading-lg": "text-2xl font-bold tracking-tight text-zinc-50",
  "heading-md": "text-lg font-semibold text-zinc-100",
  body: "text-sm font-normal text-zinc-300 leading-relaxed",
  label: "text-xs font-medium uppercase tracking-widest text-zinc-400",
  micro: "text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500",
};

const defaultElements: Record<TextVariant, ElementType> = {
  display: "span",
  "heading-lg": "h1",
  "heading-md": "h2",
  body: "p",
  label: "span",
  micro: "span",
};

export default function Text({
  variant = "body",
  as,
  children,
  className = "",
  color,
  ...rest
}: TextProps) {
  const Component = as || defaultElements[variant];
  const colorClass = color || "";
  
  return (
    <Component
      className={`${variantStyles[variant]} ${colorClass} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
