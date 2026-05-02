/**
 * Alerts.tsx — Premium alerts page with theme + i18n support.
 */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Shield, Info, Clock, Filter } from "lucide-react";

interface Alert {
  id: string;
  institution_id: string;
  kpi_domain: string;
  severity: string;
  message_fr: string;
  message_ar: string;
  triggered_at: string;
}

export default function AlertsPage() {
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterDomain, setFilterDomain] = useState("");
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';

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

  const severityConfig: Record<string, { icon: any; bg: string; border: string; text: string; dot: string }> = {
    HIGH: { icon: AlertTriangle, bg: isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.06)', border: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.2)', text: '#ef4444', dot: '#ef4444' },
    MEDIUM: { icon: Shield, bg: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.06)', border: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.2)', text: '#f59e0b', dot: '#f59e0b' },
    LOW: { icon: Info, bg: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.06)', border: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.2)', text: '#22c55e', dot: '#22c55e' },
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)', color: 'var(--uc-text)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("alerts.title")}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("alerts.subtitle")}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {["HIGH", "MEDIUM", "LOW"].map(sev => {
          const config = severityConfig[sev];
          const count = alerts.filter((a: Alert) => a.severity === sev).length;
          const Icon = config.icon;
          return (
            <div key={sev} className="uc-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `3px solid ${config.dot}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color: config.text }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--uc-text)', lineHeight: 1 }}>{count}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: config.text, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                  {sev === "HIGH" ? t("alerts.high") : sev === "MEDIUM" ? t("alerts.medium") : t("alerts.low")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--uc-text-muted)' }} />
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} style={selectStyle}>
          <option value="">{t("alerts.all_severities")}</option>
          <option value="HIGH">🔴 {t("alerts.high")}</option>
          <option value="MEDIUM">🟡 {t("alerts.medium")}</option>
          <option value="LOW">🟢 {t("alerts.low")}</option>
        </select>
        <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} style={selectStyle}>
          <option value="">{t("alerts.all_domains")}</option>
          {domains.map((d: string) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        {filtered.map((alert: Alert) => {
          const config = severityConfig[alert.severity] || severityConfig.LOW;
          const Icon = config.icon;
          return (
            <div key={alert.id} className="uc-card" style={{ padding: '20px 24px', borderLeft: `3px solid ${config.dot}`, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Icon size={16} style={{ color: config.text }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, borderRadius: 20, background: config.bg, color: config.text, border: `1px solid ${config.border}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {alert.severity === "HIGH" ? t("alerts.high") : alert.severity === "MEDIUM" ? t("alerts.medium") : t("alerts.low")}
                      </span>
                      <span style={{ padding: '3px 10px', fontSize: 10, fontWeight: 600, borderRadius: 20, background: 'var(--uc-sidebar-hover-bg)', color: 'var(--uc-text-muted)', border: '1px solid var(--uc-border)' }}>
                        {alert.kpi_domain}
                      </span>
                    </div>
                    {alert.message_fr && (
                      <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--uc-text)', lineHeight: 1.5 }}>{alert.message_fr}</p>
                    )}
                    {alert.message_ar && (
                      <p style={{ fontSize: 13, color: 'var(--uc-text-muted)', lineHeight: 1.5, marginTop: 4 }} dir="rtl">{alert.message_ar}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--uc-text-dim)', flexShrink: 0 }}>
                  <Clock size={12} />
                  <span style={{ fontSize: 11, fontWeight: 500 }}>
                    {alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString(i18n.language === "ar" ? "ar-TN" : i18n.language === "en" ? "en-US" : "fr-FR") : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>
            {t("alerts.no_alerts")}
          </div>
        )}
      </div>
    </div>
  );
}
