import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import { Target, CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function Strategy() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const objectives = [
    { name: t("strategy.objectives.academic") || "Excellence Académique", progress: 78, status: "on-track", target: "Taux réussite > 80%" },
    { name: t("strategy.objectives.research") || "Recherche & Innovation", progress: 65, status: "at-risk", target: "500+ publications/an" },
    { name: t("strategy.objectives.digital") || "Transformation Digitale", progress: 42, status: "delayed", target: "100% plateformes en ligne" },
    { name: t("strategy.objectives.international") || "Partenariats Internationaux", progress: 88, status: "on-track", target: "50+ accords actifs" },
    { name: t("strategy.objectives.sustainable") || "Développement Durable", progress: 55, status: "at-risk", target: "30% réduction carbone" },
    { name: t("strategy.objectives.quality") || "Gouvernance & Qualité", progress: 72, status: "on-track", target: "Certification ISO" },
  ];

  const radarData = [
    { axis: t("strategy.radar.academic") || "Académique", value: 78 },
    { axis: t("strategy.radar.research") || "Recherche", value: 65 },
    { axis: t("strategy.radar.digital") || "Digital", value: 42 },
    { axis: t("strategy.radar.international") || "International", value: 88 },
    { axis: t("strategy.radar.sustainable") || "Durable", value: 55 },
    { axis: t("strategy.radar.quality") || "Qualité", value: 72 },
  ];

  const statusColor = (s: string) => s === "on-track" ? "#22c55e" : s === "at-risk" ? isDark ? '#D4AF37' : '#f59e0b' : "#ef4444";
  const statusIcon = (s: string) => s === "on-track" ? <CheckCircle2 size={16} color="#22c55e" /> : s === "at-risk" ? <Clock size={16} color={isDark ? '#D4AF37' : '#f59e0b'} /> : <AlertCircle size={16} color="#ef4444" />;
  const statusLabel = (s: string) => s === "on-track" ? (t("strategy.status.on_track") || "En bonne voie") : s === "at-risk" ? (t("strategy.status.at_risk") || "À surveiller") : (t("strategy.status.delayed") || "En retard");

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("strategy.title") || "Plan Stratégique"}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("strategy.subtitle") || "Suivi des objectifs stratégiques • Horizon 2026"}</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        {[
          { label: t("strategy.kpis.on_track"), count: objectives.filter(o => o.status === "on-track").length, color: "#22c55e", icon: <CheckCircle2 size={20} /> },
          { label: t("strategy.kpis.at_risk"), count: objectives.filter(o => o.status === "at-risk").length, color: isDark ? '#D4AF37' : '#f59e0b', icon: <Clock size={20} /> },
          { label: t("strategy.kpis.delayed"), count: objectives.filter(o => o.status === "delayed").length, color: "#ef4444", icon: <AlertCircle size={20} /> },
        ].map((s, i) => (
          <div key={i} className="uc-card" style={{ padding: '22px 24px', borderLeft: `4px solid ${s.color}` }}>
            <div className="flex items-center gap-3">
              <div style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--uc-text)' }}>{s.count}</div>
                <div style={{ fontSize: 12, color: 'var(--uc-text-muted)' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        {/* Objectives List */}
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            <Target size={16} style={{ display: 'inline', marginRight: 8, color: accent }} />
            {t("strategy.charts.objectives") || "Objectifs Stratégiques"}
          </h3>
          <div className="flex flex-col gap-4">
            {objectives.map((obj, i) => (
              <div key={i} style={{ padding: '16px 20px', background: 'var(--uc-bg)', borderRadius: 12, border: '1px solid var(--uc-border)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <div className="flex items-center gap-2">
                    {statusIcon(obj.status)}
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--uc-text)' }}>{obj.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(obj.status), padding: '3px 10px', borderRadius: 20, background: `${statusColor(obj.status)}15` }}>
                    {statusLabel(obj.status)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginBottom: 8 }}>{t("strategy.labels.target") || "Cible"}: {obj.target}</div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--uc-border)' }}>
                  <div style={{ width: `${obj.progress}%`, height: '100%', borderRadius: 4, background: statusColor(obj.status), transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: statusColor(obj.status), marginTop: 4 }}>{obj.progress}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar */}
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("strategy.charts.radar_view") || "Vue Radar"}
          </h3>
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--uc-border)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 10 }} domain={[0, 100]} />
              <Radar name="Progression" dataKey="value" stroke={accent} fill={accent} fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
