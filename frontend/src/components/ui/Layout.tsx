import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Book, Settings, WifiOff, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { TopInstallButton } from './InstallPrompt';

const Layout: React.FC = () => {
  const { isOnline, showRestoredToast } = useNetworkStatus();

  return (
    <div className="flex flex-col min-h-screen bg-background text-text relative">
      {/* ⚡ Offline Alert Top Bar */}
      {!isOnline && (
        <div className="sticky top-0 z-50 bg-amber-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
          <WifiOff size={14} className="shrink-0 animate-pulse" />
          <span>Offline Mode — Quran, Tasbeeh & Prayer Times available</span>
        </div>
      )}

      {/* 🟢 Online Restored Toast */}
      {showRestoredToast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xl animate-in slide-in-from-top fade-in duration-300">
          <CheckCircle2 size={16} className="text-white" />
          <span>Internet connection restored. All features online!</span>
        </div>
      )}

      {/* 🖥️ Desktop / Tablet Top Navigation Header (hidden on mobile) */}
      <header className="hidden md:block sticky top-0 z-40 bg-card/85 dark:bg-[#062426]/85 backdrop-blur-xl border-b border-border/80 dark:border-amber-500/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="619 Islam" className="w-9 h-9 object-contain drop-shadow group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-base font-black font-arabic text-amber-400 block leading-tight">
                ٦١٩ إِسْلَام
              </span>
              <span className="text-[10px] font-bold text-subtext uppercase tracking-widest block -mt-0.5">
                Daily Companion
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-1.5 bg-surface/80 dark:bg-black/30 p-1.5 rounded-full border border-border/80 dark:border-amber-500/20 text-xs font-bold">
            <DesktopNavLink to="/" icon={<Home size={15} />} label="Today" />
            <DesktopNavLink to="/quran" icon={<Book size={15} />} label="Quran" />
            <DesktopNavLink to="/namaz" icon={<Clock size={15} />} label="Namaz" />
            <DesktopNavLink to="/features" icon={<Sparkles size={15} />} label="All Features" />
            <DesktopNavLink to="/settings" icon={<Settings size={15} />} label="Settings" />
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <TopInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content Area: Fully fluid and responsive */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 md:pb-12 pt-2 md:pt-4 overflow-y-auto">
        <Outlet />
      </main>

      {/* 📱 Mobile Streamlined Bottom Navigation Bar (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border px-4 py-2.5 safe-area-pb z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavItem to="/" icon={<Home size={21} />} label="Today" />
          <NavItem to="/quran" icon={<Book size={21} />} label="Quran" />
          <NavItem to="/namaz" icon={<Clock size={21} />} label="Namaz" />
          <NavItem to="/settings" icon={<Settings size={21} />} label="Settings" />
        </div>
      </nav>
    </div>
  );
};

const DesktopNavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all ${
          isActive 
            ? 'bg-amber-500 text-black shadow-sm font-black' 
            : 'text-subtext hover:text-text hover:bg-card'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors ${
          isActive ? 'text-primary' : 'text-muted hover:text-subtext'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
};

export default Layout;
