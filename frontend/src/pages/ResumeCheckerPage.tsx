import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { ResumeCheckerResponse } from '../types/resume_checker';
import { resumeCheckerService } from '../services/resume_checker';
import { jobService } from '../services/jobs';
import { Job } from '../types/job';
import {
  CheckSquare,
  Sparkles,
  Upload,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Award,
  Zap,
  Layers,
  Wrench,
  Search,
} from 'lucide-react';
import { usePeachyEvents } from '../context/PeachyEventContext';
import { useNavigate } from 'react-router-dom';

export const ResumeCheckerPage: React.FC = () => {
  const { emitNotification } = usePeachyEvents();
  const navigate = useNavigate();

  // Resume Source State
  const [resumeSource, setResumeSource] = useState<'master_profile' | 'uploaded_text'>('master_profile');
  const [resumeText, setResumeText] = useState('');

  // JD Source State
  const [jdSource, setJdSource] = useState<'pasted_text' | 'job_tracker'>('pasted_text');
  const [jdText, setJdText] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [trackedJobs, setTrackedJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Analysis Result State
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeCheckerResponse | null>(null);
  const [savingFingerprint, setSavingFingerprint] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const jobs = await jobService.getJobs();
        setTrackedJobs(jobs);
        if (jobs.length > 0) setSelectedJobId(jobs[0].id);
      } catch (err) {
        console.error('Failed to load tracked jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content || '');
      setResumeSource('uploaded_text');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const payload = {
        resume_text: resumeSource === 'uploaded_text' ? resumeText : undefined,
        resume_source: resumeSource,
        jd_text: jdSource === 'pasted_text' ? jdText : undefined,
        job_id: jdSource === 'job_tracker' ? selectedJobId || undefined : undefined,
      };

      const res = await resumeCheckerService.analyzeResume(payload);
      setResult(res);

      emitNotification({
        type: 'ats_score',
        title: `Quick ATS Analysis Complete: ${res.overall_ats_score}% Match`,
        message: `Extracted ${res.matched_keywords.length} matched keywords & identified ${res.missing_keywords.length} keyword gaps.`,
        link: '/resume-checker',
      });
    } catch (err) {
      console.error('Failed to run resume analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveFingerprint = async () => {
    if (!result) return;
    setSavingFingerprint(true);
    try {
      const allExtracted = [
        ...(result.resume_keywords.technical_skills || []),
        ...(result.resume_keywords.tools || []),
        ...(result.resume_keywords.soft_skills || []),
      ];

      await resumeCheckerService.saveFingerprint(allExtracted);
      emitNotification({
        type: 'ats_score',
        title: 'Keyword Fingerprint Saved to Master Profile',
        message: `Persisted ${allExtracted.length} extracted skills to improve future multi-source job match scoring.`,
        link: '/profile',
      });
    } catch (err) {
      console.error('Failed to save fingerprint:', err);
    } finally {
      setSavingFingerprint(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Resume Keyword Extractor & Quick ATS Checker"
        subtitle="Standalone ATS compatibility scorer and LLM contextual keyword gap analyzer for ANY resume + ANY job description."
      />

      {/* Main Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RESUME INPUT SECTION */}
        <div className="glass-panel p-5 space-y-4 border-dark-border">
          <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Step 1: Select or Upload Resume</span>
            </h3>

            <div className="flex items-center space-x-1.5 bg-dark-bg p-1 rounded-lg border border-dark-border text-[11px]">
              <button
                onClick={() => setResumeSource('master_profile')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  resumeSource === 'master_profile' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Master Profile
              </button>
              <button
                onClick={() => setResumeSource('uploaded_text')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  resumeSource === 'uploaded_text' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload / Paste
              </button>
            </div>
          </div>

          {resumeSource === 'master_profile' ? (
            <div className="p-4 bg-dark-bg/60 border border-dark-border/60 rounded-xl space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Using Active Master Profile Resume Data</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Includes your work experience bullets, skills taxonomy, summary, and projects stored in Module 1.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-dark-muted font-bold block">Upload Resume File (PDF / TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-dark-muted font-bold block mb-1">OR Paste Raw Resume Text</label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your raw resume text, work experience bullets, and skills list here..."
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-mono resize-y"
                />
              </div>
            </div>
          )}
        </div>

        {/* JOB DESCRIPTION INPUT SECTION */}
        <div className="glass-panel p-5 space-y-4 border-dark-border">
          <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Step 2: Provide Job Description</span>
            </h3>

            <div className="flex items-center space-x-1.5 bg-dark-bg p-1 rounded-lg border border-dark-border text-[11px]">
              <button
                onClick={() => setJdSource('pasted_text')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  jdSource === 'pasted_text' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste JD Text
              </button>
              <button
                onClick={() => setJdSource('job_tracker')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  jdSource === 'job_tracker' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pick From Tracker
              </button>
            </div>
          </div>

          {jdSource === 'job_tracker' ? (
            <div className="space-y-3 text-xs">
              <label className="text-dark-muted font-bold block">Select Tracked Job Opportunity</label>
              <select
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(parseInt(e.target.value) || null)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white font-bold focus:outline-none focus:border-cyan-500"
              >
                {trackedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} @ {job.company} ({job.location})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-dark-muted font-bold block mb-1">Paste Raw Job Description Text</label>
                <textarea
                  rows={8}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the target job posting text, requirements, and tech stack responsibilities here..."
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono resize-y"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ANALYZE BUTTON ACTION */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-glow-purple flex items-center space-x-2 disabled:opacity-50 transition-all transform hover:scale-105"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{analyzing ? 'Extracting Keywords & Scoring ATS...' : 'Run Quick ATS Analysis'}</span>
        </button>
      </div>

      {/* RESULTS DISPLAY SECTION */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-dark-border/60">
          {/* Score Cards Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 space-y-1 border-dark-border text-center">
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
                Overall ATS Score
              </span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {result.overall_ats_score}%
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">Combined ATS Match</span>
            </div>

            <div className="glass-panel p-5 space-y-1 border-dark-border text-center">
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
                Keyword Alignment
              </span>
              <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                {result.keyword_match_score}%
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">Tech & Tool Overlap</span>
            </div>

            <div className="glass-panel p-5 space-y-1 border-dark-border text-center">
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
                Formatting Score
              </span>
              <span className="text-3xl font-extrabold text-purple-400 font-mono">
                {result.formatting_score}%
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">ATS Machine Readability</span>
            </div>

            <div className="glass-panel p-5 space-y-1 border-dark-border text-center">
              <span className="text-[11px] text-dark-muted font-bold uppercase tracking-wider block">
                Section Completeness
              </span>
              <span className="text-3xl font-extrabold text-amber-400 font-mono">
                {result.completeness_score}%
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">Structure & Depth</span>
            </div>
          </div>

          {/* TWO-COLUMN KEYWORD GAP ANALYSIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUMN 1: MATCHED KEYWORDS (FOUND IN BOTH) */}
            <div className="glass-panel p-5 space-y-4 border-dark-border bg-emerald-500/5">
              <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Keywords Found in Both ({result.matched_keywords.length})</span>
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.matched_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* COLUMN 2: MISSING KEYWORDS (IN JD BUT MISSING FROM RESUME) */}
            <div className="glass-panel p-5 space-y-4 border-dark-border bg-rose-500/5">
              <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>In JD but Missing from Resume ({result.missing_keywords.length})</span>
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-sm"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS: SAVE FINGERPRINT & TAILOR RESUME */}
          <div className="glass-panel p-6 space-y-4 border-dark-border flex flex-col md:flex-row items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Act on these Analysis Results</h4>
              <p className="text-xs text-dark-muted">
                Save extracted keywords to Master Profile or jump directly into resume tailoring.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveFingerprint}
                disabled={savingFingerprint}
                className="px-4 py-2.5 rounded-xl bg-dark-card hover:bg-slate-700 text-slate-200 font-bold text-xs border border-dark-border flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4 text-purple-400" />
                <span>{savingFingerprint ? 'Saving...' : 'Save Fingerprint to Profile'}</span>
              </button>

              <button
                onClick={() => navigate('/tailored-resumes')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-glow-emerald flex items-center space-x-1.5"
              >
                <span>Tailor this Resume for this JD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
