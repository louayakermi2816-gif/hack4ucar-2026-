import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeProvider";
import { Globe, Eye, EyeOff, Zap, User, ChevronDown, Sun, Moon } from "lucide-react";
import FacultySelectionModal from "../components/FacultySelectionModal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeanModal, setShowDeanModal] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (user && !showDeanModal && !loading) navigate("/", { replace: true });
  }, [user, showDeanModal, loading, navigate]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === "fr" ? "en" : i18n.language === "en" ? "ar" : "fr";
    i18n.changeLanguage(nextLang);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.role === "dean") setShowDeanModal(true);
      else navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Échec de connexion. Vérifiez vos identifiants.");
    } finally { setLoading(false); }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.role === "dean") setShowDeanModal(true);
      else navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Échec de connexion. Vérifiez vos identifiants.");
    } finally { setLoading(false); }
  };

  // Theme-aware colors
  const bg = isDark ? '#0a0d15' : '#f1f5f9';
  const panelBg = isDark ? '#111827' : '#ffffff';
  const cardBg = isDark ? '#0f1520' : '#ffffff';
  const cardBorder = isDark ? 'rgba(212,175,55,0.1)' : '#e2e8f0';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const inputText = isDark ? '#e2e8f0' : '#0f172a';
  const inputPlaceholder = isDark ? '#475569' : '#94a3b8';
  const labelColor = isDark ? '#94a3b8' : '#475569';
  const titleColor = isDark ? '#f1f5f9' : '#0f172a';
  const subtitleColor = isDark ? '#64748b' : '#64748b';
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentHover = isDark ? '#f0cc6e' : '#2563eb';
  const btnBg = isDark ? 'linear-gradient(135deg, #D4AF37, #b8962e)' : '#3b82f6';
  const btnHoverBg = isDark ? 'linear-gradient(135deg, #f0cc6e, #D4AF37)' : '#2563eb';
  const btnText = isDark ? '#0a0d15' : '#ffffff';
  const btnShadow = isDark ? '0 8px 24px rgba(212,175,55,0.2)' : '0 8px 24px rgba(59,130,246,0.2)';
  const heroTextColor = isDark ? '#e2e8f0' : '#1e293b';
  const heroSubColor = isDark ? '#64748b' : '#64748b';
  const heroBlobA = isDark ? 'rgba(212,175,55,0.06)' : 'rgba(59,130,246,0.08)';
  const heroBlobB = isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.06)';
  const heroBarColors = isDark ? ['#D4AF37', '#f0cc6e', '#b8962e', '#92400e'] : ['#3b82f6', '#60a5fa', '#93c5fd', '#a78bfa'];
  const heroBgPanel = isDark ? '#0c1018' : '#ffffff';
  const heroIllustrationBg = isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc';
  const demoBtnBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const demoBtnBorder = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9';
  const demoBtnHoverBorder = isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1';
  const demoRoleColor = isDark ? '#e2e8f0' : '#1e293b';
  const demoEmailColor = isDark ? '#64748b' : '#94a3b8';
  const errorBg = isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2';
  const errorBorder = isDark ? 'rgba(239,68,68,0.15)' : '#fecaca';
  const errorText = isDark ? '#f87171' : '#dc2626';
  const linkColor = accent;
  const separatorColor = isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0';
  const demoLabelColor = isDark ? '#64748b' : '#94a3b8';
  const helpTextColor = isDark ? '#94a3b8' : '#475569';
  const helpHoverColor = isDark ? '#f0cc6e' : '#2563eb';
  const topBtnBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const topBtnBorder = isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0';
  const topBtnText = isDark ? '#94a3b8' : '#64748b';

  const demoColors = isDark
    ? [
      { bg: 'rgba(168,85,247,0.08)', text: '#a78bfa', hoverBg: 'rgba(168,85,247,0.15)' },
      { bg: 'rgba(59,130,246,0.08)', text: '#60a5fa', hoverBg: 'rgba(59,130,246,0.15)' },
      { bg: 'rgba(52,211,153,0.08)', text: '#34d399', hoverBg: 'rgba(52,211,153,0.15)' },
      { bg: 'rgba(251,146,60,0.08)', text: '#fb923c', hoverBg: 'rgba(251,146,60,0.15)' },
    ]
    : [
      { bg: '#faf5ff', text: '#7c3aed', hoverBg: '#f3e8ff' },
      { bg: '#eff6ff', text: '#3b82f6', hoverBg: '#dbeafe' },
      { bg: '#ecfdf5', text: '#059669', hoverBg: '#d1fae5' },
      { bg: '#fff7ed', text: '#ea580c', hoverBg: '#ffedd5' },
    ];

  const focusRing = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.2)';
  const focusBorder = accent;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: bg, color: titleColor, transition: 'background 0.3s, color 0.3s' }}>
      {/* Top-right controls */}
      <div className="absolute top-6 right-8 z-50 flex items-center gap-2">
        <button onClick={toggleLanguage}
          style={{ height: 40, padding: '0 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: topBtnBg, color: topBtnText, border: `1px solid ${topBtnBorder}`, transition: 'all 0.2s' }}>
          <Globe size={16} />{i18n.language}
        </button>
        <button onClick={() => setTheme(isDark ? 'light' : 'dark')}
          style={{ height: 40, width: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: topBtnBg, color: topBtnText, border: `1px solid ${topBtnBorder}`, transition: 'all 0.2s' }}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* LEFT — Hero */}
      <div className="hidden lg:flex lg:w-[50%] flex-col justify-center items-center text-center px-12 xl:px-24" style={{ borderRight: `1px solid ${separatorColor}`, background: heroBgPanel, transition: 'background 0.3s' }}>
        <div className="mb-8 flex flex-col items-center gap-4">
          <div style={{ width: 80, height: 80, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: btnShadow, background: btnBg, color: btnText }}>
            <Zap size={40} />
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.02em', color: accent, marginTop: 8 }}>UcarOS</h1>
        </div>
        <h2 style={{ fontSize: 40, lineHeight: 1.2, fontWeight: 800, color: heroTextColor, letterSpacing: '-0.02em', marginBottom: 24, maxWidth: 500 }}>
          {t("login.hero_title") || "Gérez votre université en toute simplicité."}
        </h2>
        <p style={{ fontSize: 17, color: heroSubColor, fontWeight: 500, maxWidth: 450, marginBottom: 48, lineHeight: 1.7 }}>
          {t("login.hero_subtitle") || "La plateforme d'intelligence décisionnelle conçue spécifiquement pour l'Université de Carthage."}
        </p>
        <div style={{ width: '100%', maxWidth: 450, padding: '40px 0', background: heroIllustrationBg, borderRadius: 32, border: `1px solid ${separatorColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 40, left: 40, width: 128, height: 128, background: heroBlobA, borderRadius: '50%', filter: 'blur(48px)' }} />
          <div style={{ position: 'absolute', bottom: 40, right: 40, width: 128, height: 128, background: heroBlobB, borderRadius: '50%', filter: 'blur(48px)' }} />
          
          <div style={{ position: 'relative', zIndex: 10, padding: 16, borderRadius: 24, background: '#ffffff', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)', border: `2px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(59,130,246,0.2)'}` }}>
            <QRCodeSVG value={window.location.origin} size={160} fgColor="#000000" bgColor="#ffffff" level="H" includeMargin={false} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: heroTextColor, marginBottom: 8 }}>
              {t("login.scan_title", "Accès Mobile")}
            </p>
            <p style={{ fontSize: 13, color: heroSubColor, fontWeight: 500, maxWidth: 280, margin: '0 auto' }}>
              {t("login.scan_subtitle", "Scannez avec votre téléphone pour accéder instantanément à UcarOS")}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="w-full lg:w-[50%] flex flex-col items-center justify-center p-6 sm:p-12 lg:px-20 relative" style={{ background: bg, transition: 'background 0.3s' }}>
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center gap-3 mb-8 w-full max-w-[480px]">
          <div style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: btnShadow, background: btnBg, color: btnText }}>
            <Zap size={32} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>UcarOS</h1>
        </div>

        <div style={{ width: '100%', maxWidth: 480, background: cardBg, borderRadius: 16, boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.06)', border: `1px solid ${cardBorder}`, padding: 40, transition: 'background 0.3s, border-color 0.3s' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: titleColor, letterSpacing: '-0.02em', marginBottom: 8 }}>{t("login.title")}</h2>
            <p style={{ fontSize: 15, color: subtitleColor, fontWeight: 500 }}>{t("login.subtitle") || "Connectez-vous pour accéder à votre espace d'intelligence décisionnelle."}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div style={{ padding: 16, borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12, background: errorBg, border: `1px solid ${errorBorder}`, color: errorText }}>
                <span style={{ fontSize: 14, marginTop: 2 }}>⚠</span>
                <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: 13, fontWeight: 700, color: labelColor, marginLeft: 4 }}>{t("login.email")}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("login.email_placeholder") || "vous@universite.tn"} required
                  style={{ width: '100%', height: 52, borderRadius: 12, background: inputBg, border: `1px solid ${inputBorder}`, fontSize: 15, color: inputText, paddingLeft: 20, paddingRight: 20, outline: 'none', transition: 'all 0.2s' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.boxShadow = `0 0 0 3px ${focusRing}`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = inputBorder; e.currentTarget.style.boxShadow = 'none'; }} />
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: 13, fontWeight: 700, color: labelColor, marginLeft: 4 }}>{t("login.password")}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    style={{ width: '100%', height: 52, borderRadius: 12, background: inputBg, border: `1px solid ${inputBorder}`, fontSize: 15, color: inputText, paddingLeft: 20, paddingRight: 48, outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.boxShadow = `0 0 0 3px ${focusRing}`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = inputBorder; e.currentTarget.style.boxShadow = 'none'; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: labelColor, background: 'none', border: 'none', transition: 'color 0.2s' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              <button type="submit" disabled={loading}
                style={{ width: '100%', height: 54, borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: btnBg, color: btnText, border: 'none', boxShadow: btnShadow, opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}>
                {loading ? (<><div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><span>{t("login.loading")}</span></>)
                  : (<span>{t("login.button")}</span>)}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

            <div style={{ marginTop: 24 }}>
              <details className="group">
                <summary style={{ fontSize: 14, fontWeight: 600, color: helpTextColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', listStyle: 'none' }}>
                  {t("login.help")} <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="flex flex-col gap-3" style={{ paddingTop: 16 }}>
                  <a href="#" style={{ fontSize: 14, fontWeight: 600, color: helpTextColor, textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = helpHoverColor; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = helpTextColor; }}>{t("login.forgot_password") || "Mot de passe oublié ?"}</a>
                  <a href="#" style={{ fontSize: 14, fontWeight: 600, color: helpTextColor, textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = helpHoverColor; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = helpTextColor; }}>{t("login.learn_more") || "En savoir plus sur la connexion"}</a>
                </div>
              </details>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ fontSize: 14, color: subtitleColor, fontWeight: 500 }}>
              {t("login.no_account")}{" "}
              <Link to="/register" style={{ color: linkColor, fontWeight: 700, textDecoration: 'none' }}>{t("login.signup")}</Link>
            </p>
          </div>

          {/* Demo */}
          <div style={{ borderTop: `1px solid ${separatorColor}`, marginTop: 32, paddingTop: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20, color: demoLabelColor, textAlign: 'center' }}>{t("login.demo_accounts")}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: t("register.roles.president"), email: "president@ucar.tn", pass: "president123" },
                { role: t("register.roles.dean"), email: "dean@ucar.tn", pass: "dean123" },
                { role: t("register.roles.admin"), email: "admin@ucar.tn", pass: "admin123" },
                { role: t("register.roles.researcher"), email: "researcher@ucar.tn", pass: "researcher123" },
              ].map((d, i) => (
                <button key={i} type="button" onClick={() => handleDemoLogin(d.email, d.pass)} disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12,
                    textAlign: 'left', cursor: 'pointer', background: demoBtnBg,
                    border: `1px solid ${demoBtnBorder}`, transition: 'all 0.2s', opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = demoBtnHoverBorder; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = demoBtnBorder; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: demoColors[i].bg, color: demoColors[i].text, transition: 'background 0.2s' }}>
                    <User size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: demoRoleColor }}>{d.role}</p>
                    <p style={{ fontSize: 11, color: demoEmailColor, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>


        </div>
      </div>

      <FacultySelectionModal isOpen={showDeanModal} />
    </div>
  );
}
