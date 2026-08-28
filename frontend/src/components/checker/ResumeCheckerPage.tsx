import React, { useState } from 'react';
import { apiService } from '../../api/client';
import { ATSCheckResult } from '../../types';
import { useEventBus } from '../../context/EventBusContext';
import { Upload, CheckCircle2, XCircle, Sparkles, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

interface ResumeCheckerPageProps {
  onNavigateToTailor?: () => void;
}

export const ResumeCheckerPage: React.FC<ResumeCheckerPageProps> = ({ onNavigateToTailor }) => {
  const { emitEvent } = useEventBus();
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [result, setResult] = useState<ATSCheckResult | null>(null);

  const handleRunCheck = async () => {
    setChecking(true);
    try {
      const res = await apiService.runStandaloneChecker(file || undefined, jdText);
      setResult(res);
      emitEvent({
        title: 'Standalone ATS Check Complete',
        message: `ATS Overall Score: ${res.overall_score}%. Extracted keywords saved to your Master Profile fingerprint.`,
        actionLabel: 'Tailor Resume',
        page: 'resumes'
      });
    } catch (e) {
      alert('ATS check failed.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-espresso-800 p-6 rounded-2xl border border-cream-200 dark:border-slate-800 space-y-2 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-peach-500" />
          <span>Standalone Resume ATS Checker</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload any resume PDF/DOCX or use Master Profile. Paste any JD text to compute 2-column keyword overlap and parseability scores.
        </p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Input */}
        <div className="peachy-card p-6 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            1. Resume Source
          </label>

          <label className="border-2 border-dashed border-cream-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-peach-400 transition-colors">
            <Upload className="w-6 h-6 text-peach-500 mb-2" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {file ? file.name : 'Click to Upload PDF / DOCX Resume'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Or leave empty to use current Master Profile</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        {/* JD Text Input */}
        <div className="peachy-card p-6 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            2. Job Description Text
          </label>
          <textarea
            rows={5}
            placeholder="Paste target job description text here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-peach-400 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleRunCheck}
          disabled={checking}
          className="px-8 py-3 bg-peach-500 hover:bg-peach-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{checking ? 'Analyzing ATS Parseability...' : 'Run ATS Score Check'}</span>
        </button>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Combined Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="peachy-card p-5 text-center">
              <span className="text-xs font-semibold text-slate-400">Overall ATS Score</span>
              <div className="font-mono text-3xl font-extrabold text-peach-600 dark:text-peach-400 mt-1">
                {result.overall_score}%
              </div>
            </div>

            <div className="peachy-card p-5 text-center">
              <span className="text-xs font-semibold text-slate-400">Keyword Match</span>
              <div className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {result.breakdown.keyword_match}%
              </div>
            </div>

            <div className="peachy-card p-5 text-center">
              <span className="text-xs font-semibold text-slate-400">Formatting Structure</span>
              <div className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {result.breakdown.formatting_structure}%
              </div>
            </div>

            <div className="peachy-card p-5 text-center">
              <span className="text-xs font-semibold text-slate-400">Section Completeness</span>
              <div className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {result.breakdown.section_completeness}%
              </div>
            </div>
          </div>

          {/* TWO-COLUMN MATCHED VS MISSING KEYWORDS BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="peachy-card p-6 space-y-3">
              <h3 className="font-display font-bold text-sm text-leaf-700 dark:text-leaf-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-leaf-500" />
                <span>Matched Keywords ({result.matched_keywords.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matched_keywords.map((kw, idx) => (
                  <span key={idx} className="peachy-pill bg-leaf-100 dark:bg-leaf-950/50 text-leaf-700 dark:text-leaf-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="peachy-card p-6 space-y-3">
              <h3 className="font-display font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Missing Important JD Keywords ({result.missing_keywords.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.map((kw, idx) => (
                  <span key={idx} className="peachy-pill bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 1-CLICK HANDOFF BUTTON */}
          <div className="peachy-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Ready to boost your ATS score?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Handoff missing keywords to the tailoring engine to generate a truthful revised resume.
              </p>
            </div>

            <button
              onClick={() => {
                if (onNavigateToTailor) onNavigateToTailor();
              }}
              className="px-6 py-2.5 bg-peach-500 hover:bg-peach-600 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-2 shadow-sm"
            >
              <span>Tailor This Resume for This JD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
