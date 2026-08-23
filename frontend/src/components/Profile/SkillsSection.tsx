import React, { useState } from 'react';
import { MasterProfile, Skill } from '../../types/profile';
import { profileService } from '../../services/profile';
import { Wrench, Plus, X, Tag } from 'lucide-react';

interface Props {
  profile: MasterProfile;
  onUpdate: (updated: MasterProfile) => void;
}

export const SkillsSection: React.FC<Props> = ({ profile, onUpdate }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Languages & Frameworks');

  const categories = [
    'Languages & Frameworks',
    'Cloud & Infrastructure',
    'Databases & Caching',
    'AI & Machine Learning',
    'Tools & Methodologies',
  ];

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await profileService.addSkill({
        name: newSkillName.trim(),
        category: selectedCategory,
      });
      setNewSkillName('');
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await profileService.deleteSkill(skillId);
      const updated = await profileService.getProfile();
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  // Group skills by category
  const skillsByCategory: { [cat: string]: Skill[] } = {};
  categories.forEach((cat) => (skillsByCategory[cat] = []));

  profile.skills.forEach((skill) => {
    const cat = categories.includes(skill.category) ? skill.category : 'Tools & Methodologies';
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(skill);
  });

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-peach-400" />
            <span>Categorized Skills Inventory</span>
          </h3>
          <p className="text-xs text-dark-muted">
            The ATS keyword engine matches these categorized skills against job posting requirements.
          </p>
        </div>
        <span className="text-xs text-peach-400 font-mono">{profile.skills.length} Total Skills</span>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddSkill} className="glass-panel p-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-56 p-2.5 bg-dark-bg border border-dark-border rounded-lg text-xs text-white focus:outline-none focus:border-peach-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="e.g. Python, React, PostgreSQL, Docker, PyTorch..."
          className="flex-1 w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-peach-500"
        />

        <button
          type="submit"
          disabled={!newSkillName.trim()}
          className="w-full sm:w-auto px-4 py-2.5 bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs rounded-lg shadow-glow-peach flex items-center justify-center space-x-1 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </form>

      {/* Categorized Skills Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const list = skillsByCategory[cat] || [];
          return (
            <div key={cat} className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-peach-400" />
                  <span>{cat}</span>
                </h4>
                <span className="text-[11px] font-mono text-dark-muted">{list.length}</span>
              </div>

              {list.length === 0 ? (
                <p className="text-xs text-dark-muted italic">No skills added in this category.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {list.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2.5 py-1 rounded-md bg-dark-bg border border-dark-border/80 text-xs font-medium text-slate-200 flex items-center space-x-1.5 group hover:border-peach-500/40 transition-all"
                    >
                      <span>{skill.name}</span>
                      <button
                        onClick={() => skill.id && handleDeleteSkill(skill.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
