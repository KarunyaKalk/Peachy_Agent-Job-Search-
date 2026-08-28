import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
  User,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Layers,
  Mail,
  BookOpen,
  Activity,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'jobs', label: 'Job Feed', icon: Briefcase },
    { id: 'resumes', label: 'Tailored Resumes', icon: Sparkles },
    { id: 'checker', label: 'Resume Checker', icon: ShieldCheck },
    { id: 'applications', label: 'Applications', icon: Layers },
    { id: 'outreach', label: 'Cold Email', icon: Mail },
    { id: 'interview', label: 'Interview Prep', icon: BookOpen },
    { id: 'audit', label: 'Audit Log', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-espresso-800/90 backdrop-blur-md border-b border-cream-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Mascot Identity */}
          <div
            onClick={() => setActivePage('profile')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-peach-500 flex items-center justify-center text-white font-display font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              🍑
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                Peachy
              </span>
              <span className="ml-1 text-[10px] font-mono uppercase font-bold text-peach-500 bg-peach-50 dark:bg-peach-950/50 px-1.5 py-0.5 rounded">
                AI Agent
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-peach-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Theme Switcher Quick Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-xl bg-cream-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-peach-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-peach-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 bg-cream-50 dark:bg-slate-900 border-t border-cream-200 dark:border-slate-800 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap inline-flex items-center space-x-1 ${
                isActive
                  ? 'bg-peach-500 text-white'
                  : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
