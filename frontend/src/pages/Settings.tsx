import { useTheme } from "../ThemeProvider";
import { useAuth } from "../auth";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Settings as SettingsIcon, User, Shield, Bell, Palette, Globe, Database, Moon, Sun, Check } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentLight = isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)';

  // Editable profile state
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [editingName, setEditingName] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user?.full_name]);

  // Language state
  const [lang, setLang] = useState(i18n.language);

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleSaveName = () => {
    setEditingName(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      title: t("settings.appearance"),
      icon: <Palette size={20} />,
      items: [
        {
          label: t("settings.theme"),
          description: t("settings.theme_desc"),
          control: (
            <div className="flex gap-2">
              <button onClick={() => setTheme("dark")} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: isDark ? accent : 'transparent', color: isDark ? '#0a0d15' : 'var(--uc-text-muted)', border: `1px solid ${isDark ? accent : 'var(--uc-border)'}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Moon size={14} /> {t("settings.dark")}
              </button>
              <button onClick={() => setTheme("light")} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: !isDark ? accent : 'transparent', color: !isDark ? '#fff' : 'var(--uc-text-muted)', border: `1px solid ${!isDark ? accent : 'var(--uc-border)'}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sun size={14} /> {t("settings.light")}
              </button>
            </div>
          ),
        },
      ],
    },
    {
      title: t("settings.profile"),
      icon: <User size={20} />,
      items: [
        {
          label: t("settings.full_name"),
          description: editingName ? undefined : fullName,
          control: editingName ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: 'var(--uc-sidebar-hover-bg)', border: '1px solid var(--uc-border)', color: 'var(--uc-text)', outline: 'none', width: 180 }} autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveName()} />
              <button onClick={handleSaveName} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: accent, color: isDark ? '#0a0d15' : '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} /> {t("settings.save")}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--uc-text-muted)', border: '1px solid var(--uc-border)', transition: 'all 0.2s' }}>{t("settings.edit")}</button>
          ),
        },
        { label: t("settings.email"), description: user?.email || "—", control: <EditBtn label={t("settings.edit")} /> },
        { label: t("settings.role_label"), description: t(`roles.${user?.role}`, user?.role || "—"), control: <span style={{ fontSize: 12, color: accent, background: accentLight, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>{t(`roles.${user?.role}`)}</span> },
      ],
    },
    {
      title: t("settings.language"),
      icon: <Globe size={20} />,
      items: [
        {
          label: t("settings.language_label"),
          description: t("settings.language_desc"),
          control: (
            <div className="flex gap-2">
              {[
                { code: "fr", label: "Français", flag: "🇫🇷" },
                { code: "en", label: "English", flag: "🇬🇧" },
                { code: "ar", label: "العربية", flag: "🇹🇳" },
              ].map(l => (
                <button key={l.code} onClick={() => handleLangChange(l.code)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: lang === l.code ? accent : 'transparent',
                    color: lang === l.code ? (isDark ? '#0a0d15' : '#fff') : 'var(--uc-text-muted)',
                    border: `1px solid ${lang === l.code ? accent : 'var(--uc-border)'}`,
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  <span>{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      title: t("settings.notifications"),
      icon: <Bell size={20} />,
      items: [
        { label: t("settings.kpi_alerts"), description: t("settings.kpi_alerts_desc"), control: <Toggle /> },
        { label: t("settings.weekly_reports"), description: t("settings.weekly_reports_desc"), control: <Toggle defaultOn /> },
        { label: t("settings.system_updates"), description: t("settings.system_updates_desc"), control: <Toggle defaultOn /> },
      ],
    },
    {
      title: t("settings.security"),
      icon: <Shield size={20} />,
      items: [
        { label: t("settings.2fa"), description: t("settings.2fa_desc"), control: <Toggle /> },
        { label: t("settings.sessions"), description: t("settings.sessions_desc"), control: <EditBtn label={t("settings.manage")} /> },
      ],
    },
    {
      title: t("settings.system"),
      icon: <Database size={20} />,
      items: [
        { label: t("settings.timezone"), description: "Africa/Tunis (UTC+1)", control: <EditBtn label={t("settings.edit")} /> },
        { label: t("settings.version"), description: "UcarOS v2.4.1", control: <span style={{ fontSize: 11, color: 'var(--uc-text-muted)' }}>Build 2026.05.01</span> },
      ],
    },
  ];

  return (
    <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 68px)', direction: i18n.language === 'ar' ? 'rtl' : 'ltr' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t("settings.title")}
        </h1>
        <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, marginTop: 4 }}>{t("settings.subtitle")}</p>
        {saved && (
          <div style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} /> {t("settings.saved")}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6" style={{ maxWidth: 800 }}>
        {sections.map((section, si) => (
          <div key={si} className="uc-card" style={{ padding: '24px 28px' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
              <div style={{ color: accent }}>{section.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--uc-text)', letterSpacing: '0.03em' }}>{section.title}</h3>
            </div>
            <div className="flex flex-col gap-0">
              {section.items.map((item, ii) => (
                <div key={ii} className="flex items-center justify-between" style={{ padding: '14px 0', borderTop: ii > 0 ? '1px solid var(--uc-border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--uc-text)' }}>{item.label}</div>
                    {item.description && <div style={{ fontSize: 12, color: 'var(--uc-text-muted)', marginTop: 2 }}>{item.description}</div>}
                  </div>
                  <div>{item.control}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditBtn({ label = "Modifier" }: { label?: string }) {
  return (
    <button style={{
      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
      background: 'transparent', color: 'var(--uc-text-muted)', border: '1px solid var(--uc-border)',
      transition: 'all 0.2s',
    }}>{label}</button>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }} onClick={() => setOn(!on)}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        background: on ? '#22c55e' : 'var(--uc-border)', transition: 'background 0.2s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%',
          background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </span>
    </label>
  );
}
