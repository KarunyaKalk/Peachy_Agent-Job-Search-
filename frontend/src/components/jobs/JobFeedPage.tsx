import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/client';
import { Job } from '../../types';
import { useEventBus } from '../../context/EventBusContext';
import {
  Search,
  RefreshCw,
  Link,
  ExternalLink,
  Sparkles,
  MapPin,
  DollarSign,
  Building,
  CheckCircle,
  FileText
} from 'lucide-react';

interface JobFeedPageProps {
  onSelectJobForTailoring?: (jobId: number) => void;
}

export const JobFeedPage: React.FC<JobFeedPageProps> = ({ onSelectJobForTailoring }) => {
  const { emitEvent } = useEventBus();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [linkedInUrl, setLinkedInUrl] = useState<string>('');
  const [importingUrl, setImportingUrl] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadJobs();
  }, [searchTerm]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getJobs(0, searchTerm);
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScanNow = async () => {
    setScanning(true);
    try {
      const res = await apiService.triggerJobScan();
      await loadJobs();
      emitEvent({
        title: 'Job Discovery Scan Complete',
        message: `Discovered ${res.new_jobs_added || 3} new job postings matching your profile fingerprint.`,
        actionLabel: 'View Job Feed',
        page: 'jobs'
      });
    } catch (e) {
      alert('Scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const handleImportLinkedIn = async () => {
    if (!linkedInUrl.trim()) return;
    setImportingUrl(true);
    try {
      const job = await apiService.parseLinkedInUrl(linkedInUrl);
      setJobs([job, ...jobs]);
      setLinkedInUrl('');
      emitEvent({
        title: 'LinkedIn Job Imported',
        message: `Parsed JD for ${job.title} at ${job.company}. Match score calculated.`,
        actionLabel: 'Tailor Resume',
        page: 'resumes'
      });
    } catch (e) {
      alert('Failed to parse LinkedIn URL.');
    } finally {
      setImportingUrl(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Controls & LinkedIn Single URL Parser */}
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Discovered Job Feed</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated via Adzuna API, Wellfound, Haveloc & Manual LinkedIn Import. Sorted by Match Score.
            </p>
          </div>

          <button
            onClick={handleScanNow}
            disabled={scanning}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-peach-500 hover:bg-peach-600 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning APIs...' : 'Scan Discovered Jobs'}</span>
          </button>
        </div>

        {/* LINKEDIN MANUAL-ASSIST SINGLE URL PARSER BOX */}
        <div className="pt-3 border-t border-cream-200 dark:border-slate-700/60 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Link className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="url"
              placeholder="Paste LinkedIn Job URL for single-JD manual assist parse..."
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-peach-400 outline-none"
            />
          </div>

          <button
            onClick={handleImportLinkedIn}
            disabled={importingUrl}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-900 transition-colors"
          >
            {importingUrl ? 'Parsing JD...' : 'Import LinkedIn URL'}
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter jobs by title, company, or skill keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-espresso-800 border border-cream-200 dark:border-slate-800 rounded-xl text-xs"
        />
      </div>

      {/* Job Grid & Detail Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Job List Column */}
        <div className="lg:col-span-6 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading jobs feed...</div>
          ) : jobs.length === 0 ? (
            <div className="peachy-card p-8 text-center text-slate-500">No jobs matching your filter.</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`peachy-card p-4 cursor-pointer transition-all ${
                  selectedJob?.id === job.id
                    ? 'border-peach-500 dark:border-peach-500 ring-2 ring-peach-400/20'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{job.title}</h3>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company}</span>
                    </p>
                  </div>

                  {/* Match Score Badge */}
                  <span
                    className={`peachy-pill ${
                      job.match_score >= 80
                        ? 'bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300'
                        : 'bg-peach-100 text-peach-700 dark:bg-peach-900/40 dark:text-peach-300'
                    }`}
                  >
                    {job.match_score}% Match
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{job.location}</span>
                  </span>

                  {job.salary_range && (
                    <span className="flex items-center space-x-1 font-mono">
                      <DollarSign className="w-3 h-3" />
                      <span>{job.salary_range}</span>
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded bg-cream-100 dark:bg-slate-800 text-[10px] uppercase font-mono font-bold">
                    {job.source_platform}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Job Detail Panel */}
        <div className="lg:col-span-6">
          {selectedJob ? (
            <div className="peachy-card p-6 space-y-4 sticky top-6">
              <div className="border-b border-cream-200 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">{selectedJob.title}</h2>
                    <p className="text-sm font-semibold text-peach-600 dark:text-peach-400">{selectedJob.company}</p>
                  </div>
                  <a
                    href={selectedJob.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-600"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-2">Job Description Summary</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto pr-2">
                  {selectedJob.full_jd_text}
                </p>
              </div>

              {/* 1-Click Tailor Resume Handoff */}
              <div className="pt-4 border-t border-cream-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    if (onSelectJobForTailoring) onSelectJobForTailoring(selectedJob.id);
                  }}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-peach-500 hover:bg-peach-600 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tailor Resume for this Job</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="peachy-card p-12 text-center text-slate-400">
              Select a job from the feed to view full details and tailor your resume.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
