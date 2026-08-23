import React from 'react';
import { Header } from '../components/Layout/Header';
import { Mail, Sparkles } from 'lucide-react';

export const ColdEmailPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Header
        title="Cold Email Outreach"
        subtitle="Hiring contact enrichment via Hunter/Apollo, personalized email generation, and delivery tracking."
      />

      <div className="glass-panel p-8 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Cold Email Outreach Engine</h2>
        <p className="text-sm text-dark-muted leading-relaxed">
          Enrich hiring manager emails legitimately, draft personalized cold outreach with Claude API, review before dispatching, and respect CAN-SPAM limits.
        </p>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scheduled for Days 10–11 Scope</span>
        </div>
      </div>
    </div>
  );
};
