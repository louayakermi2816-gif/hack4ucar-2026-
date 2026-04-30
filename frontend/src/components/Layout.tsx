/**
 * Layout.tsx — Main dashboard layout with sidebar + topbar.
 *
 * This wraps all dashboard pages. The <Outlet /> renders the current page
 * based on the URL (React Router's nested routing).
 *
 * Sidebar navigation changes based on role:
 * - President: sees everything
 * - Dean: sees only their institution data
 * - Admin: sees everything + upload
 * - Researcher: sees everything (read-only)
 */
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeProvider";
import { Moon, Sun, Globe, LogOut, Menu, LayoutDashboard, Building2, Bell, Upload } from "lucide-react";

const roleBadgeColors: Record<string, string> = {
  president: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
  dean: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30",
  admin: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  researcher: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : i18n.language === 'en' ? 'ar' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard'), roles: ["president", "dean", "admin", "researcher"] },
    { to: "/institutions", icon: <Building2 size={20} />, label: t('sidebar.institutions'), roles: ["president", "dean", "admin", "researcher"] },
    { to: "/alerts", icon: <Bell size={20} />, label: t('sidebar.alerts'), roles: ["president", "dean", "admin", "researcher"] },
    { to: "/upload", icon: <Upload size={20} />, label: t('sidebar.upload'), roles: ["admin"] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text-main transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-border flex flex-col transition-all duration-300 shrink-0 shadow-lg z-20 relative`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-border">
          <span className="text-xl">🎓</span>
          {sidebarOpen && (
            <span className="ml-3 text-lg font-bold tracking-tight">
              Ucar<span className="text-ucar-500 dark:text-ucar-400">OS</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-ucar-500 text-white shadow-md shadow-ucar-500/30"
                    : "text-text-muted hover:text-text-main hover:bg-border/50 border border-transparent"
                }`
              }
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-border bg-border/20">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm font-semibold truncate">{user.full_name}</p>
              <span className={`inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-md border ${roleBadgeColors[user.role]}`}>
                {t(`register.roles.${user.role}`, user.role)}
              </span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer font-medium"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>{t('sidebar.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-6 shrink-0 z-10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-main hover:bg-border/50 transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
          
          <h2 className="text-lg font-semibold ml-4 hidden sm:block">
            {t('dashboard.subtitle')}
          </h2>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-text-muted mr-4 hidden md:inline-block">
              {user.email}
            </span>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-border/50 transition-colors flex items-center gap-1 cursor-pointer"
              title="Change Language"
            >
              <Globe size={18} />
              <span className="text-xs font-bold uppercase">{i18n.language}</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-border/50 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
