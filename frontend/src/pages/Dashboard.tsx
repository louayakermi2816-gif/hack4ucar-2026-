import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../api";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const PIE_COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444"];

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: overview, isLoading } = useQuery({ queryKey: ["overview"], queryFn: () => api.get("/api/dashboard/overview").then(r => r.data) });
  const { data: ranking } = useQuery({ queryKey: ["ranking"], queryFn: () => api.get("/api/dashboard/ranking?metric=success_rate&limit=10").then(r => r.data) });
  const { data: byType } = useQuery({ queryKey: ["by-type"], queryFn: () => api.get("/api/dashboard/by-type").then(r => r.data) });
  const { data: alertsSummary } = useQuery({ queryKey: ["alerts-summary"], queryFn: () => api.get("/api/dashboard/alerts-summary").then(r => r.data) });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-ucar-400 border-t-transparent rounded-full animate-spin" /></div>;

  const totalAlerts = alertsSummary ? Object.values(alertsSummary as Record<string, number>).reduce((a: number, b: number) => a + b, 0) : 0;
  const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : `${n}`;

  const cards = [
    { label: t('dashboard.cards.institutions'), value: overview?.total_institutions, icon: "🏛️", border: "border-ucar-500/30", bg: "bg-ucar-500/10" },
    { label: t('dashboard.cards.success_rate'), value: `${overview?.academic?.avg_success_rate || 0}%`, icon: "📊", border: "border-emerald-500/30", bg: "bg-emerald-500/10", sub: `Drop: ${overview?.academic?.avg_dropout_rate}%` },
    { label: t('dashboard.cards.budget'), value: fmt(overview?.finance?.total_budget_allocated || 0), icon: "💰", border: "border-amber-500/30", bg: "bg-amber-500/10", sub: `Util: ${overview?.finance?.utilization_rate}%` },
    { label: t('dashboard.cards.alerts'), value: totalAlerts, icon: "🔔", border: "border-red-500/30", bg: "bg-red-500/10", sub: alertsSummary?.HIGH ? `${alertsSummary.HIGH} HIGH` : "" },
  ];

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text-main">
          Bienvenue, <span className="text-ucar-500 dark:text-ucar-400">{user?.full_name}</span> 👋
        </h1>
        <p className="text-text-muted mt-1">{t('dashboard.title')} - {t('dashboard.subtitle')}</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={itemVariants}>
        {cards.map((c, i) => (
          <div key={i} className={`bg-card rounded-2xl border ${c.border} p-5 hover:shadow-lg transition-all hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted font-semibold">{c.label}</span>
              <span className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-lg`}>{c.icon}</span>
            </div>
            <p className="text-2xl font-bold text-text-main">{c.value}</p>
            {c.sub && <p className="text-xs text-text-muted mt-1">{c.sub}</p>}
          </div>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-main mb-4">{t('dashboard.charts.success_ranking')}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ranking || []} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
              <YAxis type="category" dataKey="institution" width={180} stroke="var(--text-muted)" fontSize={11} tickFormatter={(v: string) => v.length > 25 ? v.slice(0, 25) + "…" : v} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-main)" }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-main mb-4">{t('dashboard.charts.type_distribution')}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={byType || []} dataKey="count" nameKey="type" cx="50%" cy="45%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                {(byType || []).map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-main)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={itemVariants}>
        {[
          { label: "Personnel total", value: overview?.hr?.total_staff || 0, icon: "👥" },
          { label: "Publications", value: overview?.research?.total_publications || 0, icon: "📚" },
          { label: "Brevets", value: overview?.research?.total_patents || 0, icon: "🏆" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <span className="text-2xl">{s.icon}</span>
            <div><p className="text-xl font-bold text-text-main">{s.value.toLocaleString()}</p><p className="text-sm text-text-muted">{s.label}</p></div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
