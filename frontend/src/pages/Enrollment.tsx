import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { GraduationCap, Users, TrendingUp, TrendingDown, UserCheck, BookOpen, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

export default function Enrollment() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/api/dashboard/overview").then(r => r.data),
  });
  const { data: ranking } = useQuery({
    queryKey: ["ranking-enrollment"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=success_rate&limit=10").then(r => r.data),
  });
  const { data: trends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.get("/api/dashboard/trends").then(r => r.data),
  });

  if (isLoading) return <LoadingSpinner accent={accent} />;

  const totalEnrolled = overview?.academic?.total_enrolled_students || 0;
  const avgSuccess = overview?.academic?.avg_success_rate || 0;
  const avgDropout = overview?.academic?.avg_dropout_rate || 0;
  const avgAttendance = overview?.academic?.avg_attendance_rate || 0;
  const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

  const trendData = (trends?.academic || []).map((d: any) => ({
    year: d.semester, enrolled: d.enrolled,
  }));

  const distributionData = [
    { name: "Facultés", value: 45, color: isDark ? '#D4AF37' : '#3b82f6' },
    { name: "Écoles", value: 30, color: isDark ? '#f0cc6e' : '#60a5fa' },
    { name: "Instituts", value: 25, color: isDark ? '#8B7225' : '#93c5fd' },
  ];

  const kpis = [
    { label: "Total Inscrits", value: fmt(totalEnrolled), icon: <GraduationCap size={20} />, trend: "+3.2%", up: true },
    { label: "Taux de Réussite", value: `${avgSuccess}%`, icon: <UserCheck size={20} />, trend: "+1.9%", up: true },
    { label: "Taux d'Abandon", value: `${avgDropout}%`, icon: <TrendingDown size={20} />, trend: "-0.4%", up: false },
    { label: "Taux de Présence", value: `${avgAttendance}%`, icon: <Users size={20} />, trend: "+0.8%", up: true },
  ];

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Inscription & Effectifs
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>Année Universitaire 2023-24 • Vue d'ensemble des inscriptions</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-5" style={{ marginBottom: 28 }}>
        {kpis.map((k, i) => (
          <div key={i} className="uc-card" style={{ padding: '22px 24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>{k.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.1em' }}>{k.label.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--uc-text)' }}>{k.value}</div>
            <div className="flex items-center gap-1" style={{ marginTop: 6 }}>
              {k.up ? <ArrowUpRight size={14} color="#22c55e" /> : <ArrowDownRight size={14} color="#ef4444" />}
              <span style={{ fontSize: 12, fontWeight: 600, color: k.up ? '#22c55e' : '#ef4444' }}>{k.trend}</span>
              <span style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginLeft: 4 }}>vs N-1</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        {/* Area Chart - Enrollment Trends */}
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            <BookOpen size={16} style={{ display: 'inline', marginRight: 8, color: accent }} />
            Evolution des Inscriptions (2019-2025)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradUndergrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#f0cc6e' : '#60a5fa'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDark ? '#f0cc6e' : '#60a5fa'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Area type="monotone" dataKey="enrolled" name="Inscrits" stroke={accent} fill="url(#gradUndergrad)" strokeWidth={2} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Distribution */}
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            Répartition par Type
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {distributionData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Institution Ranking */}
      <div className="uc-card" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
          <TrendingUp size={16} style={{ display: 'inline', marginRight: 8, color: accent }} />
          Classement par Taux de Réussite
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={ranking || []} layout="vertical" margin={{ left: 180 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
            <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" domain={[0, 100]} />
            <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 10 }} stroke="var(--uc-border)" width={170} />
            <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
            <Bar dataKey="value" name="Taux de Réussite (%)" fill={accent} radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LoadingSpinner({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center" style={{ height: '60vh' }}>
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: 48, height: 48, border: '3px solid var(--uc-border)', borderTopColor: accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>Chargement des inscriptions...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
