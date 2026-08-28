import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { TailoredResume, Job } from '../../types';
import { useEventBus } from '../../context/EventBusContext';
import { Sparkles, Download, AlertTriangle, CheckCircle, FileText, ArrowRight } from 'lucide-react';

interface TailoredResumesPageProps {
  selectedJobId?: number | null;
}

export const TailoredResumesPage: React.FC<TailoredResumesPageProps> = ({ selectedJobId }) => {
  const { emitEvent } = useEventBus();
  const [jobId, setJobId] = useState<number>(selectedJobId || 1);
  const [tailoring, setTailoring] = useState<boolean>(false);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await apiService.getJobs();
      setJobs(data);
      if (selectedJobId) setJobId(selectedJobId);
      else if (data.length > 0) setJobId(data[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTailorResume = async () => {
    setTailoring(true);
    try {
      const res = await apiService.tailorResume(jobId);
      setTailoredResume(res);
      emitEvent({
        title: 'Resume Tailored with Fact-Guard Verification',
        message: `Tailored version created with ATS score of ${res.ats_score}%. Ready for human approval.`,
        actionLabel: 'View Applications Kanban',
        page: 'applications'
      });
    } catch (e) {
      alert('Failed to tailor resume.');
    } finally {
      setTailoring(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Control Banner */}
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Module 3: Resume Tailoring & Fact-Guard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Rephrases and reorders truthful master bullets to mirror JD keywords without fabricating experience.
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select
            value={jobId}
            onChange={(e) => setJobId(Number(e.target.value))}
            className="flex-1 px-4 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-xs"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} at {j.company} ({j.match_score}% match)
              </option>
            ))}
          </select>

          <button
            onClick={handleTailorResume}
            disabled={tailoring}
            className="px-6 py-2.5 bg-peach-500 hover:bg-peach-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{tailoring ? 'Tailoring & Fact-Checking...' : 'Tailor Resume Now'}</span>
          </button>
        </div>
      </div>

      {/* Tailored Resume Result Output */}
      {tailoredResume && (
        <div className="space-y-6">
          {/* Fact-Guard Alert Banner */}
          {tailoredResume.fact_check_flags && tailoredResume.fact_check_flags.length > 0 ? (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-400 text-amber-800 dark:text-amber-300 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Fact-Guard Flagged Items for Review</span>
              </div>
              {tailoredResume.fact_check_flags.map((flag, idx) => (
                <p key={idx} className="pl-6 text-xs">• {flag.message}</p>
              ))}
            </div>
          ) : (
            <div className="bg-leaf-50 dark:bg-leaf-950/40 border border-leaf-400 text-leaf-700 dark:text-leaf-300 p-4 rounded-2xl text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-leaf-500" />
              <span>Fact-Guard Verification Passed: 100% truthful claims aligned with Master Profile.</span>
            </div>
          )}

          {/* ATS Breakdown & Download Card */}
          <div className="peachy-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ATS Parseability Score</span>
              <div className="font-mono text-3xl font-extrabold text-peach-600 dark:text-peach-400">
                {tailoredResume.ats_score}%
              </div>
            </div>

            {/* Download PDF Button */}
            <a
              href={apiService.getPdfUrl(tailoredResume.id)}
              download
              className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl inline-flex items-center space-x-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download ATS-Safe PDF</span>
            </a>
          </div>

          {/* Structured Tailored Output Preview */}
          <div className="peachy-card p-6 space-y-4 font-sans text-xs">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 border-b border-cream-200 dark:border-slate-800 pb-2">
              Tailored Resume Content Preview
            </h3>
            <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
              {tailoredResume.tailored_text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
