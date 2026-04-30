/**
 * Register.tsx — Public registration page with Secret Code logic.
 */
import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "../ThemeProvider";
import { Globe, Sun, Moon } from "lucide-react";

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : i18n.language === 'en' ? 'ar' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
    institution_id: "",
    secret_code: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const needsSecretCode = formData.role === "admin" || formData.role === "dean";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Direct call to the public-register endpoint
      const payload = {
        ...formData,
        institution_id: formData.institution_id || null,
        secret_code: needsSecretCode ? formData.secret_code : null,
      };
      await axios.post("http://localhost:8000/api/auth/public-register", payload);
      // If success, navigate to login
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text-main relative overflow-hidden transition-colors duration-300">
      {/* Top right toggles */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="p-2.5 rounded-xl bg-card/80 backdrop-blur-md border border-border text-text-muted hover:text-text-main hover:bg-border/50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          title="Change Language"
        >
          <Globe size={18} />
          <span className="text-xs font-bold uppercase">{i18n.language}</span>
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-card/80 backdrop-blur-md border border-border text-text-muted hover:text-text-main hover:bg-border/50 transition-colors cursor-pointer shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Background elements */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-ucar-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6 py-12"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ucar-500/10 border border-ucar-500/20 mb-4 shadow-inner">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ucar<span className="text-ucar-500 dark:text-ucar-400">OS</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-xl font-semibold mb-6">{t('register.title')}</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                {t('register.full_name')}
              </label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text-main focus:outline-none focus:border-ucar-500 focus:ring-1 focus:ring-ucar-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                {t('register.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text-main focus:outline-none focus:border-ucar-500 focus:ring-1 focus:ring-ucar-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                {t('register.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text-main focus:outline-none focus:border-ucar-500 focus:ring-1 focus:ring-ucar-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                {t('register.role')}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text-main focus:outline-none focus:border-ucar-500 focus:ring-1 focus:ring-ucar-500 transition-colors"
              >
                <option value="student">{t('register.roles.student')}</option>
                <option value="researcher">{t('register.roles.researcher')}</option>
                <option value="dean">{t('register.roles.dean')}</option>
                <option value="admin">{t('register.roles.admin')}</option>
              </select>
            </div>

            <AnimatePresence>
              {needsSecretCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-bold text-ucar-500 dark:text-ucar-400 mb-1">
                    {t('register.secret_code')} 🔒
                  </label>
                  <input
                    type="password"
                    name="secret_code"
                    value={formData.secret_code}
                    onChange={handleChange}
                    required={needsSecretCode}
                    placeholder="Ex: HACK_ADMIN_2025"
                    className="w-full px-4 py-3 rounded-xl bg-ucar-50 dark:bg-ucar-900/30 border border-ucar-200 dark:border-ucar-800 text-ucar-900 dark:text-ucar-100 placeholder-ucar-400 focus:outline-none focus:border-ucar-500 focus:ring-1 focus:ring-ucar-500 transition-colors"
                  />
                  <p className="text-xs text-text-muted mt-2">
                    Obligatoire pour les comptes avec des privilèges élevés.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 rounded-xl bg-ucar-500 hover:bg-ucar-600 text-white font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-ucar-500/30 hover:shadow-lg hover:shadow-ucar-500/40 active:scale-[0.98]"
          >
            {loading ? t('register.loading') : t('register.button')}
          </button>
          
          <div className="mt-6 text-center text-sm text-text-muted">
            {t('register.has_account')}{" "}
            <Link to="/login" className="text-ucar-500 dark:text-ucar-400 font-semibold hover:underline">
              {t('register.signin')}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
