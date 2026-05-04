/**
 * Register.tsx — Public registration page, UcarOS Design System v2.
 * Dual-theme support matching Login page aesthetic.
 */
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "../ThemeProvider";
import { Globe, Sun, Moon, Zap, User, Mail, Lock, ChevronDown, Shield } from "lucide-react";

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Theme-aware palette
  const bg = isDark ? '#0a0d15' : '#f1f5f9';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const cardBorder = isDark ? 'rgba(212,175,55,0.12)' : '#e2e8f0';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const inputFocus = isDark ? 'rgba(212,175,55,0.4)' : 'rgba(59,130,246,0.4)';
  const inputText = isDark ? '#e2e8f0' : '#0f172a';
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  const mutedText = isDark ? '#64748b' : '#94a3b8';
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentGlow = isDark ? 'rgba(212,175,55,0.25)' : 'rgba(59,130,246,0.25)';

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
      const payload = { ...formData, institution_id: formData.institution_id || undefined, secret_code: needsSecretCode ? formData.secret_code : undefined };
      await axios.post("http://localhost:8000/api/auth/public-register", payload);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check your inputs.");
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12,
    background: inputBg, border: `1px solid ${inputBorder}`, color: inputText,
    fontSize: 14, fontWeight: 500, outline: 'none', transition: 'all 0.2s',
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle, paddingLeft: 44, cursor: 'pointer', appearance: 'none' as any,
    backgroundColor: isDark ? '#111827' : '#f8fafc',
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: bg, fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      {/* Top right toggles */}
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 20, display: 'flex', gap: 8 }}>
        <button onClick={toggleLanguage}
          style={{ height: 36, padding: '0 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.04)' : '#e2e8f0', color: labelColor, border: `1px solid ${cardBorder}`, transition: 'all 0.2s' }}>
          <Globe size={13} /><span>{i18n.language}</span>
        </button>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ height: 36, width: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.04)' : '#e2e8f0', color: labelColor, border: `1px solid ${cardBorder}`, transition: 'all 0.2s' }}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Background blobs */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', background: isDark ? 'rgba(212,175,55,0.06)' : 'rgba(59,130,246,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -200, right: -200, width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', background: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(212,175,55,0.06)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, padding: '48px 24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: isDark ? 'linear-gradient(135deg, #D4AF37, #8B7225)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: `0 8px 32px ${accentGlow}` }}>
            <Zap size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#fafafa' : '#0f172a' }}>
            Ucar<span style={{ color: accent }}>OS</span>
          </h1>
          <p style={{ fontSize: 12, color: mutedText, marginTop: 4, fontWeight: 500 }}>Systeme de Pilotage Universitaire</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '32px 28px', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.4)' : '0 8px 40px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24, color: isDark ? '#f1f5f9' : '#0f172a' }}>{t("register.title")}</h2>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 13, fontWeight: 500 }}>
              {error}
            </motion.div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, marginBottom: 8 }}>{t("register.full_name")}</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedText }} />
                <input name="full_name" value={formData.full_name} onChange={handleChange} required
                  placeholder="Louay Akermi"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = inputFocus}
                  onBlur={e => e.target.style.borderColor = inputBorder} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, marginBottom: 8 }}>{t("register.email")}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedText }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="louay@ucar.tn"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = inputFocus}
                  onBlur={e => e.target.style.borderColor = inputBorder} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, marginBottom: 8 }}>{t("register.password")}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedText }} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = inputFocus}
                  onBlur={e => e.target.style.borderColor = inputBorder} />
              </div>
            </div>

            {/* Role */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, marginBottom: 8 }}>{t("register.role")}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: mutedText, pointerEvents: 'none' }} />
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedText }} />
                <select name="role" value={formData.role} onChange={handleChange} style={selectStyle}>
                  <option value="student" style={{ background: isDark ? '#111827' : '#ffffff', color: isDark ? '#e2e8f0' : '#0f172a' }}>{t("register.roles.student")}</option>
                  <option value="researcher" style={{ background: isDark ? '#111827' : '#ffffff', color: isDark ? '#e2e8f0' : '#0f172a' }}>{t("register.roles.researcher")}</option>
                  <option value="dean" style={{ background: isDark ? '#111827' : '#ffffff', color: isDark ? '#e2e8f0' : '#0f172a' }}>{t("register.roles.dean")}</option>
                  <option value="admin" style={{ background: isDark ? '#111827' : '#ffffff', color: isDark ? '#e2e8f0' : '#0f172a' }}>{t("register.roles.admin")}</option>
                </select>
              </div>
            </div>

            {/* Secret Code */}
            <AnimatePresence>
              {needsSecretCode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: 8 }}>{t("register.secret_code")}</label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: accent }} />
                    <input type="password" name="secret_code" value={formData.secret_code} onChange={handleChange} required={needsSecretCode}
                      placeholder="Ex: HACK_ADMIN_2026"
                      style={{ ...inputStyle, background: isDark ? 'rgba(212,175,55,0.04)' : 'rgba(59,130,246,0.04)', borderColor: isDark ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.2)' }}
                      onFocus={e => e.target.style.borderColor = accent}
                      onBlur={e => e.target.style.borderColor = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.2)'} />
                  </div>
                  <p style={{ fontSize: 11, color: mutedText, marginTop: 6, fontWeight: 500 }}>Obligatoire pour les comptes avec des privileges eleves.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px 0', marginTop: 24, borderRadius: 12, border: 'none',
              background: isDark ? 'linear-gradient(135deg, #D4AF37, #a38829)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: isDark ? '#0a0d15' : '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: `0 4px 24px ${accentGlow}`, transition: 'all 0.3s', opacity: loading ? 0.5 : 1,
            }}>
            {loading ? t("register.loading") : t("register.button")}
          </button>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: mutedText, fontWeight: 500 }}>
            {t("register.has_account")}{" "}
            <Link to="/login" style={{ color: accent, fontWeight: 700, textDecoration: 'none' }}>{t("register.signin")}</Link>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: mutedText, marginTop: 20, fontWeight: 500 }}>
          Universite de Carthage &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
