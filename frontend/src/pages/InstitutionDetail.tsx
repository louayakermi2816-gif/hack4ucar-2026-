import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api";
import SectionTitle from "../components/ui/SectionTitle";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("academic");
  const { data: inst } = useQuery({ queryKey: ["institution", id], queryFn: () => api.get(`/api/institutions/${id}`).then(r => r.data) });
  const tab = TABS.find(t => t.key === activeTab)!;
  const { data: records = [], isLoading } = useQuery({ queryKey: ["inst-data", id, activeTab], queryFn: () => api.get(`/api/institutions/${id}/${tab.endpoint}`).then(r => r.data) });
  const numericKeys = records.length > 0 ? Object.keys(records[0]).filter(k => typeof records[0][k] === "number" && k !== "year") : [];
  const xKey = records.length > 0 && records[0].semester ? "semester" : records[0]?.period ? "period" : records[0]?.year ? "year" : "id";
  const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle title={inst?.name || (t("institution_detail.loading") || "Chargement...")} />
        <div className="flex gap-3 mt-4">
          {inst && (<>
            <span className="px-3 py-1.5 text-[11px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{inst.institution_type}</span>
            <span className="px-3 py-1.5 text-[11px] font-medium rounded-full bg-zinc-800 text-zinc-400 border border-white/[0.06]">📍 {inst.location}</span>
          </>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${activeTab === t.key ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-900 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.1]"}`}
          >{t("institution_detail.tabs." + t.key) || t.label}</button>
        ))}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : records.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] p-16 text-center text-zinc-500 text-[14px] font-medium">{t("institution_detail.no_data") || "Aucune donnée disponible"}</div>
      ) : (<>
        <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] p-6">
          <SectionTitle title={`${t("institution_detail.chart") || "Graphique"} — ${t("institution_detail.tabs." + tab.key) || tab.label}`} />
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={records}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey={xKey} stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fafafa", fontSize: "12px" }} />
                {numericKeys.slice(0, 4).map((key, i) => (
                  <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.06]">
              {Object.keys(records[0]).filter(k => k !== "id").map(col => (
                <th key={col} className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">{col.replace(/_/g, " ")}</th>
              ))}
            </tr></thead>
            <tbody>
              {records.map((row: any, i: number) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  {Object.entries(row).filter(([k]) => k !== "id").map(([k, v]) => (
                    <td key={k} className="px-5 py-3.5 text-[13px] text-zinc-300 font-medium">{typeof v === "number" ? v.toLocaleString() : String(v ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
    </div>
  );
}
