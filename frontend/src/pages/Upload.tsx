import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import api from "../api";
import { useAuth } from "../auth";
import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import { Upload, ShieldX, FileSpreadsheet, FileText, Check } from "lucide-react";

interface Institution { id: string; name: string; }

export default function UploadPage() {
  const { isRole } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';

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
        <div className="uc-card" style={{ padding: '40px', textAlign: 'center', maxWidth: 360, borderLeft: '3px solid #ef4444' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldX size={24} style={{ color: '#ef4444' }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--uc-text)' }}>{t("upload.access_denied")}</p>
          <p style={{ fontSize: 13, color: 'var(--uc-text-muted)', marginTop: 8 }}>{t("upload.admin_only")}</p>
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
      setError(err.response?.data?.detail || "Upload error");
    } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };

  const fileIcon = file?.name.endsWith('.pdf') ? <FileText size={28} style={{ color: '#ef4444' }} /> : <FileSpreadsheet size={28} style={{ color: '#22c55e' }} />;

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 640 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("upload.title")}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("upload.subtitle")}</p>
      </div>

      {/* Institution selector */}
      <div className="uc-card" style={{ padding: '20px 24px' }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent, marginBottom: 10 }}>{t("upload.institution")}</label>
        <select value={instId} onChange={e => setInstId(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)', color: 'var(--uc-text)',
            outline: 'none', appearance: 'auto',
          }}>
          <option value="" style={{ background: 'var(--uc-bg)', color: 'var(--uc-text)', padding: '8px' }}>{t("upload.select_inst")}</option>
          {institutions.map((inst: Institution) => (
            <option key={inst.id} value={inst.id} style={{ background: 'var(--uc-bg)', color: 'var(--uc-text)', padding: '8px' }}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="uc-card"
        style={{
          padding: '48px 32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
          borderStyle: 'dashed', borderWidth: 2,
          borderColor: dragActive ? accent : 'var(--uc-border)',
          background: dragActive ? (isDark ? 'rgba(212,175,55,0.04)' : 'rgba(59,130,246,0.04)') : 'var(--uc-card-bg)',
        }}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
        {file ? (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--uc-sidebar-hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              {fileIcon}
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--uc-text)' }}>{file.name}</p>
            <p style={{ fontSize: 12, color: 'var(--uc-text-muted)', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--uc-sidebar-hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Upload size={24} style={{ color: 'var(--uc-text-muted)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--uc-text)' }}>{t("upload.drop_text")}</p>
            <p style={{ fontSize: 12, color: 'var(--uc-text-dim)', marginTop: 4 }}>{t("upload.file_types")}</p>
          </div>
        )}
      </div>

      {/* Upload button */}
      <button onClick={handleUpload} disabled={!file || !instId || uploading}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
          cursor: (!file || !instId || uploading) ? 'not-allowed' : 'pointer',
          background: (!file || !instId || uploading) ? 'var(--uc-border)' : `linear-gradient(135deg, ${accent}, ${isDark ? '#8B7225' : '#2563eb'})`,
          color: (!file || !instId || uploading) ? 'var(--uc-text-dim)' : (isDark ? '#0a0d15' : '#fff'),
          border: 'none', transition: 'all 0.2s',
          boxShadow: (!file || !instId || uploading) ? 'none' : `0 6px 24px ${isDark ? 'rgba(212,175,55,0.25)' : 'rgba(59,130,246,0.25)'}`,
        }}>
        {uploading ? t("upload.loading") : t("upload.button")}
      </button>

      {result && (
        <div className="uc-card" style={{ padding: '20px 24px', borderLeft: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Check size={18} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>✅ {t("upload.success")}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--uc-text-muted)' }}>{t("upload.type_detected")}: <span style={{ color: 'var(--uc-text)', fontWeight: 600 }}>{result.data_type}</span></p>
          <p style={{ fontSize: 13, color: 'var(--uc-text-muted)' }}>{t("upload.rows_imported")}: <span style={{ color: 'var(--uc-text)', fontWeight: 600 }}>{result.rows_inserted}</span></p>
        </div>
      )}
      {error && (
        <div className="uc-card" style={{ padding: '20px 24px', borderLeft: '3px solid #ef4444' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{error}</p>
        </div>
      )}
    </div>
  );
}
