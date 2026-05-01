/**
 * SectionTitle.tsx — "Contained Title" system.
 * Light mode, spacious design.
 */
import type { ReactNode } from "react";

interface SectionTitleProps {
  /** Primary title text */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Optional right-side action element (link, button, etc.) */
  action?: ReactNode;
}

export default function SectionTitle({
  title,
  subtitle,
  action,
}: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex flex-col">
        <h2 className="text-[16px] font-extrabold uppercase tracking-widest text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] font-bold text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
