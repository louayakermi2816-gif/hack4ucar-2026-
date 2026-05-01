/**
 * Register.tsx — Public registration page, UcarOS Design System v2.
 * Dark mode only. Plus Jakarta Sans. Zinc palette.
 */
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "../ThemeProvider";
import { Globe, Sun, Moon, Zap } from "lucide-react";

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "fr" ? "en" : i18n.language === "en" ? "ar" : "fr";
    i18n.changeLanguage(nextLang);
  };

  const [formData, setFormData] = useState({
    full_name: "", email: "", password: "", role: "student", institution_id: "", secret_code: "",
  });

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);

  const needsSecretCode = formData.role === "admin" || formData.role === "dean";
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...formData, institution_id: formData.institution_id || null, secret_code: needsSecretCode ? formData.secret_code : null };
      await axios.post("http://localhost:8000/api/auth/public-register", payload);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check your inputs.");
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-200 text-[14px] font-medium placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/15 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 relative overflow-hidden font-sans">
      {/* Top right toggles */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
        <button onClick={toggleLanguage}
          className="h-9 px-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300 transition-all">
          <Globe size={13} /><span>{i18n.language}</span>
        </button>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300 transition-all">
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Background blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6 py-12">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 8px 32px rgba(245,158,11,0.3)" }}>
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Ucar<span className="text-amber-500">OS</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-8">
          <h2 className="text-[18px] font-bold mb-6 text-zinc-100">{t("register.title")}</h2>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-[13px] font-medium">
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">{t("register.full_name")}</label>
              <input name="full_name" value={formData.full_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">{t("register.email")}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">{t("register.password")}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">{t("register.role")}</label>
              <select name="role" value={formData.role} onChange={handleChange} className={inputClass + " cursor-pointer"}>
                <option value="student">{t("register.roles.student")}</option>
                <option value="researcher">{t("register.roles.researcher")}</option>
                <option value="dean">{t("register.roles.dean")}</option>
                <option value="admin">{t("register.roles.admin")}</option>
              </select>
            </div>

            <AnimatePresence>
              {needsSecretCode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="block text-[12px] font-bold uppercase tracking-widest text-amber-500 mb-2">{t("register.secret_code")} 🔒</label>
                  <input type="password" name="secret_code" value={formData.secret_code} onChange={handleChange} required={needsSecretCode} placeholder="Ex: HACK_ADMIN_2025"
                    className="w-full px-4 py-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-zinc-200 text-[14px] font-medium placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all" />
                  <p className="text-[11px] text-zinc-500 mt-2 font-medium">Obligatoire pour les comptes avec des privilèges élevés.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-[14px] disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all">
            {loading ? t("register.loading") : t("register.button")}
          </button>

          <div className="mt-6 text-center text-[13px] text-zinc-500 font-medium">
            {t("register.has_account")}{" "}
            <Link to="/login" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">{t("register.signin")}</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
