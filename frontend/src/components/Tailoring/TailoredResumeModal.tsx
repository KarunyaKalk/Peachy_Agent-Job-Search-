import React, { useState, useEffect } from 'react';
import { Job } from '../../types/job';
import { TailoredResume } from '../../types/tailoring';
import { tailoringService } from '../../services/tailoring';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Briefcase,
  Wrench,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Props {
  job: Job;
  onClose: () => void;
}

export const TailoredResumeModal: React.FC<Props> = ({ job, onClose }) => {
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepText, setStepText] = useState('Analyzing target job description...');
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const generateOrFetch = async () => {
      try {
        setStepText('Analyzing target job description & keywords...');
        await new Promise((r) => setTimeout(r, 600));

        if (isMounted) setStepText('Sending JD + Master Profile to Claude API...');
        await new Promise((r) => setTimeout(r, 800));

        if (isMounted) setStepText('Running automated Fact-Guard Verification...');
        
        const data = await tailoringService.generateTailoredResume(job.id);
        if (isMounted) {
          setTailoredResume(data);
          setApproved(data.status === 'approved');
        }
      } catch (err) {
        console.error('Failed to generate tailored resume:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    generateOrFetch();
    return () => {
      isMounted = false;
    };
  }, [job.id]);

  const handleApprove = async () => {
    if (!tailoredResume) return;
    try {
      const updated = await tailoringService.updateTailoredResume(tailoredResume.id, {
        status: 'approved',
      });
      setTailoredResume(updated);
      setApproved(true);
    } catch (err) {
      console.error('Failed to approve resume:', err);
    }
  };

  const flaggedCount = tailoredResume?.fact_guard_flags?.filter((f) => f.status === 'flagged').length || 0;
  const verifiedCount = tailoredResume?.fact_guard_flags?.filter((f) => f.status === 'verified').length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Modal Header */}
        <div className="p-6 border-b border-dark-border/60 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-peach-500/10 border border-peach-500/20 text-peach-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Tailored Resume for {job.title}
              </h3>
            </div>
            <p className="text-xs text-dark-muted">
              Target Company: <span className="text-slate-200 font-semibold">{job.company}</span> • Source: {job.source_platform}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-12 h-12 border-4 border-peach-500/20 border-t-peach-500 rounded-full animate-spin"></div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-white animate-pulse">{stepText}</p>
              <p className="text-xs text-dark-muted">Rephrasing existing bullet variants & skills with zero hallucinations...</p>
            </div>
          </div>
        ) : !tailoredResume ? (
          <div className="p-12 text-center text-red-400 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <p>Failed to generate tailored resume. Please try again.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Fact-Guard Verification Status Panel */}
            <div className="glass-panel p-5 space-y-3 border-dark-border">
              <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Fact-Guard Verification Audit</h4>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {verifiedCount} Verified Claims
                  </span>
                  {flaggedCount > 0 ? (
                    <span className="px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> {flaggedCount} Requires User Review
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      0 Hallucinations
                    </span>
                  )}
                </div>
              </div>

              {/* Flagged Claims Alert List */}
              {flaggedCount > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2 text-xs">
                  <p className="font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Fact-Guard Alert: Review flagged items before approving:</span>
                  </p>
                  <ul className="space-y-1.5 pl-5 list-disc text-slate-300">
                    {tailoredResume.fact_guard_flags
                      .filter((f) => f.status === 'flagged')
                      .map((flag, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <strong className="text-red-300">[{flag.field.toUpperCase()}]</strong> "{flag.claim}" —{' '}
                          <span className="text-slate-300">{flag.reason}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tailored Professional Summary */}
            <div className="glass-panel p-5 space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-peach-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Tailored Professional Summary</h4>
              </div>
              <p className="text-xs text-white leading-relaxed bg-dark-bg/60 p-3 rounded-lg border border-dark-border/60">
                {tailoredResume.tailored_json.summary}
              </p>
            </div>

            {/* Prioritized Skills */}
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Prioritized Skills (JD Aligned)</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {tailoredResume.tailored_json.skills.map((skill, idx) => {
                  const isFlagged = tailoredResume.fact_guard_flags.some(
                    (f) => f.field === 'skills' && f.claim === skill && f.status === 'flagged'
                  );
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                        isFlagged
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                      }`}
                    >
                      {skill} {isFlagged ? '⚠️' : ''}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Tailored Experience & Rephrased Bullets */}
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-peach-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Tailored Work Experience & Bullets</h4>
              </div>

              <div className="space-y-4">
                {tailoredResume.tailored_json.experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-dark-border/40 pb-2">
                      <h5 className="font-bold text-white">
                        {exp.role} <span className="text-peach-400">@ {exp.company}</span>
                      </h5>
                      <span className="text-dark-muted font-mono text-[11px]">
                        {exp.start_date} – {exp.end_date}
                      </span>
                    </div>

                    <ul className="space-y-1.5 pt-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2 text-slate-200 leading-relaxed">
                          <span className="text-peach-500 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        {tailoredResume && (
          <div className="p-4 border-t border-dark-border/60 bg-dark-bg/60 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-dark-muted">Version #{tailoredResume.version_number}</span>
              <span className="text-slate-500">•</span>
              <span className={approved ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {approved ? 'Approved for Submission' : 'Draft Version'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-dark-hover text-slate-300 font-semibold text-xs"
              >
                Close
              </button>

              <button
                onClick={handleApprove}
                disabled={approved}
                className="px-5 py-2 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-1.5 disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                <span>{approved ? 'Resume Approved!' : 'Approve Tailored Resume'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
