import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { DollarSign, TrendingUp, PieChart as PieIcon, Wallet, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, Line,
} from "recharts";

export default function Finance() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/api/dashboard/overview").then(r => r.data),
  });
  const { data: rankBudget } = useQuery({
    queryKey: ["ranking-budget"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=budget_allocated&limit=8").then(r => r.data),
  });
  const { data: rankCost } = useQuery({
    queryKey: ["ranking-cost"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=cost_per_student&limit=8").then(r => r.data),
  });
  const { data: trends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.get("/api/dashboard/trends").then(r => r.data),
  });

  if (isLoading) return <Loader accent={accent} />;

  const totalBudget = overview?.finance?.total_budget_allocated || 0;
  const totalConsumed = overview?.finance?.total_budget_consumed || 0;
  const utilRate = overview?.finance?.utilization_rate || 0;
  const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

  const kpis = [
    { label: t("finance.kpis.total_budget"), value: `${fmt(totalBudget)} TND`, icon: <Wallet size={20} />, trend: "+4.2%", dir: "up" },
    { label: t("finance.kpis.consumed_budget"), value: `${fmt(totalConsumed)} TND`, icon: <DollarSign size={20} />, trend: "+5.1%", dir: "up" },
    { label: t("finance.kpis.execution_rate"), value: `${utilRate}%`, icon: <TrendingUp size={20} />, trend: "→ 0.0%", dir: "neutral" },
    { label: t("finance.kpis.cost_per_student"), value: "2,450 TND", icon: <PieIcon size={20} />, trend: "-1.3%", dir: "down" },
  ];

  const budgetTrend = (trends?.finance || []).filter((_: any, i: number) => i % 2 === 0).map((d: any) => ({
    year: d.period.replace('Q1-', ''), allocated: Math.round(d.allocated / 1e6), consumed: Math.round(d.consumed / 1e6),
  }));

  const expenseBreakdown = [
    { name: t("finance.expenses.salaries"), value: 52, color: isDark ? '#D4AF37' : '#3b82f6' },
    { name: t("finance.expenses.infrastructure"), value: 18, color: isDark ? '#f0cc6e' : '#60a5fa' },
    { name: t("finance.expenses.research"), value: 15, color: isDark ? '#8B7225' : '#93c5fd' },
    { name: t("finance.expenses.equipment"), value: 10, color: isDark ? '#C9A636' : '#2563eb' },
    { name: t("finance.expenses.others"), value: 5, color: isDark ? '#aa8c2a' : '#1d4ed8' },
  ];

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("finance.title")}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("finance.subtitle")}</p>
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
              <span style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginLeft: 4 }}>{t("finance.kpis.yoy")}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("finance.charts.budget_trend")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={budgetTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="allocated" name={t("finance.charts.allocated_legend")} fill={accent} radius={[6, 6, 0, 0]} barSize={28} opacity={0.7} />
              <Line type="monotone" dataKey="consumed" name={t("finance.charts.consumed_legend")} stroke={isDark ? '#f0cc6e' : '#60a5fa'} strokeWidth={2.5} dot={{ r: 4 }} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("finance.charts.expense_breakdown")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {expenseBreakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-2 gap-5">
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("finance.charts.budget_by_inst")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankBudget || []} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 9 }} stroke="var(--uc-border)" width={135} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="value" name={t("finance.charts.budget_tooltip")} fill={accent} radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("finance.charts.cost_per_student")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankCost || []} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 9 }} stroke="var(--uc-border)" width={135} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="value" name={t("finance.charts.cost_tooltip")} fill={isDark ? '#f0cc6e' : '#60a5fa'} radius={[0, 6, 6, 0]} barSize={16} />
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
        <span style={{ color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>{t("finance.loading") || "Chargement..."}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
