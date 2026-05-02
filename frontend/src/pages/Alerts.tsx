/**
 * Alerts.tsx — Alerts page, UcarOS Design System v2.
 * Uses SectionTitle, AlertItem, zinc palette.
 */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api";
import { useTranslation } from "react-i18next";
import SectionTitle from "../components/ui/SectionTitle";

interface Alert {
  id: string;
  institution_id: string;
  kpi_domain: string;
  severity: string;
  message_fr: string;
  message_ar: string;
  triggered_at: string;
}

const severityStyles: Record<string, string> = {
  HIGH: "bg-red-500/10 text-red-400 border-red-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterDomain, setFilterDomain] = useState("");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => api.get("/api/alerts").then((r) => r.data),
  });

  const filtered = alerts.filter((a: Alert) => {
    return (
      (!filterSeverity || a.severity === filterSeverity) &&
      (!filterDomain || a.kpi_domain === filterDomain)
    );
  });

  const domains = Array.from<string>(new Set(alerts.map((a: Alert) => a.kpi_domain)));

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

    <div className="flex flex-col gap-6" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SectionTitle
        title={t("alerts.title")}
        subtitle={t("alerts.subtitle")}
        accentColor="border-red-500"
        accentBg="bg-red-500/10"
      />

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-200 text-[13px] font-medium focus:outline-none focus:border-amber-500/40 cursor-pointer"
        >
          <option value="">{t("alerts.all_severities")}</option>
          <option value="HIGH">🔴 {t("alerts.high")}</option>
          <option value="MEDIUM">🟡 {t("alerts.medium")}</option>
          <option value="LOW">🟢 {t("alerts.low")}</option>
        </select>
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-200 text-[13px] font-medium focus:outline-none focus:border-amber-500/40 cursor-pointer"
        >
          <option value="">{t("alerts.all_domains")}</option>
          {domains.map((d: string) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        {filtered.map((alert: Alert) => (
          <div
            key={alert.id}
            className="bg-zinc-900 rounded-2xl border border-white/[0.06] p-6 hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full border ${severityStyles[alert.severity] || severityStyles.LOW}`}
                >
                  {alert.severity}
                </span>
                <span className="px-3 py-1.5 text-[11px] font-medium rounded-full bg-zinc-800 text-zinc-400 border border-white/[0.04]">
                  {alert.kpi_domain}
                </span>
              </div>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                {alert.triggered_at
                  ? new Date(alert.triggered_at).toLocaleDateString("fr-FR")
                  : "—"}
              </span>
            </div>
            {alert.message_fr && !isRTL && (
              <p className="text-[14px] text-zinc-200 font-medium mb-1 leading-relaxed text-left">
                {alert.message_fr}
              </p>
            )}
            {alert.message_ar && isRTL && (
              <p className="text-[14px] text-zinc-200 font-medium leading-relaxed text-right" dir="rtl">
                {alert.message_ar}
              </p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-500 text-[14px] font-medium">
            {t("alerts.none")}
          </div>
        )}
      </div>
    </div>
  );
}
