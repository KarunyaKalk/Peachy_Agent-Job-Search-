import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Search,
  Briefcase,
  Mail,
  GraduationCap,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Master Profile', path: '/profile', icon: UserCheck },
    { name: 'Job Feed', path: '/jobs', icon: Search, badge: 'AI Scanned' },
    { name: 'Applications', path: '/applications', icon: Briefcase },
    { name: 'Cold Email', path: '/cold-email', icon: Mail },
    { name: 'Interview Prep', path: '/interview-prep', icon: GraduationCap },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col justify-between h-screen sticky top-0 z-30 transition-all duration-300">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-dark-border/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-peach-600 via-peach-500 to-peach-300 flex items-center justify-center text-xl shadow-glow-peach">
              🍑
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Peachy <span className="text-[10px] px-1.5 py-0.5 rounded bg-peach-500/10 text-peach-400 font-mono border border-peach-500/20">AGENT</span>
              </span>
              <p className="text-[11px] text-dark-muted font-medium">Job Search Copilot</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-dark-muted uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-peach-500/15 text-peach-400 border border-peach-500/30 shadow-glow-peach'
                      : 'text-slate-400 hover:text-white hover:bg-dark-hover'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Agent Quick Status & User Profile Footer */}
      <div className="p-3 border-t border-dark-border/60 space-y-3">
        {/* Status Card */}
        <div className="bg-dark-bg/60 border border-dark-border/80 rounded-lg p-3 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Agent Active</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-peach-400 pulse-glow" />
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-dark-hover/40 border border-dark-border/40">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-peach-500/20 border border-peach-500/30 text-peach-400 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Peachy User'}
              </p>
              <p className="text-[11px] text-dark-muted truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
