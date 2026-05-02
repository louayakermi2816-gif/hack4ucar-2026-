import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { BookOpen, Award, TrendingUp, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from "recharts";

export default function AcademicAffairs() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/api/dashboard/overview").then(r => r.data),
  });
  const { data: rankingSuccess } = useQuery({
    queryKey: ["ranking-success"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=success_rate&limit=8").then(r => r.data),
  });
  const { data: rankingDropout } = useQuery({
    queryKey: ["ranking-dropout"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=dropout_rate&limit=8").then(r => r.data),
  });
  const { data: trends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.get("/api/dashboard/trends").then(r => r.data),
  });

  if (isLoading) return <Loader accent={accent} />;

  const avgSuccess = overview?.academic?.avg_success_rate || 0;
  const avgDropout = overview?.academic?.avg_dropout_rate || 0;
  const avgAttendance = overview?.academic?.avg_attendance_rate || 0;

  const kpis = [
    { label: t("academic.kpis.success_rate"), value: `${avgSuccess}%`, icon: <Award size={20} />, trend: "+1.9%", dir: "up" },
    { label: t("academic.kpis.dropout_rate"), value: `${avgDropout}%`, icon: <AlertTriangle size={20} />, trend: "-0.4%", dir: "down" },
    { label: t("academic.kpis.attendance_rate"), value: `${avgAttendance}%`, icon: <CheckCircle size={20} />, trend: "+0.8%", dir: "up" },
    { label: t("academic.kpis.repeat_rate"), value: "12.3%", icon: <TrendingUp size={20} />, trend: "→ 0.0%", dir: "neutral" },
  ];

  const semesterTrend = (trends?.academic || []).slice(-8).map((d: any) => ({
    semester: d.semester, success: d.success_rate, attendance: d.attendance_rate, dropout: d.dropout_rate,
  }));

  const radarData = [
    { metric: "Réussite", value: avgSuccess },
    { metric: "Présence", value: avgAttendance },
    { metric: "Employabilité", value: 76 },
    { metric: "Satisfaction", value: 82 },
    { metric: "Rétention", value: 100 - avgDropout },
  ];

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("academic.title") || "Affaires Académiques"}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("academic.subtitle") || "Performance académique • Année 2023-24"}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-5" style={{ marginBottom: 28 }}>
        {kpis.map((k, i) => (
          <div key={i} className="uc-card" style={{ padding: '22px 24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>{k.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.1em' }}>{k.label.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--uc-text)' }}>{k.value}</div>
            <div className="flex items-center gap-1" style={{ marginTop: 6 }}>
              {k.dir === "up" ? <ArrowUpRight size={14} color="#22c55e" /> : k.dir === "down" ? <ArrowDownRight size={14} color="#ef4444" /> : <ArrowRight size={14} color="var(--uc-text-muted)" />}
              <span style={{ fontSize: 12, fontWeight: 600, color: k.dir === "up" ? '#22c55e' : k.dir === "down" ? '#ef4444' : 'var(--uc-text-muted)' }}>{k.trend}</span>
              <span style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginLeft: 4 }}>YoY</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        {/* Line Chart */}
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            <BookOpen size={16} style={{ display: 'inline', marginRight: 8, color: accent }} />
            {t("academic.charts.semester_trends") || "Tendances Semestrielles"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={semesterTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis dataKey="semester" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Line type="monotone" dataKey="success" name={t("academic.labels.success") || "Réussite %"} stroke={accent} strokeWidth={2.5} dot={{ r: 4, fill: accent }} />
              <Line type="monotone" dataKey="attendance" name={t("academic.labels.attendance") || "Présence %"} stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="dropout" name={t("academic.labels.dropout") || "Abandon %"} stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("academic.charts.global_performance") || "Performance Globale"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--uc-border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke={accent} fill={accent} fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-2 gap-5">
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("academic.charts.top_success") || "Top Établissements — Taux de Réussite"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankingSuccess || []} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" domain={[0, 100]} />
              <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 9 }} stroke="var(--uc-border)" width={135} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="value" name={t("academic.labels.success") || "Réussite %"} fill={accent} radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("academic.charts.dropout_by_inst") || "Taux d'Abandon par Établissement"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankingDropout || []} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 9 }} stroke="var(--uc-border)" width={135} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="value" name={t("academic.labels.dropout") || "Abandon %"} fill="#ef4444" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
        <span style={{ color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>{t("academic.loading") || "Chargement des données académiques..."}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
