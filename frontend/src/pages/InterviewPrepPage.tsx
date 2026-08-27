import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { InterviewPrepPack } from '../types/interview_prep';
import { interviewPrepService } from '../services/interview_prep';
import { PrepPackModal } from '../components/Interview/PrepPackModal';
import {
  Sparkles,
  CheckCircle2,
  Building,
  Wrench,
  BookOpen,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import { jobService } from '../services/jobs';
import { Job } from '../types/job';

export const InterviewPrepPage: React.FC = () => {
  const [prepPacks, setPrepPacks] = useState<InterviewPrepPack[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePack, setActivePack] = useState<InterviewPrepPack | null>(null);
  const [generatingJobId, setGeneratingJobId] = useState<number | null>(null);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const [packs, fetchedJobs] = await Promise.all([
        interviewPrepService.getAllPrepPacks(),
        jobService.getJobs(),
      ]);
      setPrepPacks(packs);
      setJobs(fetchedJobs);
    } catch (err) {
      console.error('Failed to fetch interview prep packs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleGenerateForJob = async (jobId: number) => {
    setGeneratingJobId(jobId);
    try {
      const newPack = await interviewPrepService.generatePrepPack(jobId);
      await fetchPacks();
      setActivePack(newPack);
    } catch (err) {
      console.error('Failed to generate prep pack:', err);
    } finally {
      setGeneratingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Interview Prep Assistant & Checklist Hub"
        subtitle="Role-specific question predictions, company background context, STAR-formatted answers from master accomplishments, and checkable pre-interview packs."
      />

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex items-center space-x-4 border-dark-border">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
              Active Prep Packs
            </span>
            <span className="text-2xl font-bold text-white">{prepPacks.length} Prep Packs</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center space-x-4 border-dark-border">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
              STAR Stories Aligned
            </span>
            <span className="text-2xl font-bold text-emerald-300">
              {prepPacks.reduce((acc, p) => acc + (p.behavioral_questions?.length || 0), 0)} Stories
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center space-x-4 border-dark-border">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
              Technical Topics Covered
            </span>
            <span className="text-2xl font-bold text-cyan-300">
              {prepPacks.reduce((acc, p) => acc + (p.technical_questions?.length || 0), 0)} Questions
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Generated Prep Packs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Generated Company Prep Packs</span>
          </h3>
          <span className="text-xs text-dark-muted">
            Click any prep pack card to open the interactive checklist & notes editor
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-xs text-dark-muted">Loading interview prep packs...</p>
          </div>
        ) : prepPacks.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-3 max-w-xl mx-auto my-8 border-dark-border">
            <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No Interview Prep Packs Created Yet</h4>
            <p className="text-xs text-dark-muted leading-relaxed">
              When an application is moved to <strong>"Interview"</strong> status in the Applications Tracker, click <strong>"Generate Prep Pack"</strong> to build custom STAR answers and technical question checklists.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prepPacks.map((pack) => {
              const totalItems = (pack.technical_questions?.length || 0) + (pack.behavioral_questions?.length || 0);
              const completedItems =
                (pack.technical_questions?.filter((q) => q.is_completed).length || 0) +
                (pack.behavioral_questions?.filter((q) => q.is_completed).length || 0);
              const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

              return (
                <div
                  key={pack.id}
                  onClick={() => setActivePack(pack)}
                  className="glass-panel p-5 space-y-4 border-dark-border hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {pack.role_title}
                        </h4>
                        <p className="text-xs text-dark-muted flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <strong className="text-slate-200">{pack.company_name}</strong>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {percentage}% Ready
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-dark-bg/60 p-2.5 rounded-lg border border-dark-border/40">
                      {pack.company_overview || 'Company-specific interview prep pack with STAR answers.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-dark-muted">Checklist Progress</span>
                        <span className="text-emerald-300 font-bold">
                          {completedItems}/{totalItems} Done
                        </span>
                      </div>
                      <div className="w-full h-2 bg-dark-bg border border-dark-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
                    <span className="text-[11px] text-dark-muted font-mono">
                      Updated: {new Date(pack.updated_at).toLocaleDateString()}
                    </span>

                    <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold text-xs flex items-center space-x-1 border border-emerald-500/30 transition-all">
                      <span>Open Checklist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Section: Generate Prep Pack for Any Job */}
      <div className="glass-panel p-6 space-y-4 border-dark-border">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-purple-400" />
          <span>Quick Generate Prep Pack for Any Job Posting</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.slice(0, 4).map((job) => (
            <div
              key={job.id}
              className="p-3.5 bg-dark-bg/60 border border-dark-border rounded-xl flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">{job.title}</span>
                <span className="text-dark-muted font-medium">{job.company}</span>
              </div>

              <button
                onClick={() => handleGenerateForJob(job.id)}
                disabled={generatingJobId === job.id}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg shadow-glow-purple flex items-center space-x-1 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{generatingJobId === job.id ? 'Generating...' : 'Generate Pack'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Prep Pack Modal */}
      {activePack && (
        <PrepPackModal
          prepPack={activePack}
          onClose={() => setActivePack(null)}
          onUpdate={fetchPacks}
        />
      )}
    </div>
  );
};
