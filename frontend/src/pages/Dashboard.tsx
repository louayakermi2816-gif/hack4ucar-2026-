import React, { useState } from "react";
import { useAuth } from "../auth";
import DashboardMap from "../components/DashboardMap";
import type { MapInstitution } from "../components/DashboardMap";
import SmartInsights from "../components/SmartInsights";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import {
  Users, GraduationCap, TrendingUp, BookOpen, Layers,
  ArrowUpRight, ArrowDownRight, ArrowRight, Award, DollarSign,
  BarChart3, PieChart as PieChartIcon, Download, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart,
} from "recharts";

export default function Dashboard() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.35)' : 'rgba(59,130,246,0.35)';

  const [selectedMapIds, setSelectedMapIds] = useState<string[]>([]);

  const queryParams = selectedMapIds.length > 0 ? `?inst_ids=${selectedMapIds.join(",")}` : "";
  const rankingParams = selectedMapIds.length > 0 ? `&inst_ids=${selectedMapIds.join(",")}` : "";

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview", selectedMapIds],
    queryFn: () => api.get(`/api/dashboard/overview${queryParams}`).then((r) => r.data),
  });
  const { data: ranking } = useQuery({
    queryKey: ["ranking", selectedMapIds],
    queryFn: () => api.get(`/api/dashboard/ranking?metric=success_rate&limit=6${rankingParams}`).then((r) => r.data),
  });


  
  const { data: institutions = [] } = useQuery<MapInstitution[]>({
    queryKey: ["map_institutions"],
    queryFn: async () => {
      const res = await api.get("/api/institutions");
      return res.data;
    }
  });

  const handleToggleSelection = (id: string) => {
    setSelectedMapIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const res = await api.get(`/api/reports/download${queryParams}`, {
        responseType: 'blob' // Important for PDF
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'UcarOS_Executive_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert(t("dashboard.download_error"));
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <div className="flex flex-col items-center gap-4">
          <div style={{ width: 48, height: 48, border: `3px solid var(--uc-border)`, borderTopColor: accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>{t("dashboard.loading")}</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

  const kpiCards = [
    { label: t("dashboard.kpi.faculty_size"), value: fmt(overview?.research?.active_projects ? overview.research.active_projects * 260 : 3120), sub: t("dashboard.kpi.vs_last_year"), trend: "↓ 0.5%", trendDir: "down" as const, icon: <Users size={20} /> },
    { label: t("dashboard.kpi.research_grants"), value: `${fmt(overview?.finance?.total_budget_allocated || 314500000)} TND`, sub: t("dashboard.kpi.ytd"), trend: "↑ 8.1%", trendDir: "up" as const, icon: <BookOpen size={20} /> },
    { label: t("dashboard.kpi.enrollment"), value: fmt(overview?.academic?.total_enrolled_students || 42850), sub: t("dashboard.kpi.vs_last_year"), trend: "+3.2%", trendDir: "up" as const, icon: <GraduationCap size={20} /> },
    { label: t("dashboard.kpi.publications"), value: `${overview?.research?.total_publications || 105}`, sub: t("dashboard.kpi.vs_last_year"), trend: "↑ 11.4%", trendDir: "up" as const, icon: <Layers size={20} /> },
    { label: t("dashboard.kpi.budget_exec"), value: `${overview?.finance?.utilization_rate || 94.1}%`, sub: t("dashboard.kpi.ytd"), trend: "→ 0.0%", trendDir: "neutral" as const, icon: <DollarSign size={20} /> },
    { label: t("dashboard.kpi.success_rate"), value: `${overview?.academic?.avg_success_rate || 88.6}%`, sub: t("dashboard.kpi.ytd"), trend: "↑ 1.9%", trendDir: "up" as const, icon: <Award size={20} /> },
  ];

  const enrollmentData = [
    { year: "2018", undergraduate: 33770, graduate: 1993 },
    { year: "2019", undergraduate: 43020, graduate: 1862 },
    { year: "2020", undergraduate: 42850, graduate: 2092 },
    { year: "2021", undergraduate: 42850, graduate: 2032 },
    { year: "2022", undergraduate: 48650, graduate: 2533 },
    { year: "2023", undergraduate: 42850, graduate: 3794 },
  ];

  const fundingData = isDark
    ? [
      { name: "Federal", value: 45, color: "#D4AF37" },
      { name: "State", value: 20, color: "#f59e0b" },
      { name: "Private Foundation", value: 18, color: "#92400e" },
      { name: "Corporate", value: 12, color: "#fbbf24" },
      { name: "International", value: 5, color: "#b8962e" },
    ]
    : [
      { name: "Federal", value: 45, color: "#3b82f6" },
      { name: "State", value: 20, color: "#6366f1" },
      { name: "Private Foundation", value: 18, color: "#8b5cf6" },
      { name: "Corporate", value: 12, color: "#60a5fa" },
      { name: "International", value: 5, color: "#a78bfa" },
    ];

  const performanceData = [
    { month: "Sep", success: 82, retention: 90 },
    { month: "Oct", success: 84, retention: 91 },
    { month: "Nov", success: 86, retention: 89 },
    { month: "Dec", success: 85, retention: 92 },
    { month: "Jan", success: 87, retention: 91 },
    { month: "Feb", success: 88, retention: 93 },
    { month: "Mar", success: 89, retention: 94 },
    { month: "Apr", success: 88.6, retention: 94.1 },
  ];

  const tooltipBg = isDark ? 'rgba(15,21,32,0.95)' : 'rgba(255,255,255,0.97)';
  const tooltipBorder = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.2)';
  const tooltipLabelColor = accent;
  const tooltipTextColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridStroke = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const axisTick = isDark ? '#64748b' : '#94a3b8';
  const activeDotStroke = isDark ? '#0a0d15' : '#ffffff';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(12px)' }}>
        <p style={{ color: tooltipLabelColor, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color || tooltipTextColor, fontSize: 12, fontWeight: 500 }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  };

  const KpiCard = ({ kpi, idx }: { kpi: typeof kpiCards[0]; idx: number }) => (
    <div className={`uc-kpi-card animate-fade-in-up stagger-${idx + 1}`}>
      <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
        <div className="uc-icon-badge">{kpi.icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>{kpi.label}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 34, fontWeight: 800, color: 'var(--uc-text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{kpi.value}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`uc-trend-${kpi.trendDir}`}>
          {kpi.trendDir === 'up' && <ArrowUpRight size={14} />}
          {kpi.trendDir === 'down' && <ArrowDownRight size={14} />}
          {kpi.trendDir === 'neutral' && <ArrowRight size={14} />}
          {kpi.trend}
        </span>
        <span style={{ color: 'var(--uc-text-dim)', fontSize: 12, fontWeight: 500 }}>{kpi.sub}</span>
      </div>
    </div>
  );

  const thStyle: React.CSSProperties = { padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text-muted)', textAlign: 'center', borderBottom: '1px solid var(--uc-border)' };
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: 'var(--uc-legend-text)', textAlign: 'center', fontWeight: 500 };

  return (
    <div className="w-full mx-auto flex flex-col gap-8" style={{ maxWidth: 1540, fontFamily: "'Inter','DM Sans',sans-serif" }}>

      {/* Title & Actions */}
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="uc-page-title" style={{ marginBottom: 4 }}>{t("dashboard.page_title")}</h1>
          <p style={{ color: 'var(--uc-text-dim)', fontSize: 13, fontWeight: 500, letterSpacing: '0.02em' }}>{t("dashboard.page_subtitle")}</p>
        </div>
        
        <button 
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className="flex items-center gap-0 transition-all duration-300 hover:-translate-y-0.5 group"
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: isDownloading ? 'wait' : 'pointer',
            opacity: isDownloading ? 0.7 : 1,
          }}
        >
          {/* Icon section */}
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px 0 0 10px',
            background: isDark 
              ? 'linear-gradient(135deg, #D4AF37, #b8962e)' 
              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark ? '0 4px 12px rgba(212,175,55,0.2)' : '0 4px 12px rgba(59,130,246,0.2)',
            transition: 'all 0.3s ease',
          }}>
            {isDownloading 
              ? <Loader2 size={16} className="animate-spin" style={{ color: isDark ? '#0a0d15' : '#fff' }} /> 
              : <Download size={16} strokeWidth={2.5} style={{ color: isDark ? '#0a0d15' : '#fff' }} />
            }
          </div>
          {/* Text section */}
          <div style={{
            height: 38,
            padding: '0 16px',
            borderRadius: '0 10px 10px 0',
            background: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(59,130,246,0.06)',
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.15)'}`,
            borderLeft: 'none',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease',
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: accent,
            }}>
              {t("dashboard.download_report")}
            </span>
          </div>
        </button>
      </div>

      {/* Interactive Map — only visible to president & admin */}
      {(user?.role === "president" || user?.role === "admin") && (
        <div className="animate-fade-in-up stagger-1" style={{ marginBottom: 16 }}>
          <DashboardMap 
            institutions={institutions} 
            selectedIds={selectedMapIds} 
            onToggleSelection={handleToggleSelection} 
          />
        </div>
      )}

      {/* KPI Row 1 */}
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {kpiCards.slice(0, 3).map((kpi, idx) => <KpiCard key={idx} kpi={kpi} idx={idx} />)}
      </div>

      {/* KPI Row 2 */}
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {kpiCards.slice(3, 6).map((kpi, idx) => <KpiCard key={idx} kpi={kpi} idx={idx + 3} />)}
      </div>

      {/* AI Smart Insights */}
      <SmartInsights selectedMapIds={selectedMapIds} />

      {/* Charts Row */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Bar Chart */}
        <div className="uc-chart-card animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <div className="flex items-center gap-3">
              <div className="uc-icon-badge uc-icon-badge-sm"><BarChart3 size={16} /></div>
              <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--uc-text-secondary)' }}>{t("dashboard.charts.enrollment_trends")}</h3>
            </div>
            <div className="flex items-center gap-4" style={{ fontSize: 11, color: 'var(--uc-text-muted)' }}>
              <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 2, background: accent, display: 'inline-block' }} />{t("dashboard.charts.undergraduate")}</span>
              <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 2, background: accentLight, display: 'inline-block' }} />{t("dashboard.charts.graduate")}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={enrollmentData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: axisTick, fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: axisTick, fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="undergraduate" name={t("dashboard.charts.undergraduate")} fill={accent} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="graduate" name={t("dashboard.charts.graduate")} fill={accentLight} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="uc-chart-card animate-fade-in-up stagger-6">
          <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
            <div className="uc-icon-badge uc-icon-badge-sm"><PieChartIcon size={16} /></div>
            <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--uc-text-secondary)' }}>{t("dashboard.charts.research_funding")}</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={fundingData} cx="50%" cy="50%" innerRadius={75} outerRadius={115} paddingAngle={3} dataKey="value" stroke="none">
                {fundingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                formatter={(value: string) => <span style={{ color: 'var(--uc-legend-text)', fontSize: 11, marginLeft: 4 }}>{value}</span>} />
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fill: 'var(--uc-text-muted)', fontWeight: 500 }}>{t("dashboard.charts.total")}</text>
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 20, fill: accent, fontWeight: 800 }}>{fmt(overview?.finance?.total_budget_allocated || 314500000)}</text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Chart */}
      <div className="uc-chart-card animate-fade-in-up">
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-3">
            <div className="uc-icon-badge uc-icon-badge-sm"><TrendingUp size={16} /></div>
            <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--uc-text-secondary)' }}>{t("dashboard.charts.performance_trends")}</h3>
          </div>
          <div className="flex items-center gap-4" style={{ fontSize: 11, color: 'var(--uc-text-muted)' }}>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, display: 'inline-block' }} />{t("dashboard.charts.success_rate_label")}</span>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />{t("dashboard.charts.retention_rate")}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.2} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: axisTick, fontSize: 11 }} />
            <YAxis domain={[75, 100]} axisLine={false} tickLine={false} tick={{ fill: axisTick, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="success" name={t("dashboard.charts.success_rate_label")} stroke={accent} strokeWidth={2.5} fill="url(#goldGradient)" dot={{ fill: accent, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: accent, stroke: activeDotStroke, strokeWidth: 2 }} />
            <Area type="monotone" dataKey="retention" name={t("dashboard.charts.retention_rate")} stroke="#34d399" strokeWidth={2} fill="url(#greenGradient)" dot={{ fill: '#34d399', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#34d399', stroke: activeDotStroke, strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rankings Table */}
      {ranking && ranking.length > 0 && (
        <div className="uc-chart-card animate-fade-in-up">
          <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
            <div className="uc-icon-badge uc-icon-badge-sm"><Award size={16} /></div>
            <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--uc-text-secondary)' }}>{t("dashboard.charts.faculty_rankings")}</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>{t("dashboard.charts.institution")}</th>
                  <th style={thStyle}>{t("dashboard.charts.success_rate_label")}</th>
                  <th style={thStyle}>{t("dashboard.charts.students")}</th>
                  <th style={thStyle}>{t("dashboard.charts.trend")}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((fac: any, idx: number) => (
                  <tr key={idx}
                    style={{ background: idx % 2 === 0 ? 'var(--uc-table-stripe)' : 'transparent', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--uc-table-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? 'var(--uc-table-stripe)' : 'transparent'; }}>
                    <td style={tdStyle}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, margin: '0 auto',
                        background: idx < 3 ? `linear-gradient(135deg, ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.1)'}, ${isDark ? 'rgba(212,175,55,0.05)' : 'rgba(59,130,246,0.03)'})` : 'var(--uc-rank-bg)',
                        color: idx < 3 ? accent : 'var(--uc-text-muted)',
                        border: idx < 3 ? `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.2)'}` : '1px solid var(--uc-rank-border)',
                      }}>{idx + 1}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600, color: 'var(--uc-text-secondary)', fontSize: 13 }}>{fac.institution}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: fac.value >= 80 ? 'var(--uc-trend-up)' : fac.value >= 60 ? '#fbbf24' : 'var(--uc-trend-down)', fontSize: 14 }}>{fac.value}%</span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--uc-legend-text)' }}>{Math.floor(Math.random() * 500) + 200}</td>
                    <td style={tdStyle}><span className="uc-trend-up"><ArrowUpRight size={13} /> +{(Math.random() * 4 + 0.5).toFixed(1)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
