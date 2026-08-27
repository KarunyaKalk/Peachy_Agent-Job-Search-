import React, { useState } from 'react';
import { MasterProfile } from '../../types/profile';
import { profileService } from '../../services/profile';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Save, CheckCircle, FileText, Upload, Sparkles } from 'lucide-react';

interface Props {
  profile: MasterProfile;
  onUpdate: (updated: MasterProfile) => void;
  onOpenUploadModal?: () => void;
}

export const ContactSummarySection: React.FC<Props> = ({ profile, onUpdate, onOpenUploadModal }) => {
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    location: profile.location || '',
    linkedin_url: profile.linkedin_url || '',
    github_url: profile.github_url || '',
    portfolio_url: profile.portfolio_url || '',
    summary: profile.summary || '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile = await profileService.updateContactSummary(formData);
      onUpdate(updatedProfile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save contact/summary:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Resume Auto-Fill Prompt Banner */}
      {onOpenUploadModal && (
        <div className="glass-panel p-5 border border-peach-500/30 bg-gradient-to-r from-peach-500/10 via-dark-card to-dark-card rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-peach-500/5">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-peach-500/20 border border-peach-500/30 flex items-center justify-center text-peach-400 flex-shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Want to skip hand-typing your profile?</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-peach-500/20 text-peach-400 border border-peach-500/30">
                  AI Auto-Fill
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Upload your PDF or DOCX resume to automatically parse contact, summary, skills, experience, projects, & education.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-peach-500 to-peach-600 hover:from-peach-400 hover:to-peach-500 text-white font-semibold text-xs shadow-lg shadow-peach-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload Resume to Auto-Fill</span>
          </button>
        </div>
      )}

      {/* Contact Information */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-peach-400" />
            <span>Contact Information</span>
          </h3>
          <span className="text-xs text-dark-muted font-mono">Single Source of Truth</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-dark-muted" /> Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-dark-muted" /> Location / City
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA (Open to Remote)"
              className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-dark-muted" /> LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-dark-muted" /> GitHub Profile
            </label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => handleChange('github_url', e.target.value)}
              placeholder="https://github.com/yourhandle"
              className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-dark-muted" /> Portfolio / Website URL
            </label>
            <input
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => handleChange('portfolio_url', e.target.value)}
              placeholder="https://yourportfolio.dev"
              className="w-full p-2.5 bg-dark-bg/80 border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-peach-400" />
            <span>Master Professional Summary</span>
          </h3>
          <span className="text-[11px] text-dark-muted">Used by Claude AI for resume tailoring baseline</span>
        </div>

        <div>
          <textarea
            rows={5}
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="High-impact software engineering leader with 6+ years of experience architecting distributed backend services..."
            className="w-full p-3 bg-dark-bg/80 border border-dark-border rounded-lg text-xs text-white placeholder-slate-500 leading-relaxed focus:outline-none focus:border-peach-500 transition-all"
          />
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-end space-x-3">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
            <CheckCircle className="w-4 h-4" /> Saved Master Contact & Summary!
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Contact & Summary'}</span>
        </button>
      </div>
    </form>
  );
};
