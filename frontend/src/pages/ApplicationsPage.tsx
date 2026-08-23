import React from 'react';
import { Header } from '../components/Layout/Header';
import { Briefcase, Sparkles } from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Header
        title="Application Review Queue & Tracker"
        subtitle="Review tailored resumes, verify pre-filled forms, and manage application Kanban states."
      />

      <div className="glass-panel p-8 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Application Review & Automation</h2>
        <p className="text-sm text-dark-muted leading-relaxed">
          Here you will approve or reject generated resumes, trigger Playwright form auto-filling (with human-in-the-loop pause before submit), and track applied roles in Kanban format.
        </p>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scheduled for Days 8–9 Scope</span>
        </div>
      </div>
    </div>
  );
};
