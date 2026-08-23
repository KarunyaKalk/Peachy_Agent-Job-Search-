import React, { useState } from 'react';
import { ExperienceBullet, BulletVariant } from '../../types/profile';
import { profileService } from '../../services/profile';
import { X, Plus, Trash2, Tag, Layers, Sparkles } from 'lucide-react';

interface Props {
  bullet: ExperienceBullet;
  onClose: () => void;
  onUpdate: () => void;
}

export const BulletVariantModal: React.FC<Props> = ({ bullet, onClose, onUpdate }) => {
  const [variantText, setVariantText] = useState('');
  const [variantTag, setVariantTag] = useState('Backend Focus');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedTags = [
    'Backend Focus',
    'Frontend Emphasis',
    'Leadership & Mentorship',
    'Scale & Performance',
    'AI/ML Integration',
    'Cost Optimization',
  ];

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantText.trim() || !bullet.id) return;

    setIsSubmitting(true);
    try {
      await profileService.addBulletVariant(bullet.id, {
        variant_text: variantText.trim(),
        tag: variantTag,
      });
      setVariantText('');
      onUpdate();
    } catch (err) {
      console.error('Failed to add bullet variant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await profileService.deleteBulletVariant(variantId);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete bullet variant:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-peach-400" />
            <h3 className="font-bold text-white text-base">Bullet Point Phrasing Variants</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Bullet Reference */}
        <div className="p-3.5 bg-dark-bg/80 border border-dark-border rounded-lg space-y-1 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-peach-400 font-mono">
            Default Master Bullet
          </span>
          <p className="text-slate-200 leading-relaxed font-medium">"{bullet.content}"</p>
        </div>

        {/* Existing Variants List */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center justify-between">
            <span>Alternate Variants ({bullet.variants?.length || 0})</span>
            <span className="text-[11px] text-peach-400">Tailoring engine chooses optimal match</span>
          </h4>

          {(!bullet.variants || bullet.variants.length === 0) ? (
            <div className="p-4 border border-dashed border-dark-border rounded-lg text-center text-xs text-dark-muted">
              No alternate variants created yet. Add phrasing variants to highlight specific skills (e.g. Leadership, Systems Architecture).
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {bullet.variants.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-lg bg-dark-bg/60 border border-dark-border/60 flex items-start justify-between space-x-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-peach-500/10 text-peach-400 border border-peach-500/20 text-[10px] font-mono">
                      {v.tag || 'Variant'}
                    </span>
                    <p className="text-slate-300 leading-relaxed">{v.variant_text}</p>
                  </div>

                  <button
                    onClick={() => v.id && handleDeleteVariant(v.id)}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete variant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Variant Form */}
        <form onSubmit={handleAddVariant} className="space-y-3 pt-3 border-t border-dark-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Add New Phrasing Variant</span>
            <div className="flex items-center space-x-1 text-peach-400 font-mono text-[10px]">
              <Sparkles className="w-3 h-3" />
              <span>Fact-Guard Safe</span>
            </div>
          </div>

          <textarea
            required
            rows={3}
            value={variantText}
            onChange={(e) => setVariantText(e.target.value)}
            placeholder="e.g. Spearheaded microservices migration reducing p99 latency by 35% across 12 core API services..."
            className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-peach-500 transition-all"
          />

          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <select
                value={variantTag}
                onChange={(e) => setVariantTag(e.target.value)}
                className="w-full p-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-slate-200 focus:outline-none focus:border-peach-500"
              >
                {predefinedTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !variantText.trim()}
              className="px-4 py-2 bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs rounded-lg shadow-glow-peach flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
