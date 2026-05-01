/**
 * KpiCard.tsx — Standardized KPI card component.
 * Light mode, premium spacing and typography.
 */
import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  /** Icon element (e.g., from lucide-react) */
  icon: ReactNode;
  /** KPI label text */
  label: string;
  /** The main metric value (already formatted) */
  value: string;
  /** Trend value text (e.g., "+4.2%") */
  trend?: string;
  /** Trend direction for color coding */
  trendDirection?: "success" | "danger" | "neutral";
  /** Color for the icon background and subtle accent */
  accentColor?: string;
  /** Animation variants for framer-motion */
  variants?: any;
}

const trendConfig = {
  success: {
    bg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <TrendingUp size={14} />,
  },
  danger: {
    bg: "bg-red-50 text-red-700 border border-red-200",
    icon: <TrendingDown size={14} />,
  },
  neutral: {
    bg: "bg-slate-100 text-slate-700 border border-slate-200",
    icon: <Minus size={14} />,
  },
};

export default function KpiCard({
  icon,
  label,
  value,
  trend,
  trendDirection = "neutral",
  accentColor = "text-blue-600 bg-blue-50",
  variants,
}: KpiCardProps) {
  const trendStyle = trendConfig[trendDirection];

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all min-h-[160px] flex flex-col justify-between"
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between mb-6">
        <p className="text-[13px] font-extrabold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${accentColor}`}
        >
          {icon}
        </div>
      </div>

      {/* Metric value */}
      <p className="text-[38px] font-extrabold tracking-tight text-slate-900 leading-none mb-4">
        {value}
      </p>

      {/* Trend pill */}
      {trend && (
        <div className="flex items-center mt-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold ${trendStyle.bg}`}
          >
            {trendStyle.icon}
            {trend}
          </span>
        </div>
      )}
    </motion.div>
  );
}
