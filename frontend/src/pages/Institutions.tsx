/**
 * Institutions.tsx — Institutions list page, UcarOS Design System v2.
 * Uses SectionTitle, zinc palette, rounded-2xl cards.
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import SectionTitle from "../components/ui/SectionTitle";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  location: string;
}

export default function InstitutionsList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => api.get("/api/institutions").then((r) => r.data),
  });

  const filtered = institutions.filter((inst: Institution) => {
    const matchSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.location.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || inst.institution_type === filterType;
    return matchSearch && matchType;
  });

  const types = Array.from<string>(
    new Set(institutions.map((i: Institution) => i.institution_type))
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        title={t("institutions.title") || "Institutions"}
        subtitle={`${institutions.length} ${t("institutions.subtitle_suffix") || "établissements enregistrés"}`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder={t("institutions.search_placeholder") || "Rechercher un établissement..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-200 text-[13px] font-medium placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-200 text-[13px] font-medium focus:outline-none focus:border-amber-500/40 cursor-pointer"
        >
          <option value="">{t("institutions.all_types") || "Tous les types"}</option>
          {types.map((t: string) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                {t("institutions.table.name") || "Nom"}
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                {t("institutions.table.type") || "Type"}
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                {t("institutions.table.location") || "Localisation"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inst: Institution) => (
              <tr
                key={inst.id}
                onClick={() => navigate(`/institutions/${inst.id}`)}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-[13px] text-zinc-200 font-semibold">
                  {inst.name}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1.5 text-[11px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {inst.institution_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-[13px] text-zinc-400 font-medium">
                  {inst.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-500 text-[14px] font-medium">
            {t("institutions.no_results") || "Aucune institution trouvée"}
          </div>
        )}
      </div>

      <p className="text-[12px] font-medium text-zinc-500">
        {filtered.length} {t("institutions.showing_out_of") || "institution(s) sur"} {institutions.length}
      </p>
    </div>
  );
}
