import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { MasterProfile, JobPreference } from '../../types';
import { useEventBus } from '../../context/EventBusContext';
import {
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Sliders,
  Plus,
  Trash2,
  Check,
  Edit3,
  Sparkles,
  Save,
  AlertCircle
} from 'lucide-react';

export const MasterProfilePage: React.FC = () => {
  const { emitEvent } = useEventBus();
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [preferences, setPreferences] = useState<JobPreference | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Auto-Fill Modal Review State
  const [showAutoFillModal, setShowAutoFillModal] = useState<boolean>(false);
  const [autoFillData, setAutoFillData] = useState<{ extracted: any; current: any } | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await apiService.getProfile();
      const pref = await apiService.getPreferences();
      setProfile(p);
      setPreferences(pref);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await apiService.updateProfile(profile);
      setProfile(updated);
      setMessage('Master Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      emitEvent({
        title: 'Master Profile Updated',
        message: 'Your truthful resume content and skills fingerprint have been saved.',
        actionLabel: 'Discovered Jobs',
        page: 'jobs'
      });
    } catch (e) {
      setMessage('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const updated = await apiService.updatePreferences(preferences);
      setPreferences(updated);
      setMessage('Search Preferences saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const res = await apiService.uploadResumeAutoFill(file);
      setAutoFillData(res);
      setShowAutoFillModal(true);
    } catch (e) {
      alert('Failed to parse uploaded resume.');
    } finally {
      setUploading(false);
    }
  };

  const applyAutoFillSection = (section: string) => {
    if (!autoFillData || !profile) return;
    const extracted = autoFillData.extracted;

    if (section === 'contact') {
      setProfile({
        ...profile,
        full_name: extracted.full_name || profile.full_name,
        email: extracted.email || profile.email,
        phone: extracted.phone || profile.phone,
        location: extracted.location || profile.location,
        summary: extracted.summary || profile.summary,
      });
    } else if (section === 'skills') {
      setProfile({ ...profile, skills_json: extracted.skills_json || profile.skills_json });
    } else if (section === 'experience') {
      setProfile({ ...profile, experience_json: extracted.experience_json || profile.experience_json });
    } else if (section === 'all') {
      setProfile({
        ...profile,
        full_name: extracted.full_name || profile.full_name,
        email: extracted.email || profile.email,
        phone: extracted.phone || profile.phone,
        location: extracted.location || profile.location,
        summary: extracted.summary || profile.summary,
        skills_json: extracted.skills_json || profile.skills_json,
        experience_json: extracted.experience_json || profile.experience_json,
        projects_json: extracted.projects_json || profile.projects_json,
        education_json: extracted.education_json || profile.education_json,
        certifications_json: extracted.certifications_json || profile.certifications_json,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peach-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>My Master Profile & Preferences</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store truthful achievements, bullet variants, and search preferences for AI tailoring.
          </p>
        </div>

        {/* PROMINENT "UPLOAD RESUME TO AUTO-FILL" BUTTON */}
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-peach-500 hover:bg-peach-600 text-white font-medium text-sm rounded-xl transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Parsing Resume...' : 'Upload Resume to Auto-Fill'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Success Notification */}
      {message && (
        <div className="bg-leaf-50 dark:bg-leaf-900/30 border border-leaf-400 text-leaf-700 dark:text-leaf-300 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-cream-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 font-display text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'profile'
              ? 'border-peach-500 text-peach-600 dark:text-peach-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Master Resume Content</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-5 py-3 font-display text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'preferences'
              ? 'border-peach-500 text-peach-600 dark:text-peach-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Job Search Preferences</span>
        </button>
      </div>

      {/* TAB 1: MASTER RESUME CONTENT */}
      {activeTab === 'profile' && profile && (
        <div className="space-y-6">
          {/* Contact & Summary Section */}
          <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <User className="w-5 h-5 text-peach-500" />
              <span>Contact & Summary</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Categorized Skills Section */}
          <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Code className="w-5 h-5 text-peach-500" />
              <span>Categorized Technical Skills</span>
            </h2>

            {Object.entries(profile.skills_json || {}).map(([cat, skills], idx) => (
              <div key={idx} className="bg-cream-50 dark:bg-slate-900/60 p-4 rounded-xl border border-cream-200 dark:border-slate-800">
                <p className="font-semibold text-sm text-peach-600 dark:text-peach-400 mb-2">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, sIdx) => (
                    <span key={sIdx} className="peachy-pill bg-peach-100 dark:bg-peach-900/40 text-peach-700 dark:text-peach-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Work Experience Section with Bullet Point Variants */}
          <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-peach-500" />
              <span>Work Experience (Multiple Editable Bullet Variants per Role)</span>
            </h2>

            {(profile.experience_json || []).map((exp, expIdx) => (
              <div key={expIdx} className="bg-cream-50 dark:bg-slate-900/60 p-4 rounded-xl border border-cream-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{exp.role}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exp.company} • {exp.dates} • {exp.location}</p>
                  </div>
                </div>

                {/* Primary Bullets */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Primary Achievements:</p>
                  {exp.bullets.map((b, bIdx) => (
                    <input
                      key={bIdx}
                      type="text"
                      value={b}
                      onChange={(e) => {
                        const copy = [...profile.experience_json];
                        copy[expIdx].bullets[bIdx] = e.target.value;
                        setProfile({ ...profile, experience_json: copy });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-cream-200 dark:border-slate-700 text-xs"
                    />
                  ))}
                </div>

                {/* Bullet Variants */}
                {exp.variants && Object.keys(exp.variants).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cream-200 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-semibold text-peach-600 dark:text-peach-400">Tailoring Variants (Leadership/Performance):</p>
                    {Object.entries(exp.variants).map(([vKey, vBullets], vIdx) => (
                      <div key={vIdx} className="pl-3 border-l-2 border-peach-400">
                        <span className="text-[11px] font-mono font-bold uppercase text-slate-500">{vKey}:</span>
                        {vBullets.map((vB, vBIdx) => (
                          <p key={vBIdx} className="text-xs text-slate-600 dark:text-slate-300 italic">{vB}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-peach-500 hover:bg-peach-600 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Master Profile'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: JOB SEARCH PREFERENCES */}
      {activeTab === 'preferences' && preferences && (
        <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-6">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-peach-500" />
            <span>Search & Discovery Parameters</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Roles</label>
              <input
                type="text"
                value={preferences.target_roles.join(', ')}
                onChange={(e) => setPreferences({ ...preferences, target_roles: e.target.value.split(',').map((s) => s.trim()) })}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Minimum Salary Floor ($/yr)</label>
              <input
                type="number"
                value={preferences.salary_floor}
                onChange={(e) => setPreferences({ ...preferences, salary_floor: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Exclude Keywords (Auto-Hide)</label>
            <input
              type="text"
              value={preferences.exclude_keywords.join(', ')}
              onChange={(e) => setPreferences({ ...preferences, exclude_keywords: e.target.value.split(',').map((s) => s.trim()) })}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-peach-500 hover:bg-peach-600 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Search Preferences'}</span>
            </button>
          </div>
        </div>
      )}

      {/* RESUME AUTO-FILL REVIEW & MERGE MODAL */}
      {showAutoFillModal && autoFillData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-espresso-800 rounded-2xl border border-cream-200 dark:border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-200 dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-2 font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                <Sparkles className="w-5 h-5 text-peach-500" />
                <span>Resume Auto-Fill Review & Merge</span>
              </div>
              <button onClick={() => setShowAutoFillModal(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Review extracted information parsed via Gemini API. Accept or skip individual sections to merge into your Master Profile.
            </p>

            {/* Side-by-side diff comparison */}
            <div className="space-y-4 text-xs">
              {/* Contact Review */}
              <div className="p-4 bg-cream-50 dark:bg-slate-900 rounded-xl border border-cream-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-peach-600 dark:text-peach-400">Extracted Contact:</span>
                  <p>{autoFillData.extracted.full_name} • {autoFillData.extracted.email} • {autoFillData.extracted.phone}</p>
                </div>
                <button
                  onClick={() => applyAutoFillSection('contact')}
                  className="px-3 py-1.5 bg-peach-500 text-white rounded-lg text-xs font-semibold hover:bg-peach-600"
                >
                  Accept Contact
                </button>
              </div>

              {/* Skills Review */}
              <div className="p-4 bg-cream-50 dark:bg-slate-900 rounded-xl border border-cream-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-peach-600 dark:text-peach-400">Extracted Technical Skills:</span>
                  <p className="truncate max-w-md">{JSON.stringify(autoFillData.extracted.skills_json)}</p>
                </div>
                <button
                  onClick={() => applyAutoFillSection('skills')}
                  className="px-3 py-1.5 bg-peach-500 text-white rounded-lg text-xs font-semibold hover:bg-peach-600"
                >
                  Accept Skills
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-cream-200 dark:border-slate-700">
              <button
                onClick={() => setShowAutoFillModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
              >
                Skip / Close
              </button>

              <button
                onClick={() => {
                  applyAutoFillSection('all');
                  setShowAutoFillModal(false);
                }}
                className="px-5 py-2 bg-peach-500 hover:bg-peach-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Merge All Extracted Fields
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
