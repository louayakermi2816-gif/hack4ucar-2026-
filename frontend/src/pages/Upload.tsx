import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import api from "../api";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import SectionTitle from "../components/ui/SectionTitle";
import { Upload, ShieldX, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

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
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isRTL = i18n.language === "ar";

  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => api.get("/api/institutions").then(r => r.data),
  });

  const accent = isDark ? '#D4AF37' : '#3b82f6';

  if (!isRole("admin")) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 text-center max-w-sm"
          style={{ background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <ShieldX size={28} className="text-red-500" />
          </div>
          <p style={{ color: 'var(--uc-text)', fontSize: 16, fontWeight: 700 }}>{t("upload.access_denied")}</p>
          <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>{t("upload.admin_only")}</p>
        </motion.div>
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
      setError(err.response?.data?.detail || "Error during upload");
    } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SectionTitle title={t("upload.title")} subtitle={t("upload.subtitle")} accentColor="border-emerald-500" accentBg="bg-emerald-500/10" />

      <div style={{ background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)', borderRadius: 20, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
        <div className="flex flex-col gap-6">
          {/* Institution selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--uc-text-muted)', marginBottom: 8 }}>{t("upload.institution")}</label>
            <div className="relative">
              <select value={instId} onChange={e => setInstId(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12, background: 'var(--uc-sidebar-hover-bg)',
                  border: '1px solid var(--uc-border)', color: 'var(--uc-text)', fontSize: 13, fontWeight: 500,
                  appearance: 'none', cursor: 'pointer', outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e => e.target.style.borderColor = 'var(--uc-border)'}>
                <option value="">{t("upload.select_institution")}</option>
                {institutions.map((inst: Institution) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
              </select>
              <div style={{ position: 'absolute', right: isRTL ? 'auto' : 16, left: isRTL ? 16 : 'auto', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--uc-text-dim)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? accent : 'var(--uc-border)'}`,
              borderRadius: 16, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
              background: dragActive ? (isDark ? 'rgba(212,175,55,0.05)' : 'rgba(59,130,246,0.05)') : 'transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!dragActive) { e.currentTarget.style.borderColor = isDark ? 'rgba(212,175,55,0.4)' : 'rgba(59,130,246,0.4)'; e.currentTarget.style.background = 'var(--uc-sidebar-hover-bg)'; } }}
            onMouseLeave={e => { if (!dragActive) { e.currentTarget.style.borderColor = 'var(--uc-border)'; e.currentTarget.style.background = 'transparent'; } }}
          >
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
            <motion.div animate={{ scale: dragActive ? 1.1 : 1 }} transition={{ duration: 0.2 }}
              style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--uc-sidebar-hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {file ? <FileText size={28} style={{ color: accent }} /> : <Upload size={28} style={{ color: 'var(--uc-text-dim)' }} />}
            </motion.div>
            {file ? (
              <>
                <p style={{ color: 'var(--uc-text)', fontWeight: 600, fontSize: 15 }}>{file.name}</p>
                <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4, fontWeight: 500 }}>{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--uc-text-secondary)', fontWeight: 600, fontSize: 15 }}>{t("upload.drop_zone")}</p>
                <p style={{ color: 'var(--uc-text-muted)', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{t("upload.file_types")}</p>
              </>
            )}
          </div>

          {/* Upload button */}
          <button onClick={handleUpload} disabled={!file || !instId || uploading}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: (!file || !instId || uploading) ? 'not-allowed' : 'pointer',
              background: isDark ? 'linear-gradient(135deg, #D4AF37, #b8962e)' : '#3b82f6',
              color: isDark ? '#0a0d15' : '#fff', border: 'none',
              opacity: (!file || !instId || uploading) ? 0.5 : 1,
              boxShadow: (!file || !instId || uploading) ? 'none' : (isDark ? '0 8px 24px rgba(212,175,55,0.2)' : '0 8px 24px rgba(59,130,246,0.2)'),
              transition: 'all 0.2s',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
            }}>
            {uploading ? (
              <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><span>{t("upload.loading")}</span></>
            ) : (
              <span>{t("upload.button")}</span>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence mode="popLayout">
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : '#a7f3d0'}`, borderRadius: 16, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(16,185,129,0.2)' : '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
            <div>
              <p style={{ color: '#10b981', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{t("upload.success")}</p>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--uc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("upload.type_detected")}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--uc-text)', marginTop: 2 }}>{result.data_type}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--uc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("upload.rows_imported")}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--uc-text)', marginTop: 2 }}>{result.rows_inserted}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#fecaca'}`, borderRadius: 16, padding: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <AlertCircle size={20} color="#ef4444" />
            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 14 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
