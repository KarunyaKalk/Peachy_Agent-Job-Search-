import React from 'react';
import { Bell, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 border-b border-dark-border/60 bg-dark-bg/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title || 'Dashboard'}</h1>
        {subtitle && <p className="text-xs text-dark-muted font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Human Guard Safety Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Human Approval Guard ON</span>
        </div>

        {/* Quick Action Button */}
        <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-peach-500 hover:bg-peach-600 text-white text-xs font-semibold shadow-glow-peach transition-all">
          <Zap className="w-3.5 h-3.5" />
          <span>Run Scan</span>
        </button>

        {/* Notification Icon */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-peach-500 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-peach-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
