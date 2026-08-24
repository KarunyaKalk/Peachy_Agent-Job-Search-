import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '../../types/application';
import { OutreachRecord } from '../../types/outreach';
import { applicationService } from '../../services/applications';
import { tailoringService } from '../../services/tailoring';
import { outreachService } from '../../services/outreach';
import { ContactFinderModal } from '../Outreach/ContactFinderModal';
import {
  X,
  Briefcase,
  Calendar,
  ExternalLink,
  Download,
  FileText,
  Clock,
  Edit3,
  Save,
  CheckCircle2,
  Building,
  MapPin,
  DollarSign,
  Layers,
  Mail,
} from 'lucide-react';
import { usePeachyEvents } from '../../context/PeachyEventContext';

interface Props {
  application: Application;
  onClose: () => void;
  onUpdate: () => void;
  onOpenEditor: () => void;
}

export const ApplicationDetailModal: React.FC<Props> = ({
  application,
  onClose,
  onUpdate,
  onOpenEditor,
}) => {
  const { emitNotification } = usePeachyEvents();
  const [notes, setNotes] = useState(application.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(application.status);
  const [showContactFinder, setShowContactFinder] = useState(false);

  const [outreachLogs, setOutreachLogs] = useState<OutreachRecord[]>([]);

  const job = application.job;
  const company = job?.company || 'Target Employer';
  const title = job?.title || 'Senior Software Role';

  useEffect(() => {
    let isMounted = true;
    const fetchOutreach = async () => {
      if (!job?.id) return;
      try {
        const logs = await outreachService.getOutreachLog(job.id);
        if (isMounted) setOutreachLogs(logs);
      } catch (err) {
        console.error('Failed to fetch outreach log for job:', err);
      }
    };
    fetchOutreach();
    return () => {
      isMounted = false;
    };
  }, [job?.id]);



  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setCurrentStatus(newStatus);
    try {
      await applicationService.updateApplication(application.id, { status: newStatus });
      onUpdate();
      emitNotification({
        type: 'job_scan',
        title: 'Status Updated',
        message: `Application status changed to '${newStatus}'.`,
        link: '/applications',
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await applicationService.updateApplication(application.id, { notes });
      onUpdate();
      emitNotification({
        type: 'job_scan',
        title: 'Notes Saved',
        message: `Updated notes for ${company}.`,
        link: '/applications',
      });
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!application.resume_id) return;
    const filename = `Resume_${company.replace(/\s+/g, '_')}_v${application.resume_version}.pdf`;
    await tailoringService.downloadResumePdf(application.resume_id, filename);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-dark-border/60 flex items-center justify-between shrink-0 bg-dark-bg/50">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                className="px-3 py-1 bg-dark-bg border border-dark-border rounded-lg text-xs font-bold text-peach-300 focus:outline-none focus:border-peach-500"
              >
                <option value="Ready to Apply">Ready to Apply</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <p className="text-xs text-dark-muted">
              Company: <strong className="text-slate-200">{company}</strong> • Location: {job?.location || 'Remote'}
            </p>
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
          {/* Metadata Cards */}
          <div className="grid grid-cols-3 gap-3 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60">
            <div>
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block mb-0.5">
                Resume Version Used
              </span>
              <span className="font-bold text-peach-400">Version #{application.resume_version}</span>
            </div>
            <div>
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block mb-0.5">
                Application Date
              </span>
              <span className="font-semibold text-slate-200">
                {application.applied_at
                  ? new Date(application.applied_at).toLocaleDateString()
                  : 'Pending Submission'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block mb-0.5">
                Submission Platform
              </span>
              <span className="font-semibold text-cyan-300">{job?.source_platform || 'Adzuna'}</span>
            </div>
          </div>

          {/* Editable Notes Section */}
          <div className="glass-panel p-4 space-y-2 border-dark-border">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                Application Notes & Interview Log
              </span>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-[11px] font-bold flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes, recruiter names, interview details, or response dates..."
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Job Description Text Preview */}
          {job?.jd_text && (
            <div className="glass-panel p-4 space-y-2 border-dark-border">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px] block">
                Job Description Excerpt
              </span>
              <div className="p-3 bg-dark-bg/60 rounded-lg text-slate-300 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line text-[11px]">
                {job.jd_text}
              </div>
            </div>
          )}

          {/* Attempt Log Timeline */}
          {(application.attempt_log || []).length > 0 && (
            <div className="glass-panel p-4 space-y-2 border-dark-border">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px] block">
                Submission Attempt Audit Log
              </span>
              <div className="space-y-2 pt-1">
                {application.attempt_log?.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-dark-bg/80 rounded border border-dark-border/60 flex items-start space-x-2 text-[11px]"
                  >
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 leading-relaxed">{log.message}</p>
                      <span className="text-[10px] text-dark-muted font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outreach Log Section */}
          {outreachLogs.length > 0 && (
            <div className="glass-panel p-4 space-y-2 border-dark-border">
              <span className="font-bold uppercase tracking-wider text-purple-400 text-[11px] block">
                Sent Cold Email Outreach History ({outreachLogs.length})
              </span>
              <div className="space-y-2 pt-1">
                {outreachLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-dark-bg/80 rounded-lg border border-dark-border/60 space-y-1 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">To: {log.recipient_name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">✓ Sent</span>
                    </div>
                    <p className="text-purple-300 font-mono text-[10px]">{log.recipient_email}</p>
                    <p className="text-slate-300 font-semibold">{log.subject}</p>
                    <span className="text-[10px] text-dark-muted font-mono block pt-1">
                      {new Date(log.sent_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* Modal Footer */}
        <div className="p-4 border-t border-dark-border/60 bg-dark-bg/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenEditor();
              }}
              className="px-3.5 py-2 rounded-lg bg-dark-hover hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 border border-dark-border"
            >
              <Edit3 className="w-4 h-4 text-peach-400" />
              <span>Edit Resume</span>
            </button>

            {job && (
              <button
                onClick={() => setShowContactFinder(true)}
                className="px-3.5 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center space-x-1.5"
              >
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Find Contact & Cold Email</span>
              </button>
            )}

            {job?.apply_url && (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-dark-hover hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 border border-dark-border"
              >
                <span>Direct Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>


          <div className="flex items-center space-x-2">
            {application.resume_id && (
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-glow-cyan flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download ATS PDF</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-hover text-slate-300 font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showContactFinder && job && (
        <ContactFinderModal job={job} onClose={() => setShowContactFinder(false)} />
      )}
    </div>
  );
};

