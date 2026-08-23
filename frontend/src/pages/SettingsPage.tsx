import React from 'react';
import { Header } from '../components/Layout/Header';
import { Settings as SettingsIcon, Sliders, ShieldCheck, Key, Bell, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Header
        title="Settings & Safety Controls"
        subtitle="Manage scanning frequencies, ATS thresholds, daily limits, and API keys."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scan & Threshold Settings */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-dark-border/60">
            <Sliders className="w-5 h-5 text-peach-400" />
            <h3 className="font-bold text-white">Agent Operating Controls</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Scan Interval (Hours)</label>
              <input
                type="number"
                defaultValue={6}
                className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Minimum ATS Target Score</label>
              <input
                type="number"
                defaultValue={89}
                className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Daily Cold Email Cap</label>
              <input
                type="number"
                defaultValue={15}
                className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* API Credentials Overview */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-dark-border/60">
            <Key className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white">Integrations & API Keys</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg/60 border border-dark-border/60">
              <div>
                <p className="font-semibold text-white">Anthropic Claude API</p>
                <p className="text-dark-muted text-[11px]">Resume tailoring & parsing</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                Configured
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg/60 border border-dark-border/60">
              <div>
                <p className="font-semibold text-white">Adzuna & JSearch API</p>
                <p className="text-dark-muted text-[11px]">Job discovery engines</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                Pending Key
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg/60 border border-dark-border/60">
              <div>
                <p className="font-semibold text-white">Hunter.io / Apollo</p>
                <p className="text-dark-muted text-[11px]">Contact enrichment</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                Pending Key
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
