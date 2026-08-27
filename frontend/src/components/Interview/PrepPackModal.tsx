import React, { useState } from 'react';
import { InterviewPrepPack, TechnicalPrepItem, BehavioralPrepItem } from '../../types/interview_prep';
import { interviewPrepService } from '../../services/interview_prep';
import {
  Sparkles,
  CheckSquare,
  Square,
  X,
  Building,
  Wrench,
  HelpCircle,
  MessageSquare,
  FileText,
  Save,
  CheckCircle2,
  BookOpen,
  Award,
} from 'lucide-react';
import { usePeachyEvents } from '../../context/PeachyEventContext';

interface Props {
  prepPack: InterviewPrepPack;
  onClose: () => void;
  onUpdate?: () => void;
}

export const PrepPackModal: React.FC<Props> = ({ prepPack: initialPack, onClose, onUpdate }) => {
  const { emitNotification } = usePeachyEvents();
  const [pack, setPack] = useState<InterviewPrepPack>(initialPack);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  // Active section tab: 'all' | 'technical' | 'behavioral'
  const [filter, setFilter] = useState<'all' | 'technical' | 'behavioral'>('all');

  const totalTech = pack.technical_questions.length;
  const completedTech = pack.technical_questions.filter((q) => q.is_completed).length;

  const totalBeh = pack.behavioral_questions.length;
  const completedBeh = pack.behavioral_questions.filter((q) => q.is_completed).length;

  const totalItems = totalTech + totalBeh;
  const completedItems = completedTech + completedBeh;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleToggleItem = async (itemId: string, itemType: 'technical' | 'behavioral', currentStatus: boolean) => {
    try {
      const updated = await interviewPrepService.updatePrepItem(pack.id, {
        item_id: itemId,
        item_type: itemType,
        is_completed: !currentStatus,
      });
      setPack(updated);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update prep item completion:', err);
    }
  };

  const handleSaveNotes = async (itemId: string, itemType: 'technical' | 'behavioral', notes: string) => {
    setSavingItemId(itemId);
    try {
      const updated = await interviewPrepService.updatePrepItem(pack.id, {
        item_id: itemId,
        item_type: itemType,
        notes,
      });
      setPack(updated);
      if (onUpdate) onUpdate();
      emitNotification({
        type: 'ats_score',
        title: 'Notes Saved',
        message: `Updated prep note for ${pack.company_name} interview pack.`,
        link: '/interview-prep',
      });
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-6 border-b border-dark-border/60 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Interview Prep Pack: {pack.role_title} @ {pack.company_name}
              </h3>
            </div>
            <p className="text-xs text-dark-muted">
              Company-specific questions, STAR-formatted answers from master accomplishments, and prep checklist.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completion Progress Banner */}
        <div className="p-4 bg-dark-bg/60 border-b border-dark-border/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4 flex-1">
            <div className="space-y-0.5">
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
                Prep Checklist Progress
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {completedItems} / {totalItems} Completed
                </span>
                <span className="text-xs font-bold font-mono text-slate-400">({completionPercentage}%)</span>
              </div>
            </div>

            <div className="flex-1 max-w-xs h-2.5 bg-dark-bg border border-dark-border rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-glow-emerald"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Filter Sub-Tabs */}
          <div className="flex items-center space-x-1.5 bg-dark-card p-1 rounded-xl border border-dark-border text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Items ({totalItems})
            </button>
            <button
              onClick={() => setFilter('technical')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'technical' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Technical ({totalTech})
            </button>
            <button
              onClick={() => setFilter('behavioral')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'behavioral' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Behavioral ({totalBeh})
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Company Overview & Skills to Emphasize */}
          {pack.company_overview && (
            <div className="glass-panel p-5 space-y-3 border-dark-border">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Company Context & Strategic Focus
                </h4>
              </div>
              <p className="text-xs text-white leading-relaxed bg-dark-bg/60 p-3.5 rounded-xl border border-dark-border/60">
                {pack.company_overview}
              </p>

              {pack.key_skills_to_highlight.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-dark-muted uppercase tracking-wider block">
                    Key Technical Competencies to Emphasize:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pack.key_skills_to_highlight.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Technical Questions Section */}
          {(filter === 'all' || filter === 'technical') && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-dark-border/60 pb-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Technical Questions ({completedTech}/{totalTech})
                </h4>
              </div>

              <div className="space-y-4">
                {pack.technical_questions.map((item) => (
                  <TechnicalItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleItem(item.id, 'technical', item.is_completed)}
                    onSaveNotes={(notes) => handleSaveNotes(item.id, 'technical', notes)}
                    isSaving={savingItemId === item.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Behavioral Questions Section (STAR Answers) */}
          {(filter === 'all' || filter === 'behavioral') && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-dark-border/60 pb-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Behavioral Questions & STAR Answers ({completedBeh}/{totalBeh})
                </h4>
              </div>

              <div className="space-y-4">
                {pack.behavioral_questions.map((item) => (
                  <BehavioralItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleItem(item.id, 'behavioral', item.is_completed)}
                    onSaveNotes={(notes) => handleSaveNotes(item.id, 'behavioral', notes)}
                    isSaving={savingItemId === item.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-dark-border/60 bg-dark-bg/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-dark-muted font-mono">
            Prep Pack Version for {pack.company_name}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-glow-emerald"
          >
            Done Preparing
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for Technical Item Card
const TechnicalItemCard: React.FC<{
  item: TechnicalPrepItem;
  onToggle: () => void;
  onSaveNotes: (notes: string) => void;
  isSaving: boolean;
}> = ({ item, onToggle, onSaveNotes, isSaving }) => {
  const [notes, setNotes] = useState(item.notes || '');

  return (
    <div
      className={`glass-panel p-5 space-y-3 transition-all border ${
        item.is_completed
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : 'border-dark-border hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <button onClick={onToggle} className="mt-0.5 text-emerald-400 hover:scale-110 transition-transform">
            {item.is_completed ? (
              <CheckSquare className="w-5 h-5 fill-emerald-500/20" />
            ) : (
              <Square className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <div className="space-y-1">
            <h5 className={`text-sm font-bold text-white ${item.is_completed ? 'line-through opacity-70' : ''}`}>
              {item.question}
            </h5>
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded text-[10px] font-mono font-bold">
              {item.topic}
            </span>
          </div>
        </div>
      </div>

      <div className="pl-8 space-y-2 text-xs">
        <div className="p-3 bg-dark-bg/80 border border-dark-border/60 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Expected Technical Response Key Points:
          </span>
          <p className="text-slate-200 leading-relaxed font-sans">{item.expected_answer}</p>
        </div>

        {/* Personal Notes Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Personal Notes:
            </span>
            <button
              onClick={() => onSaveNotes(notes)}
              disabled={isSaving}
              className="text-[11px] text-peach-400 hover:text-peach-300 font-semibold flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add personal talking points or code snippets to remember..."
            className="w-full p-2.5 bg-dark-card border border-dark-border rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

// Component for Behavioral Item Card (STAR Format)
const BehavioralItemCard: React.FC<{
  item: BehavioralPrepItem;
  onToggle: () => void;
  onSaveNotes: (notes: string) => void;
  isSaving: boolean;
}> = ({ item, onToggle, onSaveNotes, isSaving }) => {
  const [notes, setNotes] = useState(item.notes || '');

  return (
    <div
      className={`glass-panel p-5 space-y-3 transition-all border ${
        item.is_completed
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : 'border-dark-border hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <button onClick={onToggle} className="mt-0.5 text-emerald-400 hover:scale-110 transition-transform">
            {item.is_completed ? (
              <CheckSquare className="w-5 h-5 fill-emerald-500/20" />
            ) : (
              <Square className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <div className="space-y-1">
            <h5 className={`text-sm font-bold text-white ${item.is_completed ? 'line-through opacity-70' : ''}`}>
              {item.question}
            </h5>
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded text-[10px] font-mono font-bold">
              Competency: {item.competency}
            </span>
          </div>
        </div>
      </div>

      <div className="pl-8 space-y-3 text-xs">
        {/* STAR Answer Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-dark-bg/80 border border-dark-border/60 p-3.5 rounded-xl">
          <div className="p-2.5 rounded-lg bg-dark-card border border-dark-border space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              S — Situation
            </span>
            <p className="text-slate-200 leading-relaxed text-[11px]">{item.star_answer.situation}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-dark-card border border-dark-border space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              T — Task
            </span>
            <p className="text-slate-200 leading-relaxed text-[11px]">{item.star_answer.task}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-dark-card border border-dark-border space-y-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              A — Action Taken
            </span>
            <p className="text-slate-200 leading-relaxed text-[11px]">{item.star_answer.action}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-dark-card border border-dark-border space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              R — Quantifiable Result
            </span>
            <p className="text-slate-200 leading-relaxed text-[11px]">{item.star_answer.result}</p>
          </div>
        </div>

        {/* Personal Notes Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Personal Notes:
            </span>
            <button
              onClick={() => onSaveNotes(notes)}
              disabled={isSaving}
              className="text-[11px] text-peach-400 hover:text-peach-300 font-semibold flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add specific metrics or bullet points from your master profile to mention..."
            className="w-full p-2.5 bg-dark-card border border-dark-border rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
