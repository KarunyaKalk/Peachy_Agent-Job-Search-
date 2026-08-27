import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { SystemSettings } from '../types/settings';
import { settingsService } from '../services/settings';
import { AuditFeed } from '../components/Audit/AuditFeed';
import {
  Sliders,
  ShieldCheck,
  Bell,
  Globe,
  Save,
  Check,
  AlertTriangle,
  Send,
  Zap,
  Key,
  ToggleLeft,
  ToggleRight,
  Clock,
} from 'lucide-react';
import { usePeachyEvents } from '../context/PeachyEventContext';

export const SettingsPage: React.FC = () => {
  const { emitNotification } = usePeachyEvents();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active sub-tab: 'parameters' | 'platforms' | 'alerts' | 'audit'
  const [activeTab, setActiveTab] = useState<'parameters' | 'platforms' | 'alerts' | 'audit'>('parameters');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      emitNotification({
        type: 'ats_score',
        title: 'Settings Saved Successfully',
        message: 'Updated system parameters and platform integration controls.',
        link: '/settings',
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePlatform = (platformKey: 'adzuna_enabled' | 'wellfound_enabled' | 'haveloc_enabled' | 'linkedin_enabled') => {
    if (!settings) return;
    setSettings({
      ...settings,
      [platformKey]: !settings[platformKey],
    });
  };

  return (
    <div className="space-y-6">
      <Header
        title="Central Settings & System Controls"
        subtitle="Manage job scan frequencies, ATS score thresholds, daily send caps, platform active toggles, CAPTCHA webhook alerts, and audit trail."
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-dark-border/60 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('parameters')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'parameters'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>System Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'platforms'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Platform Toggles</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'alerts'
              ? 'bg-amber-500 text-white shadow-glow-amber'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>CAPTCHA & Webhook Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'audit'
              ? 'bg-cyan-500 text-white shadow-glow-cyan'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {loading || !settings ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-dark-muted">Loading system settings configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: SYSTEM PARAMETERS */}
          {activeTab === 'parameters' && (
            <div className="glass-panel p-6 space-y-6 border-dark-border">
              <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">System Parameters & Operating Caps</h3>
                  <p className="text-xs text-dark-muted">
                    Configure scan intervals, ATS score filters, and maximum daily execution limits.
                  </p>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-glow-purple flex items-center space-x-2 disabled:opacity-50"
                >
                  {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save System Parameters'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Scan Frequency */}
                <div className="space-y-2 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      Recurring Job Scan Frequency
                    </label>
                    <span className="font-mono text-xs font-bold text-purple-300">
                      Every {settings.scan_frequency_hours} Hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={settings.scan_frequency_hours}
                    onChange={(e) => setSettings({ ...settings, scan_frequency_hours: parseInt(e.target.value) || 6 })}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Controls how frequently APScheduler / Celery background workers run multi-source job scans across active platforms.
                  </p>
                </div>

                {/* ATS Score Threshold */}
                <div className="space-y-2 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Minimum ATS Match Score Threshold
                    </label>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {settings.ats_score_threshold}% Match
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    value={settings.ats_score_threshold}
                    onChange={(e) => setSettings({ ...settings, ats_score_threshold: parseInt(e.target.value) || 80 })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Jobs scoring below this threshold are flagged or moved to discarded view mode automatically.
                  </p>
                </div>

                {/* Daily Application Cap */}
                <div className="space-y-2 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      Daily Application Submission Cap
                    </label>
                    <span className="font-mono text-xs font-bold text-emerald-300">
                      {settings.daily_application_cap} Applications / Day
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={settings.daily_application_cap}
                    onChange={(e) => setSettings({ ...settings, daily_application_cap: parseInt(e.target.value) || 20 })}
                    className="w-full p-2.5 bg-dark-card border border-dark-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Hard safety limit on maximum applications pre-filled per 24-hour cycle.
                  </p>
                </div>

                {/* Daily Cold Email Cap */}
                <div className="space-y-2 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-cyan-400" />
                      Daily Cold Email Send Cap
                    </label>
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      {settings.daily_cold_email_cap} Cold Emails / Day
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={settings.daily_cold_email_cap}
                    onChange={(e) => setSettings({ ...settings, daily_cold_email_cap: parseInt(e.target.value) || 15 })}
                    className="w-full p-2.5 bg-dark-card border border-dark-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Protects your email domain reputation by strictly enforcing a daily send quota (CAN-SPAM compliant).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLATFORM TOGGLES */}
          {activeTab === 'platforms' && (
            <div className="glass-panel p-6 space-y-6 border-dark-border">
              <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Multi-Source Platform Integration Controls</h3>
                  <p className="text-xs text-dark-muted">
                    Enable or disable specific job boards and scraping platforms during automated scan cycles.
                  </p>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-glow-purple flex items-center space-x-2 disabled:opacity-50"
                >
                  {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Platform Toggles'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Adzuna */}
                <div className="p-4 bg-dark-bg/60 border border-dark-border/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm block">Adzuna Job Aggregator API</span>
                    <span className="text-dark-muted text-[11px]">Structured REST API source with salary data</span>
                  </div>

                  <button
                    onClick={() => handleTogglePlatform('adzuna_enabled')}
                    className={`p-2 rounded-xl transition-all ${
                      settings.adzuna_enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'
                    }`}
                  >
                    {settings.adzuna_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                {/* Wellfound */}
                <div className="p-4 bg-dark-bg/60 border border-dark-border/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm block">Wellfound (AngelList) Scraper</span>
                    <span className="text-dark-muted text-[11px]">Playwright scraper with anti-detection headers</span>
                  </div>

                  <button
                    onClick={() => handleTogglePlatform('wellfound_enabled')}
                    className={`p-2 rounded-xl transition-all ${
                      settings.wellfound_enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'
                    }`}
                  >
                    {settings.wellfound_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                {/* Haveloc */}
                <div className="p-4 bg-dark-bg/60 border border-dark-border/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm block">Haveloc Career Portal</span>
                    <span className="text-dark-muted text-[11px]">Authenticated Playwright portal scraper</span>
                  </div>

                  <button
                    onClick={() => handleTogglePlatform('haveloc_enabled')}
                    className={`p-2 rounded-xl transition-all ${
                      settings.haveloc_enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'
                    }`}
                  >
                    {settings.haveloc_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                {/* LinkedIn */}
                <div className="p-4 bg-dark-bg/60 border border-dark-border/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm block">LinkedIn Single URL Assist</span>
                    <span className="text-dark-muted text-[11px]">Compliant manual paste importer (Zero ban risk)</span>
                  </div>

                  <button
                    onClick={() => handleTogglePlatform('linkedin_enabled')}
                    className={`p-2 rounded-xl transition-all ${
                      settings.linkedin_enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'
                    }`}
                  >
                    {settings.linkedin_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAPTCHA & WEBHOOK ALERTS */}
          {activeTab === 'alerts' && (
            <div className="glass-panel p-6 space-y-6 border-dark-border">
              <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">CAPTCHA & Bot Detection Alert Webhooks</h3>
                  <p className="text-xs text-dark-muted">
                    Configure webhooks to receive instant Telegram or Email notifications when a Playwright scraper hits a CAPTCHA or bot wall.
                  </p>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-glow-purple flex items-center space-x-2 disabled:opacity-50"
                >
                  {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Alert Webhooks'}</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Telegram Webhook */}
                <div className="space-y-2 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
                  <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    Telegram Bot Notification Webhook URL
                  </label>
                  <input
                    type="text"
                    value={settings.telegram_webhook_url || ''}
                    onChange={(e) => setSettings({ ...settings, telegram_webhook_url: e.target.value })}
                    placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>"
                    className="w-full p-3 bg-dark-card border border-dark-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Sends instant Telegram alert messages whenever bot detection pauses a scraper run.
                  </p>
                </div>

                {/* Email Webhook */}
                <div className="space-y-2 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
                  <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    Email Notification Webhook URL
                  </label>
                  <input
                    type="text"
                    value={settings.email_webhook_url || ''}
                    onChange={(e) => setSettings({ ...settings, email_webhook_url: e.target.value })}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    className="w-full p-3 bg-dark-card border border-dark-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Sends webhook POST payloads for email forwarding services on critical alerts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOG TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Comprehensive System Activity Audit Trail</span>
                </h3>
              </div>

              <AuditFeed limit={100} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
