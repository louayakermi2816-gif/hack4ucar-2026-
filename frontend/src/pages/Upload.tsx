import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import api from "../api";
import { useAuth } from "../auth";

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
        <div className="bg-card rounded-2xl border border-red-500/30 p-8 text-center">
          <p className="text-xl mb-2">🔒</p>
          <p className="text-white font-semibold">Accès refusé</p>
          <p className="text-ucar-400 text-sm mt-1">Seul l'administrateur peut importer des fichiers</p>
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
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-text-main">Importation de données</h1>
      <p className="text-text-muted">Importez des fichiers CSV, Excel ou PDF pour mettre à jour les indicateurs.</p>

      {/* Institution selector */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-2">Institution</label>
        <select value={instId} onChange={e => setInstId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-card border border-border text-text-main focus:outline-none focus:border-ucar-500">
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
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragActive ? "border-ucar-500 bg-ucar-500/10" : "border-border hover:border-ucar-500"}`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.pdf"
          className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
        <p className="text-3xl mb-3">📁</p>
        {file ? (
          <><p className="text-text-main font-medium">{file.name}</p><p className="text-text-muted text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p></>
        ) : (
          <><p className="text-text-main">Glissez un fichier ici ou cliquez pour parcourir</p><p className="text-text-muted text-sm mt-1">CSV, XLSX, XLS, PDF</p>
          </>
        )}
      </div>

      {/* Upload button */}
      <button onClick={handleUpload} disabled={!file || !instId || uploading}
        className="w-full py-3 rounded-xl bg-ucar-600 hover:bg-ucar-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all">
        {uploading ? "Importation en cours..." : "Importer le fichier"}
      </button>

      {/* Result */}
      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
          <p className="text-emerald-500 font-semibold mb-2">✅ Importation réussie</p>
          <p className="text-sm text-text-muted">Type détecté : <span className="text-text-main font-semibold">{result.data_type}</span></p>
          <p className="text-sm text-text-muted">Lignes importées : <span className="text-text-main font-semibold">{result.rows_inserted}</span></p>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
