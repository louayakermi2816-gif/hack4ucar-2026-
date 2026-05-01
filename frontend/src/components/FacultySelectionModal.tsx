import { useState, useEffect } from "react";
import api from "../api";
import { Building2, Search, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth";
import { useNavigate } from "react-router-dom";

interface Institution { id: string; name: string; institution_type: string; }
interface FacultySelectionModalProps { isOpen: boolean; onClose?: () => void; onSuccess?: () => void; }

export default function FacultySelectionModal({ isOpen, onClose, onSuccess }: FacultySelectionModalProps) {
  const { updateInstitution, user } = useAuth();
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const shouldShow = isOpen && user?.role === "dean";

  useEffect(() => {
    if (shouldShow && institutions.length === 0) {
      setLoading(true);
      api.get("/api/institutions").then(res => setInstitutions(res.data)).catch(err => console.error("Failed to load institutions", err)).finally(() => setLoading(false));
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
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-900 border border-white/[0.08] shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
          style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] bg-zinc-900">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-zinc-100">Sélectionnez votre établissement</h2>
                <p className="text-[13px] text-zinc-500 font-medium mt-0.5">Choisissez l'établissement que vous souhaitez gérer pour cette session.</p>
              </div>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Rechercher une faculté ou un institut..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-800/50 border border-white/[0.06] rounded-xl text-[13px] font-medium text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all" />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-950/50">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="grid gap-2">
                {filtered.map(inst => {
                  const isSelected = user?.institution_id === inst.id;
                  return (
                    <button key={inst.id} onClick={() => handleSelect(inst.id)} disabled={saving}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-zinc-900 border-white/[0.04] hover:border-white/[0.1] hover:bg-zinc-800/50 text-zinc-200"
                      } disabled:opacity-50`}>
                      <div>
                        <p className="font-semibold text-[14px]">{inst.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-medium">{inst.institution_type}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="text-amber-500" size={20} />}
                    </button>
                  );
                })}
                {filtered.length === 0 && <div className="text-center py-10 text-zinc-500 text-[14px] font-medium">Aucun établissement trouvé.</div>}
              </div>
            )}
          </div>

          {/* Footer */}
          {onClose && (
            <div className="p-4 border-t border-white/[0.06] bg-zinc-900 flex justify-end">
              <button onClick={onClose} className="px-5 py-2.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer rounded-xl hover:bg-white/[0.04]">
                Fermer
              </button>
            </div>
          )}
        </motion.div>
      </>)}
    </AnimatePresence>
  );
}
