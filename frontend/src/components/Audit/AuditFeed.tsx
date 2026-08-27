import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types/audit';
import { auditService } from '../../services/audit';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  Building,
  Filter,
  RefreshCw,
  Sparkles,
  Clock,
  Globe,
} from 'lucide-react';

interface Props {
  limit?: number;
}

export const AuditFeed: React.FC<Props> = ({ limit = 50 }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fetched = await auditService.getAuditLogs(selectedCategory, selectedStatus, limit);
      setLogs(fetched);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory, selectedStatus, limit]);

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'scrape_run':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'resume_generation':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'application_submitted':
        return <Send className="w-4 h-4 text-emerald-400" />;
      case 'email_sent':
        return <Send className="w-4 h-4 text-amber-400" />;
      case 'captcha_blocked':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-peach-400" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </span>
        );
      case 'warning':
      case 'captcha_blocked':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            CAPTCHA Alert
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-bg/60 p-3.5 rounded-xl border border-dark-border/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Filter Log:</span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1.5 bg-dark-card border border-dark-border rounded-lg text-white font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="scrape_run">Job Scrapes</option>
            <option value="resume_generation">Resume Generation</option>
            <option value="application_submitted">Applications</option>
            <option value="email_sent">Cold Emails</option>
            <option value="captcha_blocked">CAPTCHA Alerts</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 bg-dark-card border border-dark-border rounded-lg text-white font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success Only</option>
            <option value="warning">Warnings Only</option>
            <option value="captcha_blocked">CAPTCHA Blocks</option>
          </select>
        </div>

        <button
          onClick={fetchLogs}
          className="p-1.5 rounded-lg bg-dark-card hover:bg-slate-700 text-slate-300 border border-dark-border flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Log Feed Items List */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-xs text-dark-muted">Fetching audit log trail...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel p-8 text-center text-dark-muted text-xs border-dark-border">
          No audit activity logs recorded for the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`glass-panel p-4 space-y-2 border transition-all ${
                log.status === 'warning' || log.status === 'captcha_blocked'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-dark-border hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-dark-bg/80 border border-dark-border/60">
                    {renderCategoryIcon(log.category)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{log.action}</h5>
                    <span className="text-[11px] text-dark-muted font-mono">
                      Category: {log.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {renderStatusBadge(log.status)}
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {log.details && (
                <p className="text-xs text-slate-300 bg-dark-bg/60 p-2.5 rounded-lg border border-dark-border/40 font-mono leading-relaxed">
                  {log.details}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
