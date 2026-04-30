import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";

interface Institution { id: string; name: string; institution_type: string; location: string; }

export default function InstitutionsList() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => api.get("/api/institutions").then(r => r.data),
  });

  const filtered = institutions.filter((inst: Institution) => {
    const matchSearch = inst.name.toLowerCase().includes(search.toLowerCase()) || inst.location.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || inst.institution_type === filterType;
    return matchSearch && matchType;
  });

  const types = [...new Set(institutions.map((i: Institution) => i.institution_type))];

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-ucar-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Institutions</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-ucar-800 text-white placeholder-ucar-500 focus:outline-none focus:border-ucar-500"
        />
        <select
          value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-card border border-ucar-800 text-white focus:outline-none focus:border-ucar-500"
        >
          <option value="">Tous les types</option>
          {types.map((t: string) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-ucar-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ucar-800">
              <th className="text-left px-6 py-4 text-sm font-semibold text-ucar-400">Nom</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ucar-400">Type</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ucar-400">Localisation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inst: Institution) => (
              <tr
                key={inst.id}
                onClick={() => navigate(`/institutions/${inst.id}`)}
                className="border-b border-ucar-800/50 hover:bg-ucar-900/50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-sm text-white font-medium">{inst.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs rounded-full bg-ucar-500/10 text-ucar-400 border border-ucar-500/20">
                    {inst.institution_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-ucar-400">{inst.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-ucar-500">Aucune institution trouvée</div>
        )}
      </div>
      <p className="text-sm text-ucar-500">{filtered.length} institution(s) sur {institutions.length}</p>
    </div>
  );
}
