import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Book, Settings, WifiOff, CheckCircle2 } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

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

      {/* Main Content Area */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Clean Streamlined Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border px-8 py-3 safe-area-pb z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavItem to="/" icon={<Home size={22} />} label="Today" />
          <NavItem to="/quran" icon={<Book size={22} />} label="Quran" />
          <NavItem to="/settings" icon={<Settings size={22} />} label="Settings" />
        </div>
      </nav>
    </div>
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
