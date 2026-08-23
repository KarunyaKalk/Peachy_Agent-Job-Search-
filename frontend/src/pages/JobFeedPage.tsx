import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { Job, JobScanResult } from '../types/job';
import { jobService } from '../services/jobs';
import {
  Search,
  Zap,
  Bookmark,
  Trash2,
  ExternalLink,
  Award,
  DollarSign,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  Clock,
  Plus,
} from 'lucide-react';
import { TailoredResumeModal } from '../components/Tailoring/TailoredResumeModal';

export const JobFeedPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<JobScanResult | null>(null);

  // Selected job for resume tailoring modal
  const [tailoringJob, setTailoringJob] = useState<Job | null>(null);

  // LinkedIn manual assist import
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [importingLinkedin, setImportingLinkedin] = useState(false);

  // Filters
  const [viewMode, setViewMode] = useState<'all' | 'saved' | 'discarded'>('all');
  const [sourcePlatform, setSourcePlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState<number>(60);

  // Selected job for full JD modal
  const [selectedJdJob, setSelectedJdJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      const data = await jobService.getJobs({
        view_mode: viewMode,
        source_platform: sourcePlatform !== 'all' ? (sourcePlatform as any) : undefined,
        search: searchQuery || undefined,
        min_score: minScore,
      });
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [viewMode, sourcePlatform, minScore]);

  const handleManualSearch = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const result = await jobService.triggerScan();
      setScanResult(result);
      await fetchJobs();
    } catch (err) {
      console.error('Job scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleImportLinkedIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl.trim()) return;

    setImportingLinkedin(true);
    try {
      await jobService.importLinkedInJob(linkedinUrl.trim());
      setLinkedinUrl('');
      setShowLinkedInModal(false);
      await fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to import LinkedIn URL.');
    } finally {
      setImportingLinkedin(false);
    }
  };

  const handleToggleBookmark = async (job: Job) => {
    try {
      const updated = await jobService.updateJobStatus(job.id, {
        is_saved: !job.is_saved,
      });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleDiscardJob = async (job: Job) => {
    try {
      await jobService.updateJobStatus(job.id, { is_discarded: true });
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      console.error('Failed to discard job:', err);
    }
  };

  const platforms = [
    { id: 'all', name: 'All Sources' },
    { id: 'Adzuna', name: 'Adzuna API' },
    { id: 'Wellfound', name: 'Wellfound Scraper' },
    { id: 'Haveloc', name: 'Haveloc Portal' },
    { id: 'LinkedIn', name: 'LinkedIn Import' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Multi-Source Job Discovery Feed"
        subtitle="Adzuna API, Wellfound Playwright scraper, Haveloc portal, and LinkedIn Manual Assist."
      />

      {/* Control Panel: Scan Actions & LinkedIn Assist */}
      <div className="glass-panel p-6 border-peach-500/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-peach-400" />
              <span>Job Discovery & Scheduled Scanner</span>
            </h2>
            <p className="text-xs text-dark-muted flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3.5 h-3.5" /> APScheduler: Running scan every 6 hours
              </span>
              •
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-peach-400" /> Rate-limited Playwright scrapers
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* LinkedIn Paste Button */}
            <button
              onClick={() => setShowLinkedInModal(true)}
              className="px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-peach-500/50 text-slate-200 hover:text-white font-semibold text-xs flex items-center space-x-1.5 transition-all"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import LinkedIn URL</span>
            </button>

            {/* Run Multi-Source Scan */}
            <button
              onClick={handleManualSearch}
              disabled={scanning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-peach-600 to-peach-500 hover:from-peach-500 hover:to-peach-400 text-white font-bold text-xs shadow-glow-peach flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${scanning ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{scanning ? 'Scanning All Sources...' : 'Run Full Multi-Source Scan'}</span>
            </button>
          </div>
        </div>

        {/* Scan Results Summary Banner */}
        {scanResult && (
          <div className="p-4 rounded-xl bg-peach-500/10 border border-peach-500/30 space-y-2 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-peach-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Source Discovery Complete!</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Adzuna + Wellfound + Haveloc</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-slate-300">
              <span className="bg-dark-bg/60 px-2.5 py-1 rounded border border-dark-border">
                <strong className="text-emerald-400 font-bold">{scanResult.new_jobs_added}</strong> new jobs added
              </span>
              <span className="bg-dark-bg/60 px-2.5 py-1 rounded border border-dark-border">
                <strong className="text-slate-400 font-bold">{scanResult.deduplicated_count}</strong> deduplicated
              </span>
              <span className="bg-dark-bg/60 px-2.5 py-1 rounded border border-dark-border">
                <strong className="text-amber-400 font-bold">{scanResult.discarded_filtered}</strong> keyword/score filtered
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Platform Source Tabs & Score Filter Controls */}
      <div className="space-y-3">
        {/* Source Platform Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setSourcePlatform(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                sourcePlatform === p.id
                  ? 'bg-peach-500/20 border-peach-500 text-peach-300 shadow-glow-peach'
                  : 'bg-dark-card border-dark-border text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* View Mode & Score Threshold Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 bg-dark-card border border-dark-border p-1 rounded-xl">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-peach-500/20 text-peach-400 border border-peach-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Discovered Feed
            </button>
            <button
              onClick={() => setViewMode('saved')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                viewMode === 'saved'
                  ? 'bg-peach-500/20 text-peach-400 border border-peach-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-peach-400 text-peach-400" />
              <span>Saved</span>
            </button>
            <button
              onClick={() => setViewMode('discarded')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'discarded'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Discarded
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs bg-dark-card border border-dark-border px-3 py-1.5 rounded-xl">
              <span className="text-dark-muted font-semibold">Min Score Threshold:</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="bg-transparent text-peach-400 font-mono font-bold focus:outline-none"
              >
                <option value={0} className="bg-dark-card text-white">Show All (0+)</option>
                <option value={60} className="bg-dark-card text-white">Default (60%+)</option>
                <option value={75} className="bg-dark-card text-white">High Match (75%+)</option>
                <option value={90} className="bg-dark-card text-white">Top Match (90%+)</option>
              </select>
            </div>

            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-dark-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 bg-dark-card border border-dark-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-peach-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discovered Jobs Feed */}
      {loading ? (
        <div className="glass-panel p-12 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-peach-500/20 border-t-peach-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-dark-muted font-medium animate-pulse">Loading ranked job feed...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-peach-500/10 border border-peach-500/20 text-peach-400 mx-auto flex items-center justify-center">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Jobs Discovered</h3>
          <p className="text-xs text-dark-muted leading-relaxed">
            No listings found matching your current score threshold ({minScore}%) or platform filter. Click "Run Full Multi-Source Scan" or import a LinkedIn URL.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-panel p-6 space-y-4 border-dark-border/80 hover:border-peach-500/40 transition-all group"
            >
              {/* Card Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3
                      onClick={() => setSelectedJdJob(job)}
                      className="text-base font-bold text-white hover:text-peach-400 cursor-pointer tracking-tight"
                    >
                      {job.title}
                    </h3>

                    {/* Source Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-mono font-medium ${
                        job.source_platform === 'LinkedIn'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          : job.source_platform === 'Wellfound'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : job.source_platform === 'Haveloc'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-peach-500/10 text-peach-400 border-peach-500/20'
                      }`}
                    >
                      {job.source_platform}
                    </span>

                    {job.seniority && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-dark-bg text-dark-muted border border-dark-border font-mono">
                        {job.seniority}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-dark-muted flex-wrap gap-y-1">
                    <span className="text-slate-200 font-semibold flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-dark-muted" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-dark-muted" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-dark-muted" />
                      {job.posted_date || 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Score & Action Buttons */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 justify-end">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {job.relevance_score}%
                      </span>
                    </div>
                    <span className="text-[10px] text-dark-muted uppercase tracking-wider font-semibold">
                      Match Score
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(job)}
                    className={`p-2 rounded-lg border transition-all ${
                      job.is_saved
                        ? 'bg-peach-500/20 border-peach-500 text-peach-400 shadow-glow-peach'
                        : 'bg-dark-bg border-dark-border text-slate-400 hover:text-white hover:bg-dark-hover'
                    }`}
                    title={job.is_saved ? 'Bookmarked' : 'Bookmark job'}
                  >
                    <Bookmark className={`w-4 h-4 ${job.is_saved ? 'fill-peach-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleDiscardJob(job)}
                    className="p-2 rounded-lg bg-dark-bg border border-dark-border text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Discard job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Salary & Excerpt */}
              <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border/60 text-xs space-y-2">
                {job.salary_min && (
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold font-mono">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      ${job.salary_min.toLocaleString()} – ${job.salary_max?.toLocaleString() || 'N/A'} {job.salary_currency}
                    </span>
                  </div>
                )}

                <p className="text-slate-300 leading-relaxed line-clamp-2">
                  {job.jd_text.replace(/###/g, '').replace(/•/g, '')}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedJdJob(job)}
                    className="text-xs text-slate-300 hover:text-white font-semibold flex items-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View JD</span>
                  </button>

                  <button
                    onClick={() => setTailoringJob(job)}
                    className="px-3 py-1.5 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-bold text-xs shadow-glow-peach flex items-center space-x-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tailor Resume</span>
                  </button>
                </div>

                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-dark-hover hover:bg-dark-border text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center space-x-1.5 border border-dark-border"
                >
                  <span>Apply Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tailored Resume Modal */}
      {tailoringJob && (
        <TailoredResumeModal job={tailoringJob} onClose={() => setTailoringJob(null)} />
      )}

      {/* LinkedIn Import Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">LinkedIn Manual-Assist Import</h3>
              </div>
              <button
                onClick={() => setShowLinkedInModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-slate-300 space-y-1">
              <p className="text-cyan-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Compliant Single-URL Import
              </p>
              <p className="text-[11px] leading-relaxed">
                Peachy fetches and parses only this specific job description into your feed. Bulk crawling is omitted to strictly protect your LinkedIn account from bot detection.
              </p>
            </div>

            <form onSubmit={handleImportLinkedIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">LinkedIn Job URL *</label>
                <input
                  type="url"
                  required
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/1234567890/"
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkedInModal(false)}
                  className="px-4 py-2 rounded-lg bg-dark-hover text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importingLinkedin || !linkedinUrl.trim()}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs shadow-glow-cyan flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{importingLinkedin ? 'Importing JD...' : 'Import Job Posting'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Full Job Description Modal */}
      {selectedJdJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative">
            <div className="p-6 border-b border-dark-border/60 flex items-start justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">{selectedJdJob.title}</h3>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selectedJdJob.relevance_score}% Match
                  </span>
                </div>
                <p className="text-xs text-dark-muted">
                  <span className="text-slate-200 font-semibold">{selectedJdJob.company}</span> • {selectedJdJob.location}
                </p>
              </div>

              <button
                onClick={() => setSelectedJdJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {selectedJdJob.jd_text}
            </div>

            <div className="p-4 border-t border-dark-border/60 bg-dark-bg/60 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedJdJob(null)}
                className="px-4 py-2 rounded-lg bg-dark-hover text-slate-300 font-semibold text-xs"
              >
                Close
              </button>

              <a
                href={selectedJdJob.apply_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-1.5"
              >
                <span>Direct Apply</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
