/**
 * Login.tsx — Premium login page for HACK4UCAR.
 * 
 * Features:
 * - Glassmorphism card design (frosted glass effect)
 * - Email + password form
 * - Error handling with visual feedback
 * - Redirects to dashboard on success
 * - Shows role after login
 */
import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { Globe, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  // If already logged in, redirect to dashboard
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : i18n.language === 'en' ? 'ar' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
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

      {/* Background gradient orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-ucar-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="text-center mb-10">
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
          <h2 className="text-xl font-semibold mb-6">{t('login.title')}</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-muted mb-2">
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ucar.tn"
              required
              className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text-main placeholder-text-muted/50 focus:outline-none focus:border-ucar-500 focus:ring-1 focus:ring-ucar-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-muted mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text-main placeholder-text-muted/50 focus:outline-none focus:border-ucar-500 focus:ring-1 focus:ring-ucar-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-ucar-500 hover:bg-ucar-600 text-white font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-ucar-500/30 hover:shadow-lg hover:shadow-ucar-500/40 active:scale-[0.98]"
          >
            {loading ? t('login.loading') : t('login.button')}
          </button>
          
          <div className="mt-6 text-center text-sm text-text-muted">
            {t('login.no_account')}{" "}
            <Link to="/register" className="text-ucar-500 dark:text-ucar-400 font-semibold hover:underline">
              {t('login.signup')}
            </Link>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-border/20 border border-border/50">
            <p className="text-xs text-text-muted font-medium mb-3">{t('login.demo_accounts')}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-muted font-mono">
              <span className="font-semibold">president@ucar.tn</span><span>president123</span>
              <span className="font-semibold">dean@ucar.tn</span><span>dean123</span>
              <span className="font-semibold">admin@ucar.tn</span><span>admin123</span>
              <span className="font-semibold">researcher@ucar.tn</span><span>researcher123</span>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
