import React, { useState } from 'react';
import { MasterProfile, JobPreferences } from '../../types/profile';
import { profileService } from '../../services/profile';
import { Target, DollarSign, MapPin, Building, ShieldAlert, Save, CheckCircle, Plus, X } from 'lucide-react';

interface Props {
  profile: MasterProfile;
  onUpdate: (updated: MasterProfile) => void;
}

export const JobPreferencesSection: React.FC<Props> = ({ profile, onUpdate }) => {
  const initialPrefs = profile.preferences || {
    target_roles: ['Senior Full Stack Engineer', 'Backend Lead'],
    seniority_levels: ['Senior', 'Lead'],
    job_types: ['Full-time'],
    work_modes: ['Remote', 'Hybrid'],
    preferred_locations: ['Remote', 'San Francisco, CA', 'New York, NY'],
    salary_floor: 140000,
    salary_currency: 'USD',
    included_industries: ['Software & Tech', 'AI/ML', 'Fintech'],
    excluded_industries: ['Staffing Agencies', 'Gambling'],
    company_sizes: ['11-50', '51-200', '201-500'],
    excluded_keywords: ['unpaid', 'contractor only', 'clearance required'],
  };

  const [prefs, setPrefs] = useState<JobPreferences>(initialPrefs);

  // Tag Inputs state
  const [newRoleTag, setNewRoleTag] = useState('');
  const [newLocationTag, setNewLocationTag] = useState('');
  const [newExcludedKeyword, setNewExcludedKeyword] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updatePreferences(prefs);
      const updatedProfile = await profileService.getProfile();
      onUpdate(updatedProfile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update job preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (key: keyof JobPreferences, value: string) => {
    const arr = (prefs[key] as string[]) || [];
    const exists = arr.includes(value);
    const updated = exists ? arr.filter((i) => i !== value) : [...arr, value];
    setPrefs({ ...prefs, [key]: updated });
    setSaved(false);
  };

  const addRoleTag = () => {
    if (!newRoleTag.trim()) return;
    if (!prefs.target_roles.includes(newRoleTag.trim())) {
      setPrefs({ ...prefs, target_roles: [...prefs.target_roles, newRoleTag.trim()] });
    }
    setNewRoleTag('');
  };

  const removeRoleTag = (role: string) => {
    setPrefs({ ...prefs, target_roles: prefs.target_roles.filter((r) => r !== role) });
  };

  const addLocationTag = () => {
    if (!newLocationTag.trim()) return;
    if (!prefs.preferred_locations.includes(newLocationTag.trim())) {
      setPrefs({ ...prefs, preferred_locations: [...prefs.preferred_locations, newLocationTag.trim()] });
    }
    setNewLocationTag('');
  };

  const removeLocationTag = (loc: string) => {
    setPrefs({ ...prefs, preferred_locations: prefs.preferred_locations.filter((l) => l !== loc) });
  };

  const addExcludedKeyword = () => {
    if (!newExcludedKeyword.trim()) return;
    if (!prefs.excluded_keywords.includes(newExcludedKeyword.trim())) {
      setPrefs({ ...prefs, excluded_keywords: [...prefs.excluded_keywords, newExcludedKeyword.trim()] });
    }
    setNewExcludedKeyword('');
  };

  const removeExcludedKeyword = (kw: string) => {
    setPrefs({ ...prefs, excluded_keywords: prefs.excluded_keywords.filter((k) => k !== kw) });
  };

  const seniorityOptions = ['Junior', 'Mid-Level', 'Senior', 'Staff / Principal', 'Lead', 'Manager / Director'];
  const workModeOptions = ['Remote', 'Hybrid', 'On-site'];
  const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Target Roles & Seniority */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-peach-400" />
            <span>Target Roles & Seniority</span>
          </h3>
          <span className="text-xs text-dark-muted">Used by Module 2 Job Discovery Engine</span>
        </div>

        {/* Target Roles Tags */}
        <div className="space-y-2 text-xs">
          <label className="block text-slate-300 font-semibold">Target Role Titles</label>
          <div className="flex flex-wrap gap-2 p-3 bg-dark-bg/80 border border-dark-border rounded-lg min-h-[46px] items-center">
            {prefs.target_roles.map((role) => (
              <span
                key={role}
                className="px-2.5 py-1 rounded bg-peach-500/15 border border-peach-500/30 text-peach-300 font-medium flex items-center space-x-1"
              >
                <span>{role}</span>
                <button type="button" onClick={() => removeRoleTag(role)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="flex items-center space-x-1 flex-1 min-w-[140px]">
              <input
                type="text"
                value={newRoleTag}
                onChange={(e) => setNewRoleTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRoleTag();
                  }
                }}
                placeholder="Type title & hit Enter..."
                className="bg-transparent border-none text-white text-xs placeholder-slate-500 focus:outline-none w-full"
              />
              <button
                type="button"
                onClick={addRoleTag}
                className="p-1 rounded bg-dark-hover text-slate-300 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Seniority Options */}
        <div className="space-y-2 text-xs">
          <label className="block text-slate-300 font-semibold">Seniority Levels</label>
          <div className="flex flex-wrap gap-2">
            {seniorityOptions.map((level) => {
              const selected = prefs.seniority_levels.includes(level);
              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => toggleArrayItem('seniority_levels', level)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    selected
                      ? 'bg-peach-500/20 border-peach-500 text-peach-300 shadow-glow-peach'
                      : 'bg-dark-bg/60 border-dark-border text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Locations, Work Modes & Compensation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Modes & Locations */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-dark-border/60">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Work Modes & Locations</h3>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold">Work Modes</label>
            <div className="flex gap-2">
              {workModeOptions.map((mode) => {
                const selected = prefs.work_modes.includes(mode);
                return (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => toggleArrayItem('work_modes', mode)}
                    className={`flex-1 py-2 rounded-lg border font-medium transition-all text-center ${
                      selected
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-glow-cyan'
                        : 'bg-dark-bg/60 border-dark-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold">Preferred Cities / Regions</label>
            <div className="flex flex-wrap gap-2 p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg min-h-[42px] items-center">
              {prefs.preferred_locations.map((loc) => (
                <span
                  key={loc}
                  className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium flex items-center space-x-1"
                >
                  <span>{loc}</span>
                  <button type="button" onClick={() => removeLocationTag(loc)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center space-x-1 flex-1 min-w-[120px]">
                <input
                  type="text"
                  value={newLocationTag}
                  onChange={(e) => setNewLocationTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLocationTag();
                    }
                  }}
                  placeholder="Add location..."
                  className="bg-transparent border-none text-white text-xs placeholder-slate-500 focus:outline-none w-full"
                />
                <button type="button" onClick={addLocationTag} className="p-1 rounded bg-dark-hover text-slate-300">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Floor & Company Size */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-dark-border/60">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Salary Floor & Company Size</h3>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold">Minimum Salary Floor (Annual USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">$</span>
              <input
                type="number"
                step="5000"
                value={prefs.salary_floor}
                onChange={(e) => setPrefs({ ...prefs, salary_floor: parseInt(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-dark-muted">Scraper will auto-discard postings listing compensation below this floor.</p>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold">Preferred Company Sizes</label>
            <div className="flex flex-wrap gap-1.5">
              {companySizeOptions.map((size) => {
                const selected = prefs.company_sizes.includes(size);
                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => toggleArrayItem('company_sizes', size)}
                    className={`px-2.5 py-1 rounded border font-mono text-[11px] transition-all ${
                      selected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-dark-bg/60 border-dark-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {size} emp
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Negative Keyword Filters */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-dark-border/60">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="font-bold text-white text-sm">Negative Keyword Filters (Auto-Exclude)</h3>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-dark-muted">Any job posting containing these terms will be automatically filtered out.</p>

          <div className="flex flex-wrap gap-2 p-3 bg-dark-bg/80 border border-dark-border rounded-lg min-h-[46px] items-center">
            {prefs.excluded_keywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-300 font-medium flex items-center space-x-1"
              >
                <span>{kw}</span>
                <button type="button" onClick={() => removeExcludedKeyword(kw)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="flex items-center space-x-1 flex-1 min-w-[160px]">
              <input
                type="text"
                value={newExcludedKeyword}
                onChange={(e) => setNewExcludedKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExcludedKeyword();
                  }
                }}
                placeholder="e.g. staffing agency, unpaid..."
                className="bg-transparent border-none text-white text-xs placeholder-slate-500 focus:outline-none w-full"
              />
              <button type="button" onClick={addExcludedKeyword} className="p-1 rounded bg-dark-hover text-slate-300">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-end space-x-3">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
            <CheckCircle className="w-4 h-4" /> Preferences Saved!
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Job Search Preferences'}</span>
        </button>
      </div>
    </form>
  );
};
