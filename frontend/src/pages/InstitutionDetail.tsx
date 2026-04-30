import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api";

const TABS = [
  { key: "academic", label: "Académique", endpoint: "academic" },
  { key: "finance", label: "Finance", endpoint: "finance" },
  { key: "hr", label: "RH", endpoint: "hr" },
  { key: "research", label: "Recherche", endpoint: "research" },
  { key: "employment", label: "Emploi", endpoint: "employment" },
  { key: "esg", label: "ESG", endpoint: "esg" },
  { key: "infrastructure", label: "Infrastructure", endpoint: "infrastructure" },
  { key: "partnership", label: "Partenariats", endpoint: "partnership" },
];

export default function InstitutionDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("academic");

  const { data: inst } = useQuery({
    queryKey: ["institution", id],
    queryFn: () => api.get(`/api/institutions/${id}`).then(r => r.data),
  });

  const tab = TABS.find(t => t.key === activeTab)!;
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["inst-data", id, activeTab],
    queryFn: () => api.get(`/api/institutions/${id}/${tab.endpoint}`).then(r => r.data),
  });

  // Pick numeric columns for the chart
  const numericKeys = records.length > 0
    ? Object.keys(records[0]).filter(k => typeof records[0][k] === "number" && k !== "year")
    : [];

  // Pick the x-axis key (time dimension)
  const xKey = records.length > 0 && records[0].semester ? "semester" : records[0]?.period ? "period" : records[0]?.year ? "year" : "id";

  const CHART_COLORS = ["#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{inst?.name || "Chargement..."}</h1>
        <div className="flex gap-3 mt-2">
          {inst && (
            <>
              <span className="px-3 py-1 text-xs rounded-full bg-ucar-500/10 text-ucar-400 border border-ucar-500/20">{inst.institution_type}</span>
              <span className="px-3 py-1 text-xs rounded-full bg-ucar-700/50 text-ucar-300 border border-ucar-700">📍 {inst.location}</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === t.key ? "bg-ucar-500 text-white" : "bg-card border border-ucar-800 text-ucar-400 hover:text-white hover:border-ucar-600"}`}
          >{t.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-ucar-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : records.length === 0 ? (
        <div className="bg-card rounded-2xl border border-ucar-800 p-12 text-center text-ucar-500">Aucune donnée disponible pour cette catégorie</div>
      ) : (
        <>
          {/* Chart */}
          <div className="bg-card rounded-2xl border border-ucar-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Graphique — {tab.label}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={records}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={xKey} stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1a2236", border: "1px solid #2e3a50", borderRadius: 8, color: "#e2e8f0" }} />
                {numericKeys.slice(0, 4).map((key, i) => (
                  <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="bg-card rounded-2xl border border-ucar-800 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ucar-800">
                  {Object.keys(records[0]).filter(k => k !== "id").map(col => (
                    <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-ucar-400 uppercase tracking-wider">{col.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-ucar-800/50 hover:bg-ucar-900/30">
                    {Object.entries(row).filter(([k]) => k !== "id").map(([k, v]) => (
                      <td key={k} className="px-4 py-3 text-sm text-ucar-300">
                        {typeof v === "number" ? v.toLocaleString() : String(v ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
