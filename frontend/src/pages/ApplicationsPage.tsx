import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { ReviewQueueItem, Application, ApplicationStatus, SubmissionTriggerResult } from '../types/application';
import { applicationService } from '../services/applications';
import { tailoringService } from '../services/tailoring';
import { TailoredResumeModal } from '../components/Tailoring/TailoredResumeModal';
import { PreFillConfirmationModal } from '../components/Applications/PreFillConfirmationModal';
import { ApplicationDetailModal } from '../components/Applications/ApplicationDetailModal';
import { Job } from '../types/job';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  ShieldCheck,
  FileText,
  Wrench,
  Download,
  Calendar,
  ExternalLink,
  Check,
  Send,
  Plus,
  TrendingUp,
  Clock,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { PrepPackModal } from '../components/Interview/PrepPackModal';
import { interviewPrepService } from '../services/interview_prep';
import { InterviewPrepPack } from '../types/interview_prep';
import { usePeachyEvents } from '../context/PeachyEventContext';

const KANBAN_STAGES: ApplicationStatus[] = [
  'Ready to Apply',
  'Applied',
  'Under Review',
  'Interview',
  'Offer',
  'Rejected',
];

export const ApplicationsPage: React.FC = () => {
  const { emitNotification } = usePeachyEvents();
  
  // Top level tab: 'queue' | 'kanban'
  const [activeTab, setActiveTab] = useState<'queue' | 'kanban'>('queue');

  // Review Queue state
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);

  // Kanban Board state
  const [kanbanData, setKanbanData] = useState<Record<string, Application[]>>({});
  const [kanbanLoading, setKanbanLoading] = useState(true);

  // Active Modals state
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  // Active Interview Prep Pack Modal state
  const [activePrepPack, setActivePrepPack] = useState<InterviewPrepPack | null>(null);
  const [generatingPrepForJobId, setGeneratingPrepForJobId] = useState<number | null>(null);

  const handleOpenPrepPack = async (jobId: number) => {
    setGeneratingPrepForJobId(jobId);
    try {
      const pack = await interviewPrepService.generatePrepPack(jobId);
      setActivePrepPack(pack);
    } catch (err) {
      console.error('Failed to generate prep pack:', err);
    } finally {
      setGeneratingPrepForJobId(null);
    }
  };
  
  // Form Pre-Fill Confirmation Modal state
  const [pendingPreFillApp, setPendingPreFillApp] = useState<Application | null>(null);
  const [preFillResult, setPreFillResult] = useState<SubmissionTriggerResult | null>(null);
  const [submittingAppId, setSubmittingAppId] = useState<number | null>(null);

  const fetchQueue = async () => {
    setQueueLoading(true);
    try {
      const data = await applicationService.getReviewQueue();
      setQueueItems(data);
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchKanban = async () => {
    setKanbanLoading(true);
    try {
      const data = await applicationService.getKanbanBoard();
      setKanbanData(data);
    } catch (err) {
      console.error('Failed to fetch kanban board:', err);
    } finally {
      setTrackerLoading(false);
      setKanbanLoading(false);
    }
  };

  const [trackerLoading, setTrackerLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
    fetchKanban();
  }, []);

  const handleApprove = async (item: ReviewQueueItem) => {
    try {
      await applicationService.approveApplication(item.job.id);
      emitNotification({
        type: 'resume_tailored',
        title: `Approved Resume for ${item.job.company}!`,
        message: `Status set to 'Ready to Apply' and added to Kanban Dashboard.`,
        link: '/applications',
      });
      await fetchQueue();
      await fetchKanban();
    } catch (err) {
      console.error('Failed to approve application:', err);
    }
  };

  const handleReject = async (item: ReviewQueueItem) => {
    try {
      await applicationService.rejectApplication(item.job.id);
      emitNotification({
        type: 'job_scan',
        title: `Resume Rejected`,
        message: `Tailored resume for ${item.job.company} was rejected.`,
        link: '/applications',
      });
      await fetchQueue();
      await fetchKanban();
    } catch (err) {
      console.error('Failed to reject application:', err);
    }
  };

  const handleTriggerSubmission = async (app: Application) => {
    setSubmittingAppId(app.id);
    try {
      const res = await applicationService.submitApplication(app.id);
      if (res.status === 'pending_confirmation') {
        // Trigger Playwright Pre-Fill Confirmation Modal (Human-in-the-Loop Hard Pause)
        setPendingPreFillApp(app);
        setPreFillResult(res);
      } else if (res.status === 'applied') {
        // Direct API submission completed
        emitNotification({
          type: 'resume_tailored',
          title: `Application Submitted to ${app.job?.company || 'Employer'}!`,
          message: `Direct submission completed and status moved to 'Applied'.`,
          link: '/applications',
        });
        await fetchKanban();
      }
    } catch (err) {
      console.error('Failed to trigger submission:', err);
    } finally {
      setSubmittingAppId(null);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: ApplicationStatus) => {
    try {
      await applicationService.updateApplication(appId, { status: newStatus });
      await fetchKanban();
      emitNotification({
        type: 'job_scan',
        title: 'Status Updated',
        message: `Application moved to '${newStatus}'.`,
        link: '/applications',
      });
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const stageBadgeStyle = (stage: ApplicationStatus) => {
    switch (stage) {
      case 'Ready to Apply':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Applied':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Under Review':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Interview':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Offer':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-bold';
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Application Review & Submission Dashboard"
        subtitle="Centralized review queue, Playwright pre-fill submission automation, and interactive Kanban tracking board."
      />

      {/* Top Level Navigation Sub-Header Tabs */}
      <div className="flex items-center space-x-3 border-b border-dark-border/60 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'queue'
              ? 'bg-peach-500 text-white shadow-glow-peach'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Review Queue</span>
          {queueItems.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono">
              {queueItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'kanban'
              ? 'bg-cyan-500 text-white shadow-glow-cyan'
              : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Kanban Applications Dashboard</span>
        </button>
      </div>

      {/* VIEW 1: REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-peach-400" />
              <span>Pending Tailored Resumes ({queueItems.length})</span>
            </h3>
            <span className="text-xs text-dark-muted">
              Approve jobs to queue them into the Applications Kanban Tracker
            </span>
          </div>

          {queueLoading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-peach-500/20 border-t-peach-500 rounded-full animate-spin"></div>
              <p className="text-xs text-dark-muted">Loading review queue items...</p>
            </div>
          ) : queueItems.length === 0 ? (
            <div className="glass-panel p-12 text-center space-y-3 max-w-xl mx-auto my-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Review Queue is Up to Date!</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                All generated tailored resumes have been evaluated. Tailor new job postings from the Job Feed to populate your queue.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {queueItems.map((item) => {
                const tr = item.tailored_resume;
                const json = tr.tailored_json;
                const breakdown = item.ats_breakdown;

                return (
                  <div
                    key={item.job.id}
                    className="glass-panel p-6 space-y-5 border-dark-border hover:border-slate-700 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between border-b border-dark-border/60 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-bold text-white tracking-tight">
                            {item.job.title}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            {item.job.relevance_score}% Match Score
                          </span>
                        </div>
                        <p className="text-xs text-dark-muted">
                          Company: <strong className="text-slate-200">{item.job.company}</strong> • Location: {item.job.location} • Platform: {item.job.source_platform}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-lg bg-dark-bg border border-dark-border text-xs text-slate-300 font-mono">
                          Resume Version #{tr.version_number}
                        </span>
                      </div>
                    </div>

                    {/* ATS Score Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-dark-bg/60 p-4 rounded-xl border border-dark-border/60 text-xs">
                      <div className="space-y-1">
                        <span className="text-[11px] text-dark-muted uppercase tracking-wider block font-medium">
                          Keyword Alignment
                        </span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-base font-bold text-white">
                            {breakdown.keyword_alignment_score}% Match
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-dark-muted uppercase tracking-wider block font-medium">
                          Fact-Guard Claims
                        </span>
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="text-base font-bold text-emerald-300">
                            {breakdown.fact_guard_verified_claims} Verified
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-dark-muted uppercase tracking-wider block font-medium">
                          Skills Coverage
                        </span>
                        <div className="flex items-center space-x-2">
                          <Wrench className="w-4 h-4 text-cyan-400" />
                          <span className="text-base font-bold text-cyan-300">
                            {breakdown.skills_coverage_score}% Covered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tailored Resume Summary Preview */}
                    <div className="space-y-3 bg-dark-bg/40 p-4 rounded-xl border border-dark-border/40 text-xs">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-peach-400 block mb-1">
                          Tailored Professional Summary
                        </span>
                        <p className="text-slate-200 leading-relaxed italic">
                          "{json.summary || tr.summary}"
                        </p>
                      </div>

                      {json.skills && json.skills.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
                            Prioritized Skills
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {json.skills.slice(0, 8).map((sk: string, sIdx: number) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded text-[11px]"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
                      <button
                        onClick={() => setEditingJob(item.job)}
                        className="px-4 py-2 rounded-lg bg-dark-hover hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 border border-dark-border"
                      >
                        <Edit3 className="w-4 h-4 text-cyan-400" />
                        <span>Edit Structured Resume</span>
                      </button>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleReject(item)}
                          className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-semibold text-xs flex items-center space-x-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(item)}
                          className="px-6 py-2.5 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-bold text-xs shadow-glow-peach flex items-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Move to Kanban</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN APPLICATIONS DASHBOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-6">
          {kanbanLoading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-xs text-dark-muted">Loading Kanban Dashboard columns...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
              {KANBAN_STAGES.map((stage) => {
                const stageApps = kanbanData[stage] || [];

                return (
                  <div
                    key={stage}
                    className="bg-dark-bg/60 border border-dark-border rounded-xl p-3 flex flex-col min-h-[500px] space-y-3"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-dark-border/60 shrink-0">
                      <span className="font-bold text-xs text-white tracking-tight">{stage}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stageBadgeStyle(
                          stage
                        )}`}
                      >
                        {stageApps.length}
                      </span>
                    </div>

                    {/* Column Cards Container */}
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {stageApps.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 border border-dashed border-dark-border/40 rounded-lg text-[11px]">
                          No jobs in {stage}
                        </div>
                      ) : (
                        stageApps.map((app) => {
                          const jobTitle = app.job?.title || 'Senior Role';
                          const company = app.job?.company || 'Company';
                          const isSubmitting = submittingAppId === app.id;

                          return (
                            <div
                              key={app.id}
                              className="bg-dark-card border border-dark-border hover:border-slate-600 rounded-lg p-3 space-y-2 text-xs shadow-md transition-all group"
                            >
                              <div
                                onClick={() => setSelectedApplication(app)}
                                className="cursor-pointer space-y-1"
                              >
                                <div className="flex items-start justify-between">
                                  <h5 className="font-bold text-white group-hover:text-peach-300 transition-colors line-clamp-1">
                                    {jobTitle}
                                  </h5>
                                </div>
                                <p className="text-[11px] text-dark-muted font-semibold line-clamp-1">
                                  {company}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-dark-border/40">
                                <span>v#{app.resume_version}</span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  {new Date(app.updated_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Interactive Stage Selector */}
                              <div className="pt-1 flex items-center space-x-1">
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    handleUpdateStatus(app.id, e.target.value as ApplicationStatus)
                                  }
                                  className="w-full p-1 bg-dark-bg border border-dark-border rounded text-[10px] text-slate-300 font-semibold focus:outline-none focus:border-cyan-500"
                                >
                                  {KANBAN_STAGES.map((s) => (
                                    <option key={s} value={s}>
                                      Move to: {s}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Submit Action for Ready to Apply Cards */}
                              {app.status === 'Ready to Apply' && (
                                <button
                                  onClick={() => handleTriggerSubmission(app)}
                                  disabled={isSubmitting}
                                  className="w-full mt-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] rounded shadow-glow-emerald flex items-center justify-center space-x-1 disabled:opacity-50"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{isSubmitting ? 'Form Pre-Filling...' : 'Submit Application'}</span>
                                </button>
                              )}

                              {/* Generate/View Prep Pack Action for Interview Cards */}
                              {app.status === 'Interview' && (
                                <button
                                  onClick={() => handleOpenPrepPack(app.job_id)}
                                  disabled={generatingPrepForJobId === app.job_id}
                                  className="w-full mt-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded shadow-glow-purple flex items-center justify-center space-x-1 disabled:opacity-50"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>
                                    {generatingPrepForJobId === app.job_id
                                      ? 'Generating Pack...'
                                      : 'Generate Prep Pack'}
                                  </span>
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interview Prep Pack Modal */}
      {activePrepPack && (
        <PrepPackModal
          prepPack={activePrepPack}
          onClose={() => setActivePrepPack(null)}
          onUpdate={fetchKanban}
        />
      )}

      {/* Form Pre-Fill Hard Pause Confirmation Modal */}
      {pendingPreFillApp && preFillResult && (
        <PreFillConfirmationModal
          application={pendingPreFillApp}
          submissionResult={preFillResult}
          onClose={() => {
            setPendingPreFillApp(null);
            setPreFillResult(null);
          }}
          onSubmitted={() => {
            fetchKanban();
          }}
        />
      )}

      {/* Application Card Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdate={() => fetchKanban()}
          onOpenEditor={() => {
            if (selectedApplication.job) {
              setEditingJob(selectedApplication.job);
            }
          }}
        />
      )}

      {/* Tailored Resume Structured Editor Modal */}
      {editingJob && (
        <TailoredResumeModal
          job={editingJob}
          onClose={() => {
            setEditingJob(null);
            fetchQueue();
            fetchKanban();
          }}
        />
      )}
    </div>
  );
};
