import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api";

interface Alert { id: string; institution_id: string; kpi_domain: string; severity: string; message_fr: string; message_ar: string; triggered_at: string; }

const severityStyles: Record<string, string> = {
  HIGH: "bg-red-500/10 text-red-400 border-red-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export default function AlertsPage() {
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterDomain, setFilterDomain] = useState("");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => api.get("/api/alerts").then(r => r.data),
  });

  const filtered = alerts.filter((a: Alert) => {
    return (!filterSeverity || a.severity === filterSeverity) && (!filterDomain || a.kpi_domain === filterDomain);
  });

  const domains = [...new Set(alerts.map((a: Alert) => a.kpi_domain))];

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-ucar-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Alertes</h1>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-card border border-ucar-800 text-white focus:outline-none focus:border-ucar-500">
          <option value="">Toutes les sévérités</option>
          <option value="HIGH">🔴 Haute</option>
          <option value="MEDIUM">🟡 Moyenne</option>
          <option value="LOW">🟢 Basse</option>
        </select>
        <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-card border border-ucar-800 text-white focus:outline-none focus:border-ucar-500">
          <option value="">Tous les domaines</option>
          {domains.map((d: string) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.map((alert: Alert) => (
          <div key={alert.id} className="bg-card rounded-2xl border border-ucar-800 p-5 hover:border-ucar-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${severityStyles[alert.severity] || severityStyles.LOW}`}>
                  {alert.severity}
                </span>
                <span className="px-2.5 py-1 text-xs rounded-full bg-ucar-800 text-ucar-400">
                  {alert.kpi_domain}
                </span>
              </div>
              <span className="text-xs text-ucar-500">
                {alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString("fr-FR") : "—"}
              </span>
            </div>
            {alert.message_fr && <p className="text-sm text-white mb-1">{alert.message_fr}</p>}
            {alert.message_ar && <p className="text-sm text-ucar-400 text-right" dir="rtl">{alert.message_ar}</p>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-ucar-500">Aucune alerte trouvée</div>
        )}
      </div>
    </div>
  );
}
