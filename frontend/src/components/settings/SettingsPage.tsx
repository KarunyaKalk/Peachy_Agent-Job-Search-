import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { UserSettings } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { Settings as SettingsIcon, Sun, Moon, Save, Shield } from 'lucide-react';

import { mockSettings } from '../../api/mockData';

export const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(mockSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setSettings(data || mockSettings);
    } catch (e) {
      setSettings(mockSettings);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await apiService.updateSettings(settings);
      setSettings(updated);
      setMsg('Settings saved cleanly!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-2 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-peach-500" />
          <span>System Settings & Preferences</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure scan intervals, ATS thresholds, daily caps, active platform scrapers, and visual theme.
        </p>
      </div>

      {msg && <div className="p-3 bg-leaf-50 text-leaf-700 rounded-xl text-xs font-bold">{msg}</div>}

      {/* Theme Switcher Card */}
      <div className="peachy-card p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Appearance Theme</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current mode: {isDarkMode ? 'Warm Dark Espresso' : 'Soft Off-White Light'}
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-cream-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium text-xs inline-flex items-center space-x-2 shadow-sm"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-peach-500" />}
          <span>Toggle Theme</span>
        </button>
      </div>

      {/* Numerical Thresholds */}
      <div className="peachy-card p-6 space-y-4 text-xs">
        <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Scheduler & Daily Caps
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Scan Frequency (Hours)</label>
            <input
              type="number"
              value={settings.scan_frequency_hours}
              onChange={(e) => setSettings({ ...settings, scan_frequency_hours: parseInt(e.target.value) || 6 })}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Auto-Revise Target ATS Score (%)</label>
            <input
              type="number"
              value={settings.auto_revise_target_score}
              onChange={(e) => setSettings({ ...settings, auto_revise_target_score: parseInt(e.target.value) || 89 })}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Daily Application Cap</label>
            <input
              type="number"
              value={settings.daily_app_cap}
              onChange={(e) => setSettings({ ...settings, daily_app_cap: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Daily Cold Email Cap</label>
            <input
              type="number"
              value={settings.daily_email_cap}
              onChange={(e) => setSettings({ ...settings, daily_email_cap: parseInt(e.target.value) || 15 })}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-peach-500 hover:bg-peach-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};
