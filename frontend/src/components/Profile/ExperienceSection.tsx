import React, { useState } from 'react';
import { MasterProfile, WorkExperience, ExperienceBullet } from '../../types/profile';
import { profileService } from '../../services/profile';
import { BulletVariantModal } from './BulletVariantModal';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Calendar,
  MapPin,
} from 'lucide-react';

interface Props {
  profile: MasterProfile;
  onUpdate: (updated: MasterProfile) => void;
}

export const ExperienceSection: React.FC<Props> = ({ profile, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // New Experience State
  const [newExp, setNewExp] = useState({
    company: '',
    role: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  // Selected bullet for managing variants
  const [activeBulletForVariants, setActiveBulletForVariants] = useState<ExperienceBullet | null>(null);

  // Bullet inline editing state
  const [newBulletText, setNewBulletText] = useState<{ [expId: number]: string }>({});

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.company || !newExp.role || !newExp.start_date) return;

    try {
      await profileService.addExperience(newExp);
      setNewExp({
        company: '',
        role: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
      });
      setShowAddForm(false);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to add experience:', err);
    }
  };

  const handleDeleteExperience = async (expId: number) => {
    if (!confirm('Are you sure you want to delete this work experience entry?')) return;
    try {
      await profileService.deleteExperience(expId);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to delete experience:', err);
    }
  };

  const handleAddBullet = async (expId: number) => {
    const text = newBulletText[expId];
    if (!text || !text.trim()) return;

    try {
      await profileService.addBullet(expId, { content: text.trim() });
      setNewBulletText((prev) => ({ ...prev, [expId]: '' }));
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to add bullet point:', err);
    }
  };

  const handleDeleteBullet = async (bulletId: number) => {
    try {
      await profileService.deleteBullet(bulletId);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to delete bullet:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-peach-400" />
            <span>Work Experience & Bullet Variants</span>
          </h3>
          <p className="text-xs text-dark-muted">
            Add your roles and individual bullet points. Click 'Manage Variants' on any bullet to add alternate phrasing.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Add New Experience Form */}
      {showAddForm && (
        <form onSubmit={handleAddExperience} className="glass-panel p-5 space-y-4 border-peach-500/30">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Position Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={newExp.company}
                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                placeholder="Linear / Anthropic / Acme Corp"
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Role Title *</label>
              <input
                type="text"
                required
                value={newExp.role}
                onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                placeholder="Senior Full Stack Engineer"
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location</label>
              <input
                type="text"
                value={newExp.location}
                onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                placeholder="San Francisco, CA or Remote"
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
              />
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-slate-300 font-semibold mb-1">Start Date *</label>
                <input
                  type="text"
                  required
                  value={newExp.start_date}
                  onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })}
                  placeholder="2022-03"
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-peach-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-slate-300 font-semibold mb-1">End Date</label>
                <input
                  type="text"
                  disabled={newExp.is_current}
                  value={newExp.end_date}
                  onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })}
                  placeholder="Present"
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white disabled:opacity-40 focus:outline-none focus:border-peach-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_current"
              checked={newExp.is_current}
              onChange={(e) => setNewExp({ ...newExp, is_current: e.target.checked })}
              className="rounded border-dark-border bg-dark-bg text-peach-500 focus:ring-peach-500"
            />
            <label htmlFor="is_current" className="text-xs text-slate-300 font-medium">
              I currently work here
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded bg-dark-hover text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach"
            >
              Save Experience
            </button>
          </div>
        </form>
      )}

      {/* List of Experiences */}
      {profile.experiences.length === 0 ? (
        <div className="glass-panel p-8 text-center text-xs text-dark-muted space-y-2">
          <p>No work experience entries added yet.</p>
          <p className="text-slate-400">Click "Add Position" above to input your past roles and bullet points.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profile.experiences.map((exp) => (
            <div key={exp.id} className="glass-panel p-6 space-y-4">
              {/* Role Header */}
              <div className="flex items-start justify-between pb-3 border-b border-dark-border/60">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{exp.role}</span>
                    <span className="text-slate-400 font-normal">at</span>
                    <span className="text-peach-400">{exp.company}</span>
                  </h4>
                  <div className="flex items-center space-x-3 text-xs text-dark-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {exp.location}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => exp.id && handleDeleteExperience(exp.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bullet Points List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">
                    Experience Bullet Points ({exp.bullets?.length || 0})
                  </span>
                  <span className="text-[11px] text-dark-muted">Click 'Variants' on any bullet to add alternate phrasing</span>
                </div>

                <div className="space-y-2">
                  {exp.bullets?.map((bullet) => (
                    <div
                      key={bullet.id}
                      className="p-3 rounded-lg bg-dark-bg/60 border border-dark-border/60 hover:border-dark-border flex items-start justify-between space-x-3 text-xs group"
                    >
                      <div className="flex items-start space-x-2 min-w-0 flex-1">
                        <span className="text-peach-500 font-bold text-sm shrink-0 leading-none mt-0.5">•</span>
                        <div className="space-y-1">
                          <p className="text-slate-200 leading-relaxed">{bullet.content}</p>
                          {bullet.variants && bullet.variants.length > 0 && (
                            <div className="flex items-center space-x-1 text-[11px] text-peach-400">
                              <Layers className="w-3 h-3" />
                              <span>{bullet.variants.length} alternate phrasing variant(s) available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setActiveBulletForVariants(bullet)}
                          className="px-2.5 py-1 rounded bg-peach-500/10 hover:bg-peach-500/20 text-peach-400 border border-peach-500/20 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Variants ({bullet.variants?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => bullet.id && handleDeleteBullet(bullet.id)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Add Bullet Input */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={newBulletText[exp.id || 0] || ''}
                    onChange={(e) => setNewBulletText({ ...newBulletText, [exp.id || 0]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        exp.id && handleAddBullet(exp.id);
                      }
                    }}
                    placeholder="Add bullet point (e.g. Reduced API latency by 40% using Redis caching)..."
                    className="flex-1 p-2 bg-dark-bg/80 border border-dark-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-peach-500"
                  />
                  <button
                    onClick={() => exp.id && handleAddBullet(exp.id)}
                    className="px-3 py-2 bg-dark-hover hover:bg-peach-500 hover:text-white text-slate-300 font-semibold text-xs rounded-lg transition-all"
                  >
                    Add Bullet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bullet Variant Modal */}
      {activeBulletForVariants && (
        <BulletVariantModal
          bullet={activeBulletForVariants}
          onClose={() => setActiveBulletForVariants(null)}
          onUpdate={async () => {
            const updated = await profileService.getProfile();
            onUpdate(updated);
            // Refresh active bullet variants in modal state
            const refreshedExp = updated.experiences.find((e) =>
              e.bullets?.some((b) => b.id === activeBulletForVariants.id)
            );
            const refreshedBullet = refreshedExp?.bullets?.find((b) => b.id === activeBulletForVariants.id);
            if (refreshedBullet) setActiveBulletForVariants(refreshedBullet);
          }}
        />
      )}
    </div>
  );
};
