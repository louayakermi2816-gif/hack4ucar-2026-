import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import { useState } from "react";
import {
  LogOut, LayoutDashboard, Users, GraduationCap, Microscope,
  CircleDollarSign, Building2, LineChart, Settings, Search,
  Bell, Target, ChevronRight, Sun, Moon
} from "lucide-react";
import FacultySelectionModal from "./FacultySelectionModal";
import AIChatBubble from "./AIChatBubble";
import { useTheme } from "../ThemeProvider";

export default function Layout() {
  const { user, logout } = useAuth();
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  if (!user) return null;

  const navItems = [
    { id: "/", icon: <LayoutDashboard size={19} />, label: "Dashboard", roles: ["president", "dean", "admin", "researcher"] },
    { id: "/enrollment", icon: <Users size={19} />, label: "Enrollment", roles: ["president", "dean", "admin"] },
    { id: "/academic", icon: <GraduationCap size={19} />, label: "Academic Affairs", roles: ["president", "dean", "admin"] },
    { id: "/research", icon: <Microscope size={19} />, label: "Research & Grants", roles: ["president", "dean", "admin", "researcher"] },
    { id: "/finance", icon: <CircleDollarSign size={19} />, label: "Finance", roles: ["president", "admin"] },
    { id: "/faculty", icon: <Users size={19} />, label: "Faculty & Staff", roles: ["president", "dean", "admin"] },
    { id: "/facilities", icon: <Building2 size={19} />, label: "Facilities", roles: ["president", "admin"] },
    { id: "/strategy", icon: <Target size={19} />, label: "Strategy", roles: ["president", "dean"] },
    { id: "/analytics", icon: <LineChart size={19} />, label: "Analytics", roles: ["president", "dean", "admin"] },
    { id: "/settings", icon: <Settings size={19} />, label: "Settings", roles: ["admin", "president"] },
  ];

  const activeNav = navItems.filter(item => item.roles.includes(user.role));
  const currentPage = navItems.find((item) => item.id === location.pathname);

  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentGlow = isDark ? 'rgba(212,175,55,0.4)' : 'rgba(59,130,246,0.4)';

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--uc-bg)', transition: 'background 0.3s' }}>

      {/* ═══ SIDEBAR ═══ */}
      <aside className="uc-sidebar flex flex-col shrink-0 z-20" style={{ width: 250, minHeight: '100vh' }}>
        {/* Logo */}
        <div className="flex flex-col items-center justify-center shrink-0" style={{ paddingTop: 36, paddingBottom: 32 }}>
          <div
            key={theme}
            className="uc-logo-text"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 48, fontWeight: 700,
              lineHeight: 1, letterSpacing: '-0.02em',
              background: `linear-gradient(180deg, ${accent}, ${isDark ? '#f0cc6e' : '#60a5fa'})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', color: 'transparent',
            }}
          >UC</div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif", fontSize: 10.5, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.2em', color: accent,
            marginTop: 6, textAlign: 'center', lineHeight: 1.5, opacity: 0.85,
          }}>University<br />Chancellor</div>
        </div>

        <div className="uc-divider" style={{ marginLeft: 24, marginRight: 24, marginBottom: 12 }} />

        {/* Navigation */}
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
                <span>{item.label}</span>
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
        {/* Header */}
        <header className="uc-header flex items-center justify-between shrink-0 z-10" style={{ height: 68, paddingLeft: 32, paddingRight: 32 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--uc-text-muted)', fontWeight: 500 }}>University Chancellor</span>
            <ChevronRight size={14} style={{ color: 'var(--uc-text-dim)' }} />
            <span style={{ color: 'var(--uc-text-secondary)', fontWeight: 600 }}>{currentPage?.label || "Dashboard"}</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <Search size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--uc-text-dim)' }} />
              <input type="text" placeholder="Search..." className="uc-search-input" />
            </div>

            {/* Theme Toggle */}
            <button className="uc-theme-toggle" onClick={() => setTheme(isDark ? 'light' : 'dark')} title="Toggle theme">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div style={{ width: 1, height: 28, background: 'var(--uc-border)' }} />

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent, lineHeight: 1, marginBottom: 3 }}>{user.role}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--uc-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{user.full_name}</span>
              </div>
              <div className="uc-avatar">{user.full_name.substring(0, 2).toUpperCase()}</div>
            </div>

            <div className="relative cursor-pointer" style={{ color: 'var(--uc-text-muted)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--uc-text-muted)'; }}>
              <Bell size={19} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--uc-bell-dot-border)' }} />
            </div>

            <button onClick={logout} className="cursor-pointer" title="Logout"
              style={{ color: 'var(--uc-text-muted)', transition: 'color 0.2s', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--uc-text-muted)'; }}>
              <LogOut size={19} />
            </button>
          </div>
        </header>

        <div style={{ height: 1, background: 'var(--uc-divider)' }} />

        <div className="flex-1 overflow-y-auto" style={{ padding: '32px 36px 80px 36px', background: 'var(--uc-content-radial)' }}>
          <Outlet />
        </div>
      </main>

      <FacultySelectionModal isOpen={showFacultyModal} onClose={() => setShowFacultyModal(false)} />
      <AIChatBubble />
    </div>
  );
}
