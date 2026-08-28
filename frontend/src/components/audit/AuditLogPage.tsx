import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { AuditLog } from '../../types';
import { ShieldCheck, Activity, AlertCircle, RefreshCw } from 'lucide-react';

import { mockAuditLogs } from '../../api/mockData';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    try {
      const data = await apiService.getAuditLogs();
      setLogs(data && data.length > 0 ? data : mockAuditLogs);
    } catch (e) {
      setLogs(mockAuditLogs);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-2 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Activity className="w-6 h-6 text-peach-500" />
          <span>Module 8: Activity & Scraper Audit Feed</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Timestamped activity log tracking every scrape, tailoring pass, ATS calculation, and email dispatch.
        </p>
      </div>

      <div className="peachy-card p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-cream-200 dark:border-slate-800">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Live Activity Feed</h3>
          <button onClick={loadAudit} className="text-slate-400 hover:text-slate-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-cream-50 dark:bg-slate-900/60 rounded-xl border border-cream-200 dark:border-slate-800 text-xs flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-mono font-bold text-peach-600 dark:text-peach-400">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({log.source})</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
              </div>

              <span className="font-mono text-[11px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
