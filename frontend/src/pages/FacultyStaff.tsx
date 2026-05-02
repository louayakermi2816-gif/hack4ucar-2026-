import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useTheme } from "../ThemeProvider";
import { Users, UserCheck, Clock, BookOpen, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line,
} from "recharts";

export default function FacultyStaff() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/api/dashboard/overview").then(r => r.data),
  });
  const { data: trends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.get("/api/dashboard/trends").then(r => r.data),
  });

  if (isLoading) return <Loader accent={accent} />;

  const totalStaff = overview?.hr?.total_staff || 0;
  const teachingStaff = overview?.hr?.teaching_staff || 0;
  const adminStaff = totalStaff - teachingStaff;
  const ratio = overview?.hr?.faculty_to_student_ratio || 0;

  const kpis = [
    { label: t("faculty.kpis.total_staff"), value: `${totalStaff}`, icon: <Users size={20} />, trend: "+1.2%", dir: "up" },
    { label: t("faculty.kpis.teaching_staff"), value: `${teachingStaff}`, icon: <UserCheck size={20} />, trend: "+0.8%", dir: "up" },
    { label: t("faculty.kpis.ratio"), value: `${ratio}:1`, icon: <BookOpen size={20} />, trend: "→", dir: "neutral" },
    { label: t("faculty.kpis.training_hours"), value: "12,840", icon: <Clock size={20} />, trend: "+6.5%", dir: "up" },
  ];

  const staffDistribution = [
    { name: t("faculty.labels.teaching") || "Enseignants", value: teachingStaff || 1800, color: isDark ? '#D4AF37' : '#3b82f6' },
    { name: t("faculty.labels.admin") || "Administratifs", value: adminStaff || 950, color: isDark ? '#f0cc6e' : '#60a5fa' },
    { name: t("faculty.labels.technical") || "Technique", value: 380, color: isDark ? '#8B7225' : '#93c5fd' },
  ];

  const staffTrend = (trends?.hr || []).filter((_: any, i: number) => i % 2 === 0).map((d: any) => ({
    year: d.period.replace('Q1-', ''), teaching: d.teaching, admin: d.admin, training: d.training,
  }));

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("faculty.title") || "Corps Enseignant & Personnel"}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("faculty.subtitle") || "Ressources humaines et développement professionnel • 2023-24"}</p>
      </div>

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
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 28 }}>
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("faculty.charts.workforce_evolution") || "Évolution des Effectifs"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={staffTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="teaching" name={t("faculty.labels.teaching") || "Enseignants"} fill={accent} radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="admin" name={t("faculty.labels.admin") || "Administratifs"} fill={isDark ? '#f0cc6e' : '#60a5fa'} radius={[4, 4, 0, 0]} barSize={22} />
              <Line type="monotone" dataKey="training" name={t("faculty.labels.training") || "Heures Formation"} stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} yAxisId={0} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("faculty.charts.distribution") || "Distribution du Personnel"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={staffDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {staffDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Legend wrapperStyle={{ color: 'var(--uc-text-muted)', fontSize: 11 }} />
            </PieChart>
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
        <span style={{ color: 'var(--uc-text-muted)', fontSize: 14, fontWeight: 500 }}>{t("faculty.loading") || "Chargement..."}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
