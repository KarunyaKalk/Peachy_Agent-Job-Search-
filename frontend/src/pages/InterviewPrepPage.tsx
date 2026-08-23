import React from 'react';
import { Header } from '../components/Layout/Header';
import { GraduationCap, Sparkles } from 'lucide-react';

export const InterviewPrepPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Header
        title="Interview Prep Assistant"
        subtitle="Role-specific question predictions, STAR story alignment, and company background packs."
      />

      <div className="glass-panel p-8 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Interview Prep Assistant</h2>
        <p className="text-sm text-dark-muted leading-relaxed">
          Generate custom prep packs for active interview roles, review technical & behavioral question lists, and interactive pre-interview checklists.
        </p>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scheduled for Day 12 Scope</span>
        </div>
      </div>
    </div>
  );
};
