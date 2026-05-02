import { useState, useEffect } from "react";
import api from "../api";
import { Building2, Search, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeProvider";

interface Institution { id: string; name: string; institution_type: string; }
interface FacultySelectionModalProps { isOpen: boolean; onClose?: () => void; onSuccess?: () => void; }

export default function FacultySelectionModal({ isOpen, onClose, onSuccess }: FacultySelectionModalProps) {
  const { updateInstitution, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const shouldShow = isOpen && user?.role === "dean";

  useEffect(() => {
    if (shouldShow && institutions.length === 0) {
      setLoading(true);
      api.get("/api/institutions")
        .then(res => setInstitutions(res.data))
        .catch(err => console.error("Failed to load institutions", err))
        .finally(() => setLoading(false));
    }
  }, [shouldShow]);

  const filtered = institutions.filter(inst => inst.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = async (id: string) => {
    setSaving(true);
    try {
      await updateInstitution(id);
      if (onSuccess) onSuccess();
      else navigate("/", { replace: true });
      if (onClose) onClose();
    } catch (err) { console.error("Failed to update institution", err); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {shouldShow && (<>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 overflow-hidden flex flex-col"
          style={{
            maxHeight: '85vh', borderRadius: 20,
            background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--uc-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} style={{ color: accent }} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--uc-text)' }}>{t("faculty_modal.title")}</h2>
                <p style={{ fontSize: 13, color: 'var(--uc-text-muted)', marginTop: 2 }}>{t("faculty_modal.subtitle")}</p>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--uc-text-dim)' }} />
              <input type="text" placeholder={t("faculty_modal.search")}
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                  borderRadius: 12, fontSize: 13, fontWeight: 500,
                  background: 'var(--uc-sidebar-hover-bg)', border: '1px solid var(--uc-border)',
                  color: 'var(--uc-text)', outline: 'none',
                }} />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(inst => {
                  const isSelected = user?.institution_id === inst.id;
                  return (
                    <button key={inst.id} onClick={() => handleSelect(inst.id)} disabled={saving}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                        transition: 'all 0.2s', border: `1px solid ${isSelected ? accent + '30' : 'var(--uc-border)'}`,
                        background: isSelected ? accent + '08' : 'var(--uc-sidebar-hover-bg)',
                        opacity: saving ? 0.5 : 1, width: '100%',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = accent + '40'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--uc-border)'; }}
                    >
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: isSelected ? accent : 'var(--uc-text)' }}>{inst.name}</p>
                        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--uc-text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{inst.institution_type}</p>
                      </div>
                      {isSelected && <CheckCircle2 size={20} style={{ color: accent }} />}
                    </button>
                  );
                })}
                {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--uc-text-muted)', fontSize: 14 }}>{t("faculty_modal.none_found")}</div>}
              </div>
            )}
          </div>

          {/* Footer */}
          {onClose && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--uc-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 500, color: 'var(--uc-text-muted)', cursor: 'pointer', borderRadius: 10, border: 'none', background: 'transparent', transition: 'color 0.2s' }}>
                {t("faculty_modal.close")}
              </button>
            </div>
          )}
        </motion.div>
      </>)}
    </AnimatePresence>
  );
}
