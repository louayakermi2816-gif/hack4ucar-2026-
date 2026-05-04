import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { LineChart as LineChartIcon, BarChart3, PieChart as PieIcon, TrendingUp, ArrowUpRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
  ScatterChart, Scatter, ZAxis,
} from "recharts";

export default function Analytics() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/api/dashboard/overview").then(r => r.data),
  });
  const { data: byType } = useQuery({
    queryKey: ["by-type"],
    queryFn: () => api.get("/api/dashboard/by-type").then(r => r.data),
  });
  const { data: rankEmploy } = useQuery({
    queryKey: ["ranking-employability"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=employability_rate&limit=10").then(r => r.data),
  });
  const { data: dropoutRisk } = useQuery({
    queryKey: ["ml-dropout-risk"],
    queryFn: () => api.get("/api/ml/dropout-risk").then(r => r.data),
  });
  const { data: enrollForecast } = useQuery({
    queryKey: ["ml-enrollment-forecast"],
    queryFn: () => api.get("/api/ml/enrollment-forecast").then(r => r.data),
  });
  const { data: budgetForecast } = useQuery({
    queryKey: ["ml-budget-forecast"],
    queryFn: () => api.get("/api/ml/budget-forecast").then(r => r.data),
  });

  if (isLoading) return <Loader accent={accent} />;

  const correlationData = [
    { x: 72, y: 65, z: 4200, name: "Facultés" },
    { x: 85, y: 78, z: 3100, name: "Écoles Ing." },
    { x: 68, y: 62, z: 5500, name: "Instituts" },
    { x: 91, y: 88, z: 1800, name: "Polytechnique" },
    { x: 76, y: 71, z: 3800, name: "Sciences" },
  ];

  const performanceTrend = [
    { year: "2019", success: 65, employability: 58, satisfaction: 72 },
    { year: "2020", success: 67, employability: 61, satisfaction: 74 },
    { year: "2021", success: 69, employability: 64, satisfaction: 76 },
    { year: "2022", success: 71, employability: 68, satisfaction: 79 },
    { year: "2023", success: overview?.academic?.avg_success_rate || 72, employability: 72, satisfaction: 82 },
  ];

  const typeColors = isDark
    ? ['#D4AF37', '#f0cc6e', '#8B7225']
    : ['#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("analytics.title") || "Analyses Avancées"}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("analytics.subtitle") || "Corrélations, tendances et insights prédictifs • 2023-24"}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-5" style={{ marginBottom: 28 }}>
        {[
          { label: t("analytics.kpis.global_score"), value: "74.2", icon: <TrendingUp size={20} />, sub: t("analytics.kpi_subs.global_score") || "Indice composite" },
          { label: t("analytics.kpis.ai_models"), value: "3", icon: <LineChartIcon size={20} />, sub: t("analytics.kpi_subs.ai_models") || "Prédiction & Clustering" },
          { label: t("analytics.kpis.alerts"), value: `${overview?.active_alerts || 0}`, icon: <BarChart3 size={20} />, sub: t("analytics.kpi_subs.alerts") || "Détectées automatiquement" },
          { label: t("analytics.kpis.institutions"), value: `${overview?.total_institutions || 33}`, icon: <PieIcon size={20} />, sub: t("analytics.kpi_subs.institutions") || "Couverture complète" },
        ].map((k, i) => (
          <div key={i} className="uc-card" style={{ padding: '22px 24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>{k.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.1em' }}>{k.label.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--uc-text)' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        {/* Multi-line performance trends */}
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("analytics.charts.multi_trend") || "Tendances Multi-Indicateurs"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" domain={[50, 100]} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Line type="monotone" dataKey="success" name={t("analytics.labels.success") || "Réussite %"} stroke={accent} strokeWidth={2.5} dot={{ r: 4, fill: accent }} />
              <Line type="monotone" dataKey="employability" name={t("analytics.labels.employability") || "Employabilité %"} stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="satisfaction" name={t("analytics.labels.satisfaction") || "Satisfaction %"} stroke={isDark ? '#f0cc6e' : '#60a5fa'} strokeWidth={2} dot={{ r: 3 }} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Institutions by Type pie */}
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("analytics.charts.by_type") || "Établissements par Type"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={(byType || []).map((d: any, i: number) => ({ ...d, name: d.type, value: d.count, color: typeColors[i % typeColors.length] }))} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {(byType || []).map((_: any, i: number) => <Cell key={i} fill={typeColors[i % typeColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employability Ranking */}
      <div className="uc-card" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
          <ArrowUpRight size={16} style={{ display: 'inline', marginRight: 8, color: accent }} />
          {t("analytics.charts.ranking") || "Classement Employabilité"}
        </h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={rankEmploy || []} layout="vertical" margin={{ left: 180 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
            <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" domain={[0, 100]} />
            <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 10 }} stroke="var(--uc-border)" width={170} />
            <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
            <Bar dataKey="value" name="Employabilité %" fill={accent} radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── AI PREDICTIONS ── */}
      <div style={{ marginTop: 36, marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("analytics.ai_preds.title") || "Prédictions IA"}
        </h2>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 12, marginTop: 4 }}>
          {t("analytics.ai_preds.subtitle") || "Modèles scikit-learn entraînés sur les données historiques 2019-2026"}
        </p>
      </div>

      {/* Dropout Risk Table */}
      <div className="uc-card" style={{ padding: '24px 28px', marginBottom: 28 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
          {t("analytics.ai_preds.dropout_risk") || "Risque d'Abandon par Établissement"}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--uc-border)' }}>
                {[
                  t("analytics.table.institution") || "Établissement", 
                  t("analytics.table.current_rate") || "Taux Actuel", 
                  t("analytics.table.predicted") || "Prédit", 
                  t("analytics.table.trend") || "Tendance", 
                  t("analytics.table.score") || "Score", 
                  t("analytics.table.risk") || "Risque", 
                  t("analytics.table.confidence") || "Confiance"
                ].map((h, i) => (
                  <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--uc-text-muted)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(dropoutRisk || []).slice(0, 10).map((r: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--uc-border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--uc-text)', fontWeight: 500 }}>{r.institution_name?.substring(0, 40)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--uc-text)' }}>{r.current_dropout_rate}%</td>
                  <td style={{ padding: '10px 12px', color: 'var(--uc-text)' }}>{r.predicted_dropout_rate}%</td>
                  <td style={{ padding: '10px 12px', color: r.trend_slope > 0 ? '#ef4444' : '#22c55e' }}>
                    {r.trend_slope > 0 ? '\u2191' : '\u2193'} {Math.abs(r.trend_slope).toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: accent }}>{r.risk_score}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: r.risk_level === 'HIGH' ? '#ef444420' : r.risk_level === 'MEDIUM' ? `${accent}20` : '#22c55e20',
                      color: r.risk_level === 'HIGH' ? '#ef4444' : r.risk_level === 'MEDIUM' ? accent : '#22c55e',
                    }}>{r.risk_level}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--uc-text-muted)' }}>{r.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Forecast */}
      <div className="uc-card" style={{ padding: '24px 28px', marginBottom: 28 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)' }}>
            {t("analytics.ai_preds.enrollment_forecast") || "Prévision des Inscriptions 2026-2027"}
          </h3>
          {enrollForecast?.confidence && (
            <span style={{ fontSize: 11, color: accent, background: `${accent}15`, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
              {t("analytics.ai_preds.confidence_label") || "Confiance"}: {enrollForecast.confidence}%
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={[...(enrollForecast?.historical || []), ...(enrollForecast?.forecast || [])]}>
            <defs>
              <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
            <XAxis dataKey="semester" tick={{ fill: 'var(--uc-text-muted)', fontSize: 10 }} stroke="var(--uc-border)" />
            <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
            <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
            <Area type="monotone" dataKey="enrolled" name={t("analytics.labels.enrolled") || "Inscrits"} stroke={accent} fill="url(#gradForecast)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Forecast */}
      <div className="uc-card" style={{ padding: '24px 28px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)' }}>
            {t("analytics.ai_preds.budget_forecast") || "Prévision Budgétaire 2026"}
          </h3>
          {budgetForecast?.confidence_allocated && (
            <span style={{ fontSize: 11, color: accent, background: `${accent}15`, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
              {t("analytics.ai_preds.confidence_label") || "Confiance"}: {budgetForecast.confidence_allocated}%
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[...(budgetForecast?.historical || []).slice(-6), ...(budgetForecast?.forecast || [])]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
            <XAxis dataKey="period" tick={{ fill: 'var(--uc-text-muted)', fontSize: 10 }} stroke="var(--uc-border)" />
            <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
            <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
            <Bar dataKey="allocated" name={t("analytics.labels.allocated") || "Alloué"} fill={accent} radius={[4, 4, 0, 0]} barSize={20} opacity={0.7} />
            <Bar dataKey="consumed" name={t("analytics.labels.consumed") || "Consommé"} fill={isDark ? '#f0cc6e' : '#60a5fa'} radius={[4, 4, 0, 0]} barSize={20} />
            <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Loader({ accent }: { accent: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center" style={{ height: '60vh' }}>
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: 48, height: 48, border: '3px solid var(--uc-border)', borderTopColor: accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>{t("analytics.loading") || "Chargement..."}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
