/**
 * AlertItem.tsx — Modernized alert row component.
 * Light mode redesign.
 */

interface AlertItemProps {
  /** Alert severity level */
  severity: "high" | "medium" | "low";
  /** Alert message text */
  message: string;
  /** Time since alert (e.g., "il y a 5 min") */
  time: string;
  /** Associated metric value (e.g., "-12%") */
  value?: string;
  /** Click handler */
  onClick?: () => void;
}

const severityConfig = {
  high: {
    dot: "bg-red-500",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
    valueBg: "bg-red-50 text-red-700",
  },
  medium: {
    dot: "bg-amber-500",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    valueBg: "bg-amber-50 text-amber-700",
  },
  low: {
    dot: "bg-emerald-500",
    glow: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    valueBg: "bg-emerald-50 text-emerald-700",
  },
};

export default function AlertItem({
  severity,
  message,
  time,
  value,
  onClick,
}: AlertItemProps) {
  const config = severityConfig[severity];

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group"
    >
      {/* Severity dot with glow */}
      <div className="shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full ${config.dot} ${config.glow}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-blue-800 transition-colors">
          {message}
        </p>
        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
          {time}
        </p>
      </div>

      {/* Value pill */}
      {value && (
        <span
          className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-xl text-[12px] font-bold ${config.valueBg}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
