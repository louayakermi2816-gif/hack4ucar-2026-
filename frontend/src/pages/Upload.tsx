import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import api from "../api";
import { useAuth } from "../auth";
import SectionTitle from "../components/ui/SectionTitle";
import { Upload, ShieldX } from "lucide-react";

interface Institution { id: string; name: string; }

export default function UploadPage() {
  const { isRole } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [instId, setInstId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => api.get("/api/institutions").then(r => r.data),
  });

  if (!isRole("admin")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-zinc-900 rounded-2xl border border-red-500/20 p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldX size={24} className="text-red-400" />
          </div>
          <p className="text-zinc-100 font-bold text-[15px]">Accès refusé</p>
          <p className="text-zinc-500 text-[13px] mt-2 font-medium">Seul l'administrateur peut importer des fichiers</p>
        </div>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!file || !instId) return;
    setUploading(true); setError(""); setResult(null);
    const form = new FormData();
    form.append("file", file);
    form.append("institution_id", instId);
    try {
      const res = await api.post("/api/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de l'importation");
    } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <SectionTitle title="Importation de données" subtitle="CSV, Excel ou PDF" accentColor="border-emerald-500" accentBg="bg-emerald-500/10" />

      {/* Institution selector */}
      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Institution</label>
        <select value={instId} onChange={e => setInstId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-200 text-[13px] font-medium focus:outline-none focus:border-amber-500/40 cursor-pointer">
          <option value="">Sélectionner une institution...</option>
          {institutions.map((inst: Institution) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${dragActive ? "border-amber-500/50 bg-amber-500/5" : "border-white/[0.08] hover:border-amber-500/30 hover:bg-white/[0.01]"}`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <Upload size={22} className="text-zinc-400" />
        </div>
        {file ? (
          <><p className="text-zinc-200 font-semibold text-[14px]">{file.name}</p><p className="text-zinc-500 text-[12px] mt-1 font-medium">{(file.size / 1024).toFixed(1)} KB</p></>
        ) : (
          <><p className="text-zinc-300 font-medium text-[14px]">Glissez un fichier ici ou cliquez pour parcourir</p><p className="text-zinc-600 text-[12px] mt-1 font-medium">CSV, XLSX, XLS, PDF</p></>
        )}
      </div>

      {/* Upload button */}
      <button onClick={handleUpload} disabled={!file || !instId || uploading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-lg shadow-amber-500/20">
        {uploading ? "Importation en cours..." : "Importer le fichier"}
      </button>

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <p className="text-emerald-400 font-bold text-[14px] mb-2">✅ Importation réussie</p>
          <p className="text-[13px] text-zinc-400 font-medium">Type détecté : <span className="text-zinc-200 font-semibold">{result.data_type}</span></p>
          <p className="text-[13px] text-zinc-400 font-medium">Lignes importées : <span className="text-zinc-200 font-semibold">{result.rows_inserted}</span></p>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-400 font-medium text-[14px]">{error}</p>
        </div>
      )}
    </div>
  );
}
