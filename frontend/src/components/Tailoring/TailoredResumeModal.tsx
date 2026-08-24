import React, { useState, useEffect } from 'react';
import { Job } from '../../types/job';
import { TailoredResume, TailoredJson } from '../../types/tailoring';
import { tailoringService } from '../../services/tailoring';
import { StructuredResumeEditor } from './StructuredResumeEditor';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
  Briefcase,
  Wrench,
  Check,
  Download,
  History,
  Lock,
  Edit3,
  Eye,
  Plus,
  Save,
} from 'lucide-react';
import { usePeachyEvents } from '../../context/PeachyEventContext';

interface Props {
  job: Job;
  onClose: () => void;
}

export const TailoredResumeModal: React.FC<Props> = ({ job, onClose }) => {
  const { emitNotification } = usePeachyEvents();
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [versionHistory, setVersionHistory] = useState<TailoredResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepText, setStepText] = useState('Analyzing target job description...');
  
  // Active Main View Tab: 'editor' | 'factguard' | 'preview' | 'history'
  const [viewTab, setViewTab] = useState<'editor' | 'factguard' | 'preview' | 'history'>('editor');
  
  // Working draft JSON state for structured editor
  const [workingJson, setWorkingJson] = useState<TailoredJson | null>(null);

  const loadVersions = async () => {
    try {
      const versions = await tailoringService.getResumeVersions(job.id);
      setVersionHistory(versions);
      if (versions.length > 0) {
        setTailoredResume(versions[0]);
        setWorkingJson(versions[0].tailored_json);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initTailoring = async () => {
      try {
        setStepText('Analyzing target job description & ATS keywords...');
        await new Promise((r) => setTimeout(r, 400));

        if (isMounted) setStepText('Running Claude AI Resume Tailoring & Fact-Guard...');
        
        // Fetch or generate initial version
        const data = await tailoringService.generateTailoredResume(job.id);
        if (isMounted) {
          setTailoredResume(data);
          setWorkingJson(data.tailored_json);
          await loadVersions();

          emitNotification({
            type: 'resume_tailored',
            title: `Resume Tailored for ${job.company}`,
            message: `Generated ATS-aligned resume version #${data.version_number} with Fact-Guard verification.`,
            link: '/jobs',
          });
        }
      } catch (err) {
        console.error('Failed to generate tailored resume:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initTailoring();
    return () => {
      isMounted = false;
    };
  }, [job.id]);

  const handleSelectVersion = (version: TailoredResume) => {
    setTailoredResume(version);
    setWorkingJson(version.tailored_json);
  };

  const handleCreateNewVersion = async () => {
    setLoading(true);
    try {
      const newVersion = await tailoringService.generateTailoredResume(job.id);
      setTailoredResume(newVersion);
      setWorkingJson(newVersion.tailored_json);
      await loadVersions();
      setViewTab('editor');
    } catch (err) {
      console.error('Failed to create new version:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!tailoredResume || !workingJson) return;
    setSaving(true);
    try {
      const updated = await tailoringService.updateTailoredResume(tailoredResume.id, {
        tailored_json: workingJson,
        summary: workingJson.summary,
        status: 'draft',
      });
      setTailoredResume(updated);
      await loadVersions();
      emitNotification({
        type: 'resume_tailored',
        title: 'Draft Saved',
        message: `Saved hand-edits to Resume Version #${updated.version_number}.`,
        link: '/jobs',
      });
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!tailoredResume || !workingJson) return;
    setSaving(true);
    try {
      // Save current working json first
      await tailoringService.updateTailoredResume(tailoredResume.id, {
        tailored_json: workingJson,
        summary: workingJson.summary,
      });
      // Lock/finalize
      const finalized = await tailoringService.finalizeTailoredResume(tailoredResume.id);
      setTailoredResume(finalized);
      await loadVersions();
      emitNotification({
        type: 'resume_tailored',
        title: 'Resume Finalized & Locked!',
        message: `Version #${finalized.version_number} is locked and ready for submission.`,
        link: '/jobs',
      });
    } catch (err) {
      console.error('Failed to finalize resume:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!tailoredResume) return;
    const filename = `Resume_${job.company.replace(/\s+/g, '_')}_v${tailoredResume.version_number}.pdf`;
    await tailoringService.downloadResumePdf(tailoredResume.id, filename);
  };

  const isFinalized = tailoredResume?.status === 'finalized' || tailoredResume?.status === 'approved';
  const flaggedCount = tailoredResume?.fact_guard_flags?.filter((f) => f.status === 'flagged').length || 0;
  const verifiedCount = tailoredResume?.fact_guard_flags?.filter((f) => f.status === 'verified').length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-dark-border/60 flex items-center justify-between shrink-0 bg-dark-bg/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-peach-500/10 border border-peach-500/20 text-peach-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Tailored Resume for {job.title}
                </h3>
                {tailoredResume && (
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                      isFinalized
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    Version #{tailoredResume.version_number} ({isFinalized ? 'Finalized & Locked' : 'Draft Mode'})
                  </span>
                )}
              </div>
              <p className="text-xs text-dark-muted">
                Company: <span className="text-slate-200 font-semibold">{job.company}</span> • Location: {job.location}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Version History Quick Selector */}
            {versionHistory.length > 0 && tailoredResume && (
              <select
                value={tailoredResume.id}
                onChange={(e) => {
                  const target = versionHistory.find((v) => v.id === Number(e.target.value));
                  if (target) handleSelectVersion(target);
                }}
                className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-peach-500"
              >
                {versionHistory.map((v) => (
                  <option key={v.id} value={v.id}>
                    Version #{v.version_number} ({v.status === 'finalized' ? 'Locked' : 'Draft'})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleCreateNewVersion}
              title="Generate New Tailored Version"
              className="px-3 py-1.5 bg-peach-500/10 hover:bg-peach-500/20 text-peach-300 border border-peach-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Version</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 bg-dark-card/60 border-b border-dark-border/60 shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewTab('editor')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all ${
                viewTab === 'editor'
                  ? 'bg-peach-500 text-white shadow-glow-peach'
                  : 'text-slate-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Structured Editor</span>
            </button>

            <button
              onClick={() => setViewTab('factguard')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all ${
                viewTab === 'factguard'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Fact-Guard Audit ({verifiedCount})</span>
              {flaggedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setViewTab('preview')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all ${
                viewTab === 'preview'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live ATS Resume View</span>
            </button>

            <button
              onClick={() => setViewTab('history')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all ${
                viewTab === 'history'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Version History ({versionHistory.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={!tailoredResume}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download ATS PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-12 h-12 border-4 border-peach-500/20 border-t-peach-500 rounded-full animate-spin"></div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-white animate-pulse">{stepText}</p>
              <p className="text-xs text-dark-muted">Aligning profile experience & bullets with zero hallucinations...</p>
            </div>
          </div>
        ) : !tailoredResume || !workingJson ? (
          <div className="p-12 text-center text-red-400 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <p>Failed to load tailored resume version. Please try again.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden p-6">
            {/* VIEW TAB 1: STRUCTURED EDITOR */}
            {viewTab === 'editor' && (
              <StructuredResumeEditor
                tailoredJson={workingJson}
                onChange={(updated) => setWorkingJson(updated)}
                isReadOnly={isFinalized}
              />
            )}

            {/* VIEW TAB 2: FACT-GUARD AUDIT */}
            {viewTab === 'factguard' && (
              <div className="h-full overflow-y-auto space-y-4 text-xs">
                <div className="glass-panel p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">Fact-Guard Verification Audit</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {verifiedCount} Verified Master Claims
                      </span>
                      {flaggedCount > 0 && (
                        <span className="px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                          {flaggedCount} Flagged Items
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    Peachy Fact-Guard audits every single bullet point, employer name, and technical skill against your Master Profile to guarantee <strong className="text-emerald-300">zero AI hallucinations</strong>.
                  </p>

                  <div className="space-y-2 pt-2">
                    {tailoredResume.fact_guard_flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-start space-x-3 ${
                          flag.status === 'flagged'
                            ? 'bg-red-500/10 border-red-500/30 text-red-300'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {flag.status === 'flagged' ? (
                          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <p className="font-bold">
                            [{flag.field.toUpperCase()}] "{flag.claim}"
                          </p>
                          <p className="text-slate-300">{flag.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB 3: LIVE ATS RESUME PREVIEW */}
            {viewTab === 'preview' && (
              <div className="h-full overflow-y-auto bg-white text-black p-8 rounded-xl font-sans shadow-inner max-w-3xl mx-auto space-y-4">
                {/* Header Name & Contact */}
                <div className="text-center border-b border-slate-900 pb-3">
                  <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
                    {workingJson.contact?.name || 'Candidate Name'}
                  </h1>
                  <p className="text-xs text-slate-700 mt-1 space-x-2">
                    {workingJson.contact?.location && <span>{workingJson.contact.location} •</span>}
                    {workingJson.contact?.phone && <span>{workingJson.contact.phone} •</span>}
                    {workingJson.contact?.email && <span>{workingJson.contact.email} •</span>}
                    {workingJson.contact?.linkedin_url && <span>{workingJson.contact.linkedin_url}</span>}
                  </p>
                </div>

                {/* Summary */}
                {workingJson.visibility?.summary !== false && workingJson.summary && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-400 mb-1 text-black">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-slate-800 leading-relaxed">{workingJson.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {workingJson.visibility?.skills !== false && workingJson.skills && workingJson.skills.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-400 mb-1 text-black">
                      Technical Skills
                    </h2>
                    <p className="text-xs text-slate-800 font-medium">{workingJson.skills.join(' • ')}</p>
                  </div>
                )}

                {/* Experience */}
                {workingJson.visibility?.experiences !== false && (workingJson.experiences || []).length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-400 mb-2 text-black">
                      Professional Experience
                    </h2>
                    <div className="space-y-3">
                      {workingJson.experiences.map((exp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-black">
                            <span>{exp.role} — {exp.company}</span>
                            <span className="font-normal text-slate-700">{exp.start_date} – {exp.end_date || 'Present'}</span>
                          </div>
                          <ul className="list-disc pl-5 text-xs text-slate-800 space-y-1">
                            {exp.bullets.map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {workingJson.visibility?.education !== false && (workingJson.education || []).length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-400 mb-1 text-black">
                      Education
                    </h2>
                    {workingJson.education?.map((edu, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-800 font-medium">
                        <span>{edu.degree} — {edu.institution}</span>
                        <span>{edu.graduation_date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW TAB 4: VERSION HISTORY */}
            {viewTab === 'history' && (
              <div className="h-full overflow-y-auto space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
                  <h4 className="font-bold text-white uppercase tracking-wider">
                    Full Resume Version History for {job.company}
                  </h4>
                  <button
                    onClick={handleCreateNewVersion}
                    className="px-3 py-1.5 bg-peach-500 text-white rounded-lg font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Version</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {versionHistory.map((ver) => {
                    const isSelected = tailoredResume?.id === ver.id;
                    return (
                      <div
                        key={ver.id}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-peach-500/10 border-peach-500/40'
                            : 'bg-dark-bg/60 border-dark-border hover:border-slate-600'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">
                              Version #{ver.version_number}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                ver.status === 'finalized'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {ver.status === 'finalized' ? 'Finalized & Locked' : 'Draft'}
                            </span>
                            {isSelected && (
                              <span className="text-peach-400 font-bold text-[11px]">• Currently Active</span>
                            )}
                          </div>
                          <p className="text-dark-muted text-xs line-clamp-1">{ver.summary}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Created: {new Date(ver.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              handleSelectVersion(ver);
                              setViewTab('editor');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-dark-hover hover:bg-slate-700 text-white font-semibold text-xs"
                          >
                            Select & View
                          </button>

                          <button
                            onClick={async () => {
                              const filename = `Resume_${job.company.replace(/\s+/g, '_')}_v${ver.version_number}.pdf`;
                              await tailoringService.downloadResumePdf(ver.id, filename);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center space-x-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Actions */}
        {tailoredResume && (
          <div className="p-4 border-t border-dark-border/60 bg-dark-bg/60 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-dark-muted">Active Version #{tailoredResume.version_number}</span>
              <span className="text-slate-500">•</span>
              <span className={isFinalized ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {isFinalized ? 'Locked Version' : 'Editable Draft'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-dark-hover text-slate-300 font-semibold text-xs"
              >
                Close
              </button>

              {!isFinalized && (
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-dark-hover hover:bg-slate-700 text-white font-semibold text-xs flex items-center space-x-1.5 border border-dark-border"
                >
                  <Save className="w-4 h-4 text-peach-400" />
                  <span>{saving ? 'Saving...' : 'Save Draft Edits'}</span>
                </button>
              )}

              <button
                onClick={handleFinalize}
                disabled={saving || isFinalized}
                className="px-5 py-2 rounded-lg bg-peach-500 hover:bg-peach-600 text-white font-semibold text-xs shadow-glow-peach flex items-center space-x-1.5 disabled:opacity-60"
              >
                {isFinalized ? <Lock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>{isFinalized ? 'Version Finalized & Locked' : 'Finalize & Lock Version'}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs shadow-glow-cyan flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download ATS PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
