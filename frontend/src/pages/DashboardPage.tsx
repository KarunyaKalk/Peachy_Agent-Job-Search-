import React from 'react';
import { Header } from '../components/Layout/Header';
import { AuditFeed } from '../components/Audit/AuditFeed';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Mail,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { name: 'Discovered Jobs', value: '48', change: '+12 today', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { name: 'In Review Queue', value: '5', change: 'Action required', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { name: 'Applications Sent', value: '14', change: '85% match avg', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Cold Outreach', value: '9', change: '3 replies', icon: Mail, color: 'text-peach-400', bg: 'bg-peach-500/10 border-peach-500/20' },
  ];

  const recentJobs = [
    { id: 1, title: 'Senior Full Stack Engineer', company: 'Linear', location: 'Remote', score: 99, source: 'Wellfound' },
    { id: 2, title: 'AI Software Engineer', company: 'Anthropic', location: 'San Francisco, CA (Remote)', score: 98, source: 'Adzuna' },
  ];

  return (
    <div className="space-y-6">
      <Header
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Karunya'} 👋`}
        subtitle="Your autonomous AI job application copilot status and activity feed."
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

      {/* Main Grid: Review Queue & Live Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Match Jobs Ready for Review & Activity Audit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Matches Ready for Review */}
          <div className="glass-panel p-6 space-y-4 border-dark-border">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-peach-400" />
                  <span>Top Matches Ready for Review</span>
                </h2>
                <p className="text-xs text-dark-muted">Jobs scored above your threshold (80%+)</p>
              </div>
              <button
                onClick={() => navigate('/jobs')}
                className="text-xs font-semibold text-peach-400 hover:text-peach-300 flex items-center space-x-1"
              >
                <span>View Job Feed</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 hover:border-peach-500/40 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        onClick={() => navigate('/jobs')}
                        className="font-semibold text-sm text-white hover:text-peach-400 cursor-pointer"
                      >
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

                    <button
                      onClick={() => navigate('/tailored-resumes')}
                      className="px-3 py-1.5 rounded-lg bg-peach-500/20 hover:bg-peach-500 text-peach-300 hover:text-white border border-peach-500/30 text-xs font-semibold transition-all"
                    >
                      Tailor Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Agent Activity Feed */}
          <div className="glass-panel p-6 space-y-4 border-dark-border">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Live Agent Activity & Audit Feed</span>
              </h3>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>View Full Audit Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <AuditFeed limit={5} />
          </div>
        </div>

        {/* Right Col: Human Approval Guard Summary */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4 border-dark-border">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Human Approval Guard Active</span>
            </h3>

            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
              <p className="text-emerald-300 font-medium">
                🛡️ Submissions paused for explicit user authorization.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Peachy prepares tailored resumes and pre-fills forms, but never submits without your explicit click.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-dark-border/60 text-xs">
              <div className="flex justify-between">
                <span className="text-dark-muted">Scrape Interval:</span>
                <span className="text-slate-200 font-mono">6 Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-muted">Fact-Guard Audit:</span>
                <span className="text-emerald-400 font-medium">Enforced (0 Hallucinations)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-muted">Min ATS Target:</span>
                <span className="text-peach-400 font-mono">80% Match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
