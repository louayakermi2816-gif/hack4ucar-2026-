import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import { Building2, Wrench, MonitorSmartphone, Zap, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

export default function Facilities() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  const kpis = [
    { label: t("facilities.kpis.occupancy"), value: "78.5%", icon: <Building2 size={20} />, trend: "+2.1%", dir: "up" },
    { label: t("facilities.kpis.works"), value: "14", icon: <Wrench size={20} />, trend: "+3", dir: "up" },
    { label: t("facilities.kpis.connected"), value: "4,280", icon: <MonitorSmartphone size={20} />, trend: "+8.4%", dir: "up" },
    { label: t("facilities.kpis.energy"), value: "2.4 GWh", icon: <Zap size={20} />, trend: "-3.2%", dir: "down" },
  ];

  const occupancyByType = [
    { type: t("facilities.types.amphi"), rate: 85 },
    { type: t("facilities.types.td"), rate: 72 },
    { type: t("facilities.types.lab"), rate: 68 },
    { type: t("facilities.types.lib"), rate: 91 },
    { type: t("facilities.types.info"), rate: 82 },
  ];

  const equipmentStatus = [
    { name: t("facilities.status.operational"), value: 72, color: "#22c55e" },
    { name: t("facilities.status.maintenance"), value: 18, color: isDark ? '#D4AF37' : '#3b82f6' },
    { name: t("facilities.status.out"), value: 10, color: "#ef4444" },
  ];

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("facilities.title")}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("facilities.subtitle")}</p>
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

      <div className="grid grid-cols-3 gap-5">
        <div className="uc-card col-span-2" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("facilities.charts.occupancy")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={occupancyByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--uc-border)" />
              <XAxis dataKey="type" tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" />
              <YAxis tick={{ fill: 'var(--uc-text-muted)', fontSize: 11 }} stroke="var(--uc-border)" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'var(--uc-bg-card)', border: '1px solid var(--uc-border)', borderRadius: 10, color: 'var(--uc-text)' }} />
              <Bar dataKey="rate" name="Occupation (%)" fill={accent} radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="uc-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-text)', marginBottom: 20 }}>
            {t("facilities.charts.status")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={equipmentStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {equipmentStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
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
