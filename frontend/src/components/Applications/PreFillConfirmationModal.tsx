import React, { useState } from 'react';
import { Application, SubmissionTriggerResult } from '../../types/application';
import { applicationService } from '../../services/applications';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  Send,
  FileText,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { usePeachyEvents } from '../../context/PeachyEventContext';

interface Props {
  application: Application;
  submissionResult: SubmissionTriggerResult;
  onClose: () => void;
  onSubmitted: () => void;
}

export const PreFillConfirmationModal: React.FC<Props> = ({
  application,
  submissionResult,
  onClose,
  onSubmitted,
}) => {
  const { emitNotification } = usePeachyEvents();
  const [submitting, setSubmitting] = useState(false);

  const job = application.job;
  const company = job?.company || 'Target Employer';
  const title = job?.title || 'Senior Position';

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await applicationService.confirmFormSubmission(application.id);
      emitNotification({
        type: 'resume_tailored',
        title: `Application Submitted to ${company}!`,
        message: `Status updated to 'Applied'. Good luck!`,
        link: '/applications',
      });
      onSubmitted();
      onClose();
    } catch (err) {
      console.error('Failed to confirm submission:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-dark-border/60 flex items-center justify-between shrink-0 bg-dark-bg/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Human-in-the-Loop Pre-Fill Confirmation
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Form Pre-Filled • Paused Before Submit
                </span>
              </div>
              <p className="text-xs text-dark-muted">
                Role: <strong className="text-slate-200">{title}</strong> at <strong className="text-peach-400">{company}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
          {/* Safeguard Alert Box */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-3 text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-amber-300">
                Playwright Pre-Fill Complete — Hard Pause Active
              </p>
              <p className="leading-relaxed text-slate-300">
                Peachy has filled out the application form on <strong className="text-white">{job?.source_platform || 'Employer Site'}</strong>, attached your tailored ATS PDF resume (Version #{application.resume_version}), and <strong className="text-amber-300">stopped right before the final submit button</strong>. Review the form screenshot below before authorizing final submission.
              </p>
            </div>
          </div>

          {/* Screenshot / Form Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Live Form Screenshot (Captured by Playwright)
              </span>
              <span className="text-[11px] text-dark-muted font-mono">
                Single-Click Submission Safeguard
              </span>
            </div>

            <div className="border border-dark-border rounded-xl overflow-hidden bg-black/60 p-2 max-h-[380px] flex items-center justify-center">
              {submissionResult.prefill_screenshot ? (
                <img
                  src={submissionResult.prefill_screenshot}
                  alt="Playwright Pre-filled Form Screenshot"
                  className="max-h-[360px] w-auto object-contain rounded-lg border border-slate-700 shadow-md"
                />
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-500" />
                  <p>Pre-filled form details logged successfully.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pre-filled Fields Overview */}
          <div className="grid grid-cols-2 gap-3 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
            <div>
              <span className="text-dark-muted text-[11px] block mb-0.5">Applicant Name</span>
              <span className="font-semibold text-white">Karunya Kalkhundiya</span>
            </div>
            <div>
              <span className="text-dark-muted text-[11px] block mb-0.5">Attached Resume File</span>
              <span className="font-semibold text-cyan-300">
                ✓ Resume_{company.replace(/\s+/g, '_')}_v{application.resume_version}.pdf
              </span>
            </div>
            <div>
              <span className="text-dark-muted text-[11px] block mb-0.5">Application Platform</span>
              <span className="font-semibold text-slate-200">{job?.source_platform || 'Form Fill'}</span>
            </div>
            <div>
              <span className="text-dark-muted text-[11px] block mb-0.5">Form Fill Strategy</span>
              <span className="font-semibold text-emerald-400">Playwright Form Automation</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-dark-border/60 bg-dark-bg/60 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-dark-hover text-slate-300 font-semibold text-xs"
          >
            Cancel / Back to Editor
          </button>

          <button
            onClick={handleConfirmSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-glow-emerald flex items-center space-x-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Application...' : 'Confirm & Authorize Final Submission'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
