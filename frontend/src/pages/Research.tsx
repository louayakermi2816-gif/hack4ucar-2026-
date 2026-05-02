import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { Microscope, BookOpen, Lightbulb, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

export default function Research() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/api/dashboard/overview").then(r => r.data),
  });
  const { data: rankPub } = useQuery({
    queryKey: ["ranking-publications"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=publications&limit=8").then(r => r.data),
  });
  const { data: rankPatent } = useQuery({
    queryKey: ["ranking-patents"],
    queryFn: () => api.get("/api/dashboard/ranking?metric=patents&limit=8").then(r => r.data),
  });
  const { data: trends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.get("/api/dashboard/trends").then(r => r.data),
  });

  if (isLoading) return <Loader accent={accent} />;

  const totalPub = overview?.research?.total_publications || 0;
  const totalPatents = overview?.research?.total_patents || 0;
  const fundingSecured = overview?.research?.funding_secured || 0;
  const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

  const kpis = [
    { label: t("research.kpis.publications"), value: `${totalPub}`, icon: <BookOpen size={20} />, trend: "+11.4%", up: true },
    { label: t("research.kpis.patents"), value: `${totalPatents}`, icon: <Lightbulb size={20} />, trend: "+5.2%", up: true },
    { label: t("research.kpis.funding"), value: `${fmt(fundingSecured)} TND`, icon: <FileText size={20} />, trend: "+8.1%", up: true },
    { label: t("research.kpis.active_projects"), value: "142", icon: <Microscope size={20} />, trend: "+3.6%", up: true },
  ];

  const fundingBySource = [
    { name: t("research.funding.national") || "Ministère", value: 40, color: isDark ? '#D4AF37' : '#3b82f6' },
    { name: t("research.funding.international") || "International", value: 28, color: isDark ? '#f0cc6e' : '#60a5fa' },
    { name: t("research.funding.private") || "Privé", value: 18, color: isDark ? '#8B7225' : '#93c5fd' },
    { name: t("research.funding.eu") || "UE Horizon", value: 14, color: isDark ? '#C9A636' : '#2563eb' },
  ];

  const yearlyTrend = (trends?.research || []).map((d: any) => ({
    year: String(d.year), publications: d.publications, patents: d.patents, funding: d.funding / 1e6,
  }));

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("research.title") || "Recherche & Subventions"}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("research.subtitle") || "Production scientifique et financement • 2023-24"}</p>
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
              {k.up ? <ArrowUpRight size={14} color="#22c55e" /> : <ArrowDownRight size={14} color="#ef4444" />}
              <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>{k.trend}</span>
              <span style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginLeft: 4 }}>{t("research.labels.vs_prev_year") || "vs N-1"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("research.charts.scientific_production") || "Évolution de la Production Scientifique"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={yearlyTrend}>
              <defs>
                <linearGradient id="gradPub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Area type="monotone" dataKey="publications" name={t("research.labels.publications") || "Publications"} stroke={accent} fill="url(#gradPub)" strokeWidth={2.5} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("research.charts.funding_sources") || "Sources de Financement"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={fundingBySource} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {fundingBySource.map((d, i) => <Cell key={i} fill={d.color} />)}
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
            {t("research.charts.pubs_by_inst") || "Publications par Établissement"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankPub || []} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 9 }} stroke="var(--uc-border)" width={135} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="value" name={t("research.labels.publications") || "Publications"} fill={accent} radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("research.charts.patents_by_inst") || "Brevets par Établissement"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankPatent || []} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis type="number" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis type="category" dataKey="institution" tick={{ fill: 'var(--uc-text-muted)', fontSize: 9 }} stroke="var(--uc-border)" width={135} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="value" name={t("research.labels.patents") || "Brevets"} fill={isDark ? '#f0cc6e' : '#60a5fa'} radius={[0, 6, 6, 0]} barSize={16} />
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
        <span style={{ color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>{t("research.loading") || "Chargement..."}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
