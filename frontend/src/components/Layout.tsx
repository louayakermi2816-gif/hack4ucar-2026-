import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useState, useRef, useEffect } from "react";
import {
  LogOut, LayoutDashboard, Users, GraduationCap, Microscope,
  CircleDollarSign, Building2, LineChart, Settings, Search,
  Bell, Target, ChevronRight, ChevronDown, Sun, Moon, FileUp, User, X
} from "lucide-react";
import FacultySelectionModal from "./FacultySelectionModal";
import AIChatBubble from "./AIChatBubble";
import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function Layout() {
  const { user, logout } = useAuth();
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState<Set<number>>(new Set());
  const profileRef = useRef<HTMLDivElement>(null);
  const [instName, setInstName] = useState<string>("");

  useEffect(() => {
    if (user?.role === "dean" && user.institution_id) {
      api.get("/api/institutions").then(res => {
        const inst = res.data.find((i: any) => i.id === user.institution_id);
        if (inst) setInstName(inst.name);
      }).catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  // Auto-show faculty modal for deans without institution
  useEffect(() => {
    if (user?.role === "dean" && !user.institution_id) {
      setShowFacultyModal(true);
    }
  }, [user]);

  if (!user) return null;

  const navItems = [
    { id: "/", icon: <LayoutDashboard size={19} />, labelKey: "nav.dashboard", roles: ["president", "dean", "admin", "researcher"] },
    { id: "/enrollment", icon: <Users size={19} />, labelKey: "nav.enrollment", roles: ["president", "dean", "admin"] },
    { id: "/academic", icon: <GraduationCap size={19} />, labelKey: "nav.academic", roles: ["president", "dean", "admin"] },
    { id: "/research", icon: <Microscope size={19} />, labelKey: "nav.research", roles: ["president", "dean", "admin", "researcher"] },
    { id: "/finance", icon: <CircleDollarSign size={19} />, labelKey: "nav.finance", roles: ["president", "dean", "admin"] },
    { id: "/faculty", icon: <Users size={19} />, labelKey: "nav.faculty", roles: ["president", "dean", "admin"] },
    { id: "/facilities", icon: <Building2 size={19} />, labelKey: "nav.facilities", roles: ["president", "dean", "admin"] },
    { id: "/strategy", icon: <Target size={19} />, labelKey: "nav.strategy", roles: ["president", "dean"] },
    { id: "/analytics", icon: <LineChart size={19} />, labelKey: "nav.analytics", roles: ["president", "dean", "admin"] },
    { id: "/upload", icon: <FileUp size={19} />, labelKey: "nav.upload", roles: ["admin"] },
    { id: "/settings", icon: <Settings size={19} />, labelKey: "nav.settings", roles: ["admin", "president"] },
  ];

  const activeNav = navItems.filter(item => item.roles.includes(user.role));
  const currentPage = navItems.find((item) => item.id === location.pathname);
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentGlow = isDark ? 'rgba(212,175,55,0.4)' : 'rgba(59,130,246,0.4)';

  const searchResults = searchQuery.trim()
    ? activeNav.filter(n => t(n.labelKey).toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchNav = (path: string) => { navigate(path); setSearchQuery(""); setSearchOpen(false); };

  const notifications = [
    { id: 1, text: t("notifications_data.n1"), time: i18n.language === "en" ? "2h ago" : i18n.language === "ar" ? "منذ ساعتين" : "Il y a 2h", unread: !readNotifs.has(1) },
    { id: 2, text: t("notifications_data.n2"), time: i18n.language === "en" ? "5h ago" : i18n.language === "ar" ? "منذ 5 ساعات" : "Il y a 5h", unread: !readNotifs.has(2) },
    { id: 3, text: t("notifications_data.n3"), time: i18n.language === "en" ? "Yesterday" : i18n.language === "ar" ? "أمس" : "Hier", unread: false },
    { id: 4, text: t("notifications_data.n4"), time: i18n.language === "en" ? "Yesterday" : i18n.language === "ar" ? "أمس" : "Hier", unread: false },
  ];

  const markAllRead = () => setReadNotifs(new Set([1, 2, 3, 4]));
  const hasUnread = notifications.some(n => n.unread);

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--uc-bg)', transition: 'background 0.3s' }}>

      {/* ═══ SIDEBAR ═══ */}
      <aside className="uc-sidebar flex flex-col shrink-0 z-20" style={{ width: 250, minHeight: '100vh' }}>
        <div className="flex flex-col items-center justify-center shrink-0" style={{ paddingTop: 36, paddingBottom: 32 }}>
          <div key={theme} style={{
            fontFamily: "'Playfair Display', Georgia, serif", fontSize: 48, fontWeight: 700,
            lineHeight: 1, letterSpacing: '-0.02em',
            background: `linear-gradient(180deg, ${accent}, ${isDark ? '#f0cc6e' : '#60a5fa'})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent',
          }}>UC</div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif", fontSize: 10.5, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.2em', color: accent,
            marginTop: 6, textAlign: 'center', lineHeight: 1.5, opacity: 0.85,
          }}>University<br />Chancellor</div>
        </div>

        <div className="uc-divider" style={{ marginLeft: 24, marginRight: 24, marginBottom: 12 }} />

        <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto py-3 px-3">
          {activeNav.map((item) => {
            const isActive = location.pathname === item.id;
            return (
              <NavLink key={item.id} to={item.id} end={item.id === "/"}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 18px', borderRadius: 10, fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500, position: 'relative',
                  textDecoration: 'none', transition: 'all 0.25s ease',
                  color: isActive ? accent : 'var(--uc-sidebar-text)',
                  background: isActive ? 'var(--uc-sidebar-active-bg)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--uc-sidebar-hover)'; e.currentTarget.style.background = 'var(--uc-sidebar-hover-bg)'; }}}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--uc-sidebar-text)'; e.currentTarget.style.background = 'transparent'; }}}
              >
                {isActive && <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, background: accent, borderRadius: '0 3px 3px 0', boxShadow: `0 0 10px ${accentGlow}` }} />}
                <span className="shrink-0 flex justify-center items-center" style={{ width: 20 }}>{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '16px 0' }}>
          <div style={{ height: 2, background: 'var(--uc-divider)', margin: '0 20px' }} />
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="uc-header flex items-center justify-between shrink-0 z-10" style={{ height: 68, paddingLeft: 32, paddingRight: 32 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13 }}>
            <span onClick={() => navigate("/")} style={{ color: 'var(--uc-text-muted)', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--uc-text-muted)'; e.currentTarget.style.textDecoration = 'none'; }}
            >{t("header.breadcrumb")}</span>
            <ChevronRight size={14} style={{ color: 'var(--uc-text-dim)' }} />
            <span style={{ color: 'var(--uc-text-secondary)', fontWeight: 600 }}>{currentPage ? t(currentPage.labelKey) : t("nav.dashboard")}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dean Institution Selector */}
            {user?.role === "dean" && (
              <button
                onClick={() => setShowFacultyModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  background: isDark ? 'rgba(212,175,55,0.05)' : 'rgba(59,130,246,0.05)',
                  borderColor: isDark ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.2)',
                  color: accent
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(212,175,55,0.1)' : 'rgba(59,130,246,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(212,175,55,0.05)' : 'rgba(59,130,246,0.05)'; }}
              >
                <Building2 size={14} />
                <span style={{ fontSize: 12, fontWeight: 600, maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {instName || t("header.select_institution") || "Select Institution"}
                </span>
                <ChevronDown size={14} />
              </button>
            )}

            {/* Search */}
            <div style={{ position: 'relative' }}>
              {searchOpen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--uc-text-dim)' }} />
                    <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("header.search")} className="uc-search-input" style={{ paddingLeft: 36, width: 220 }}
                      onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } if (e.key === "Enter" && searchResults.length > 0) handleSearchNav(searchResults[0].id); }}
                    />
                    {searchQuery.trim() && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', zIndex: 100 }}>
                        {searchResults.length > 0 ? searchResults.map(r => (
                          <div key={r.id} onClick={() => handleSearchNav(r.id)}
                            style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--uc-text)', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--uc-sidebar-hover-bg)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          ><span style={{ color: accent }}>{r.icon}</span><span>{t(r.labelKey)}</span></div>
                        )) : (
                          <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--uc-text-muted)' }}>{t("header.no_results")}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--uc-text-muted)', display: 'flex' }}><X size={16} /></button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="uc-theme-toggle" title="Search"><Search size={16} /></button>
              )}
            </div>

            <button className="uc-theme-toggle" onClick={() => setTheme(isDark ? 'light' : 'dark')} title="Toggle theme">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div style={{ width: 1, height: 28, background: 'var(--uc-border)' }} />

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="flex flex-col items-end">
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent, lineHeight: 1, marginBottom: 3 }}>
                    {t(`roles.${user.role}`)}{instName ? ` • ${instName}` : ''}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--uc-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{user.full_name}</span>
                </div>
                <div className="uc-avatar">{user.full_name.substring(0, 2).toUpperCase()}</div>
              </div>
              {profileOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 260, background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.35)', zIndex: 100 }}>
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--uc-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${isDark ? '#8B7225' : '#2563eb'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#0a0d15' : '#fff', fontSize: 15, fontWeight: 700 }}>{user.full_name.substring(0, 2).toUpperCase()}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--uc-text)' }}>{user.full_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginTop: 1 }}>{user.email}</p>
                      {instName && <p style={{ fontSize: 10, color: accent, marginTop: 4, fontWeight: 600 }}>{instName}</p>}
                    </div>
                  </div>
                  {[
                    { icon: <User size={15} />, label: t("header.profile"), action: () => { navigate("/settings"); setProfileOpen(false); } },
                    { icon: <Settings size={15} />, label: t("header.settings"), action: () => { navigate("/settings"); setProfileOpen(false); } },
                  ].map((item, i) => (
                    <div key={i} onClick={item.action}
                      style={{ padding: '11px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--uc-text)', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--uc-sidebar-hover-bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    ><span style={{ color: 'var(--uc-text-muted)' }}>{item.icon}</span><span>{item.label}</span></div>
                  ))}
                  <div style={{ padding: '8px 18px', borderTop: '1px solid var(--uc-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, marginRight: 4 }}>🌐</span>
                    {[{c:"fr",l:"FR"},{c:"en",l:"EN"},{c:"ar",l:"AR"}].map(lang => (
                      <button key={lang.c} onClick={() => { i18n.changeLanguage(lang.c); setProfileOpen(false); }}
                        style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          background: i18n.language === lang.c ? accent : 'transparent',
                          color: i18n.language === lang.c ? (isDark ? '#0a0d15' : '#fff') : 'var(--uc-text-muted)',
                          border: `1px solid ${i18n.language === lang.c ? accent : 'var(--uc-border)'}`,
                          transition: 'all 0.15s',
                        }}>{lang.l}</button>
                    ))}
                  </div>
                  <div onClick={logout}
                    style={{ padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--uc-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  ><LogOut size={15} /><span>{t("header.logout")}</span></div>
                </div>
              )}
            </div>

            {/* Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <div className="relative cursor-pointer" style={{ color: 'var(--uc-text-muted)', transition: 'color 0.2s' }}
                onClick={() => setBellOpen(!bellOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.color = accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--uc-text-muted)'; }}>
                <Bell size={19} />
                {hasUnread && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--uc-bell-dot-border)' }} />}
              </div>
              {bellOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 320, background: 'var(--uc-card-bg)', border: '1px solid var(--uc-border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.35)', zIndex: 100 }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--uc-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--uc-text)' }}>{t("header.notifications")}</span>
                    <span onClick={markAllRead} style={{ fontSize: 11, fontWeight: 600, color: accent, cursor: 'pointer' }}>{t("header.mark_read")}</span>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--uc-border)', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.15s', background: n.unread ? (isDark ? 'rgba(212,175,55,0.03)' : 'rgba(59,130,246,0.03)') : 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--uc-sidebar-hover-bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = n.unread ? (isDark ? 'rgba(212,175,55,0.03)' : 'rgba(59,130,246,0.03)') : 'transparent'; }}
                    >
                      {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, marginTop: 6, flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: n.unread ? 600 : 500, color: 'var(--uc-text)', lineHeight: 1.4 }}>{n.text}</p>
                        <p style={{ fontSize: 11, color: 'var(--uc-text-muted)', marginTop: 3 }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 18px', textAlign: 'center' }}>
                    <span onClick={() => { navigate("/alerts"); setBellOpen(false); }} style={{ fontSize: 12, fontWeight: 600, color: accent, cursor: 'pointer' }}>{t("header.view_all")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ height: 1, background: 'var(--uc-divider)' }} />

        <div className="flex-1 overflow-y-auto" style={{ padding: '32px 36px 120px 36px', background: 'var(--uc-content-radial)' }}>
          <Outlet />
        </div>
      </main>

      <FacultySelectionModal isOpen={showFacultyModal} onClose={() => setShowFacultyModal(false)} />
      <AIChatBubble />
    </div>
  );
}
