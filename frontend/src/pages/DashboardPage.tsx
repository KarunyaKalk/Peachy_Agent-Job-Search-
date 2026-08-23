import React from 'react';
import { Header } from '../components/Layout/Header';
import {
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Mail,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Discovered Jobs', value: '48', change: '+12 today', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { name: 'In Review Queue', value: '5', change: 'Action required', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { name: 'Applications Sent', value: '14', change: '85% match avg', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Cold Outreach', value: '9', change: '3 replies', icon: Mail, color: 'text-peach-400', bg: 'bg-peach-500/10 border-peach-500/20' },
  ];

  const recentJobs = [
    { title: 'Senior Full Stack Engineer', company: 'Linear', location: 'Remote', score: 96, source: 'Wellfound', date: '2h ago' },
    { title: 'AI Systems Architect', company: 'Anthropic', location: 'San Francisco, CA (Hybrid)', score: 94, source: 'Adzuna', date: '4h ago' },
    { title: 'Lead Backend Developer (Python)', company: 'Supabase', location: 'Remote', score: 91, source: 'JSearch', date: '5h ago' },
  ];

  return (
    <div className="space-y-6">
      <Header
        title={`Good day, ${user?.full_name?.split(' ')[0] || 'User'} 👋`}
        subtitle="Here is your job search copilot summary and active pipeline."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className={`glass-panel p-5 border ${stat.bg} glass-card-hover`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider">{stat.name}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
                <span className="text-xs font-medium text-slate-400 flex items-center">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Review Queue & Agent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Match Jobs Ready for Review */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-peach-400" />
                <span>Top Matches Ready for Tailoring & Review</span>
              </h2>
              <p className="text-xs text-dark-muted">Jobs scored above your threshold (85%+)</p>
            </div>
            <button className="text-xs font-semibold text-peach-400 hover:text-peach-300 flex items-center space-x-1">
              <span>View All Feed</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 hover:border-peach-500/40 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-white hover:text-peach-400 cursor-pointer">
                      {job.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-peach-500/10 text-peach-400 border border-peach-500/20 font-medium">
                      {job.source}
                    </span>
                  </div>
                  <p className="text-xs text-dark-muted">
                    <span className="text-slate-300 font-medium">{job.company}</span> • {job.location}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 justify-end">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm font-extrabold text-emerald-400">{job.score}%</span>
                    </div>
                    <span className="text-[10px] text-dark-muted">Match Score</span>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-peach-500/20 hover:bg-peach-500 text-peach-300 hover:text-white border border-peach-500/30 text-xs font-semibold transition-all">
                    Tailor Resume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Safety & Active Guard Summary */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Human Approval Guard</span>
            </h3>

            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
              <p className="text-emerald-300 font-medium">
                🛡️ All submission channels strictly paused for explicit user click.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Peachy will prepare tailored resumes and pre-fill applications, but will never submit without your review.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-dark-border/60">
              <div className="flex justify-between text-xs">
                <span className="text-dark-muted">Scrape Rate Limit:</span>
                <span className="text-slate-200 font-mono">15 requests/hr</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-muted">Fact-Guard Check:</span>
                <span className="text-emerald-400 font-medium">Enforced (0 Hallucinations)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-muted">Min ATS Target:</span>
                <span className="text-peach-400 font-mono">89 / 100</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-dark-muted uppercase tracking-wider">Quick Roadmap</h3>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center space-x-2 text-peach-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-peach-500"></span>
                <span>Day 1: Foundation & Auth Setup Complete</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-dark-muted"></span>
                <span>Day 2: Master Profile Data Model</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-dark-muted"></span>
                <span>Day 3: Job Discovery Engine</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
