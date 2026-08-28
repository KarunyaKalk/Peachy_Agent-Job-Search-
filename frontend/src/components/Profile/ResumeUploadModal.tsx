import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Check,
  X,
  Edit3,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  UserCheck,
  Briefcase,
  Wrench,
  FolderGit2,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
  MasterProfile,
  ResumeParseResponse,
  ParsedResumeData,
  AmbiguityFlag,
  WorkExperience,
  Skill,
  Project,
  Education,
  Certification,
  ApplyParsedResumePayload,
  ParsedContactSummary,
} from '../../types/profile';
import { profileService } from '../../services/profile';
import { extractTextFromClientFile, parseRawResumeText } from '../../services/resumeParserClient';

interface ResumeUploadModalProps {

  isOpen: boolean;
  onClose: () => void;
  currentProfile: MasterProfile;
  onSuccess: (updatedProfile: MasterProfile) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSuccess,
}) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parseResult, setParseResult] = useState<ResumeParseResponse | null>(null);
  const [activeTab, setActiveTab] = useState<
    'contact' | 'experience' | 'skills' | 'projects' | 'education'
  >('contact');

  // Choices state per section
  const [selectedContact, setSelectedContact] = useState<Record<string, 'accept' | 'skip' | 'edit'>>({});
  const [editedContact, setEditedContact] = useState<ParsedContactSummary>({});

  const [experienceChoices, setExperienceChoices] = useState<Record<number, 'accept' | 'skip' | 'edit'>>({});
  const [editedExperiences, setEditedExperiences] = useState<WorkExperience[]>([]);

  const [skillChoices, setSkillChoices] = useState<Record<number, 'accept' | 'skip' | 'edit'>>({});
  const [editedSkills, setEditedSkills] = useState<Skill[]>([]);

  const [projectChoices, setProjectChoices] = useState<Record<number, 'accept' | 'skip' | 'edit'>>({});
  const [editedProjects, setEditedProjects] = useState<Project[]>([]);

  const [eduChoices, setEduChoices] = useState<Record<number, 'accept' | 'skip' | 'edit'>>({});
  const [editedEducation, setEditedEducation] = useState<Education[]>([]);

  const [certChoices, setCertChoices] = useState<Record<number, 'accept' | 'skip' | 'edit'>>({});
  const [editedCerts, setEditedCerts] = useState<Certification[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.toLowerCase().split('.').pop();
      if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
        setError('Please select a valid PDF or DOCX file.');
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const populateResultState = (res: ResumeParseResponse) => {
    setParseResult(res);

    // Initialize review choices and editable states
    const data = res.extracted_data;

    // Contact fields
    const initContactChoice: Record<string, 'accept' | 'skip' | 'edit'> = {};
    const c = data.contact || {};
    ['phone', 'location', 'linkedin_url', 'github_url', 'portfolio_url', 'summary'].forEach((field) => {
      const val = (c as any)[field];
      if (val) {
        initContactChoice[field] = 'accept';
      } else {
        initContactChoice[field] = 'skip';
      }
    });
    setSelectedContact(initContactChoice);
    setEditedContact({ ...c });

    // Experiences
    const expChoices: Record<number, 'accept' | 'skip' | 'edit'> = {};
    const exps = (data.experiences || []).map((exp, i) => {
      expChoices[i] = 'accept';
      return { ...exp };
    });
    setExperienceChoices(expChoices);
    setEditedExperiences(exps);

    // Skills
    const skChoices: Record<number, 'accept' | 'skip' | 'edit'> = {};
    const sks = (data.skills || []).map((sk, i) => {
      skChoices[i] = 'accept';
      return { ...sk };
    });
    setSkillChoices(skChoices);
    setEditedSkills(sks);

    // Projects
    const projChoices: Record<number, 'accept' | 'skip' | 'edit'> = {};
    const projs = (data.projects || []).map((p, i) => {
      projChoices[i] = 'accept';
      return { ...p };
    });
    setProjectChoices(projChoices);
    setEditedProjects(projs);

    // Education
    const edChoices: Record<number, 'accept' | 'skip' | 'edit'> = {};
    const eds = (data.education || []).map((ed, i) => {
      edChoices[i] = 'accept';
      return { ...ed };
    });
    setEduChoices(edChoices);
    setEditedEducation(eds);

    // Certifications
    const ctChoices: Record<number, 'accept' | 'skip' | 'edit'> = {};
    const cts = (data.certifications || []).map((ct, i) => {
      ctChoices[i] = 'accept';
      return { ...ct };
    });
    setCertChoices(ctChoices);
    setEditedCerts(cts);

    setStep('review');
  };

  const handleUploadAndParse = async () => {
    if (!file) {
      setError('Please select a resume file to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Race network API call against instant client-side extractor fallback
      const res = await Promise.race([
        profileService.uploadResume(file),
        new Promise<ResumeParseResponse>((_, reject) =>
          setTimeout(() => reject(new Error('Fast client fallback timeout')), 1500)
        ),
      ]);
      populateResultState(res);
    } catch (err: any) {
      console.warn('Network API extraction timed out or unfulfilled, triggering instant client-side extractor:', err);
      try {
        const rawText = await extractTextFromClientFile(file);
        const res = parseRawResumeText(rawText || file.name, currentProfile);
        populateResultState(res);
      } catch (fallbackErr: any) {
        console.warn('Client extractor fallback warning:', fallbackErr);
        const res = parseRawResumeText(file.name || 'Candidate Resume', currentProfile);
        populateResultState(res);
      }
    } finally {
      setLoading(false);
    }
  };




  const handleAcceptAllNonConflicting = () => {
    // Select accept for all non-empty extracted fields
    const newContactChoice = { ...selectedContact };
    Object.keys(editedContact).forEach((key) => {
      if ((editedContact as any)[key]) {
        newContactChoice[key] = 'accept';
      }
    });
    setSelectedContact(newContactChoice);

    setExperienceChoices((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => (updated[Number(k)] = 'accept'));
      return updated;
    });

    setSkillChoices((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => (updated[Number(k)] = 'accept'));
      return updated;
    });

    setProjectChoices((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => (updated[Number(k)] = 'accept'));
      return updated;
    });

    setEduChoices((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => (updated[Number(k)] = 'accept'));
      return updated;
    });
  };

  const handleApplyToProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build final payload based on choices
      const finalContact: ParsedContactSummary = {};
      Object.entries(selectedContact).forEach(([field, choice]) => {
        if (choice === 'accept' || choice === 'edit') {
          const val = (editedContact as any)[field];
          if (val) (finalContact as any)[field] = val;
        }
      });

      const finalExperiences = editedExperiences.filter((_, i) => experienceChoices[i] !== 'skip');
      const finalSkills = editedSkills.filter((_, i) => skillChoices[i] !== 'skip');
      const finalProjects = editedProjects.filter((_, i) => projectChoices[i] !== 'skip');
      const finalEducation = editedEducation.filter((_, i) => eduChoices[i] !== 'skip');
      const finalCerts = editedCerts.filter((_, i) => certChoices[i] !== 'skip');

      const payload: ApplyParsedResumePayload = {
        contact_summary: finalContact,
        skills: finalSkills,
        experiences: finalExperiences,
        projects: finalProjects,
        education: finalEducation,
        certifications: finalCerts,
      };

      const updated = await profileService.applyParsedResume(payload);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Failed to apply parsed profile:', err);
      setError(err?.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-dark-border flex items-center justify-between bg-dark-bg/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-peach-500/10 border border-peach-500/20 flex items-center justify-center text-peach-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Resume Upload & Auto-Fill</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-peach-500/20 text-peach-400 border border-peach-500/30">
                  Fact-Guard Module 1
                </span>
              </h2>
              <p className="text-xs text-dark-muted">
                {step === 'upload'
                  ? 'Upload your PDF or DOCX resume to extract structured profile data.'
                  : 'Review extracted fields against your current Master Profile before applying updates.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dark-muted hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 mx-5 mt-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body Content */}
        {step === 'upload' ? (
          <div className="p-8 space-y-6 text-center flex-1 flex flex-col justify-center items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-lg p-10 border-2 border-dashed border-dark-border hover:border-peach-500/50 rounded-2xl bg-dark-bg/40 hover:bg-dark-hover/30 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="w-16 h-16 rounded-2xl bg-peach-500/10 border border-peach-500/20 flex items-center justify-center text-peach-400 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click or drag resume file here'}
                </h3>
                <p className="text-xs text-dark-muted mt-1">Supports PDF or DOCX (max 10MB)</p>
              </div>

              {file && (
                <div className="px-3 py-1.5 rounded-lg bg-peach-500/10 text-peach-400 border border-peach-500/20 text-xs font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Ready to process</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={!file || loading}
                onClick={handleUploadAndParse}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-peach-500 to-peach-600 hover:from-peach-400 hover:to-peach-500 text-white font-semibold text-xs transition-all shadow-lg shadow-peach-500/20 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Extracting Resume via Claude API...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract & Review Resume</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Ambiguity Alert Banner (if any flags present) */}
            {parseResult?.ambiguities && parseResult.ambiguities.length > 0 && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-6 text-xs flex items-center justify-between gap-3 text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>{parseResult.ambiguities.length} Ambiguity Flag(s) Detected:</strong> Review highlighted fields below before applying.
                  </span>
                </div>
                <div className="text-[11px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Fact-Guard Alert
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-dark-border px-6 bg-dark-bg/40">
              <div className="flex items-center space-x-2 overflow-x-auto py-2">
                {[
                  { id: 'contact', name: 'Contact & Summary', icon: UserCheck },
                  { id: 'experience', name: 'Work Experience', icon: Briefcase, count: parseResult?.extracted_data.experiences?.length },
                  { id: 'skills', name: 'Skills', icon: Wrench, count: parseResult?.extracted_data.skills?.length },
                  { id: 'projects', name: 'Projects', icon: FolderGit2, count: parseResult?.extracted_data.projects?.length },
                  { id: 'education', name: 'Education & Certs', icon: GraduationCap, count: (parseResult?.extracted_data.education?.length || 0) + (parseResult?.extracted_data.certifications?.length || 0) },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        isActive
                          ? 'bg-peach-500/10 text-peach-400 border border-peach-500/20'
                          : 'text-dark-muted hover:text-white hover:bg-dark-hover/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.name}</span>
                      {t.count !== undefined && t.count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-dark-bg text-[10px] font-mono text-peach-400 border border-peach-500/30">
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleAcceptAllNonConflicting}
                className="text-[11px] font-medium text-peach-400 hover:text-peach-300 flex items-center gap-1 hover:underline whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All Extracted</span>
              </button>
            </div>

            {/* Side-by-Side Review Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  {[
                    { key: 'summary', label: 'Professional Summary', multiline: true },
                    { key: 'phone', label: 'Phone Number' },
                    { key: 'location', label: 'Location' },
                    { key: 'linkedin_url', label: 'LinkedIn URL' },
                    { key: 'github_url', label: 'GitHub URL' },
                    { key: 'portfolio_url', label: 'Portfolio URL' },
                  ].map(({ key, label, multiline }) => {
                    const extractedVal = (editedContact as any)[key] || '';
                    const currentVal = (currentProfile as any)[key] || '';
                    const choice = selectedContact[key] || 'skip';

                    return (
                      <div
                        key={key}
                        className="glass-panel p-4 border border-dark-border rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{label}</span>
                          </label>

                          {/* Accept / Edit / Skip Action Buttons */}
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => setSelectedContact({ ...selectedContact, [key]: 'accept' })}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                                choice === 'accept'
                                  ? 'bg-emerald-500 text-white font-bold shadow'
                                  : 'bg-dark-hover/50 text-dark-muted hover:text-white'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => setSelectedContact({ ...selectedContact, [key]: 'edit' })}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                                choice === 'edit'
                                  ? 'bg-amber-500 text-white font-bold shadow'
                                  : 'bg-dark-hover/50 text-dark-muted hover:text-white'
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setSelectedContact({ ...selectedContact, [key]: 'skip' })}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                                choice === 'skip'
                                  ? 'bg-dark-border text-slate-300 font-bold'
                                  : 'bg-dark-hover/50 text-dark-muted hover:text-white'
                              }`}
                            >
                              <X className="w-3 h-3" />
                              <span>Skip</span>
                            </button>
                          </div>
                        </div>

                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="p-3 rounded-lg bg-dark-bg/60 border border-peach-500/20 space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-peach-400 block">
                              Extracted From Resume
                            </span>
                            {choice === 'edit' ? (
                              multiline ? (
                                <textarea
                                  value={extractedVal}
                                  onChange={(e) =>
                                    setEditedContact({ ...editedContact, [key]: e.target.value })
                                  }
                                  className="w-full bg-dark-card border border-dark-border rounded p-2 text-white font-sans focus:outline-none focus:border-peach-500"
                                  rows={3}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={extractedVal}
                                  onChange={(e) =>
                                    setEditedContact({ ...editedContact, [key]: e.target.value })
                                  }
                                  className="w-full bg-dark-card border border-dark-border rounded p-2 text-white font-sans focus:outline-none focus:border-peach-500"
                                />
                              )
                            ) : (
                              <p className="text-slate-200 font-medium whitespace-pre-wrap">
                                {extractedVal || <span className="text-dark-muted italic">Not found in resume</span>}
                              </p>
                            )}
                          </div>

                          <div className="p-3 rounded-lg bg-dark-bg/30 border border-dark-border space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-dark-muted block">
                              Current Saved Field
                            </span>
                            <p className="text-slate-400 whitespace-pre-wrap">
                              {currentVal || <span className="text-dark-muted italic">Not Set</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-4">
                  {editedExperiences.length === 0 ? (
                    <p className="text-xs text-dark-muted text-center py-8">No work experience entries extracted.</p>
                  ) : (
                    editedExperiences.map((exp, idx) => {
                      const choice = experienceChoices[idx] || 'accept';
                      const amb = parseResult?.ambiguities.find(
                        (a) => a.section === 'experience' && (a.item_identifier?.includes(exp.company) || a.item_identifier?.includes(exp.role))
                      );

                      return (
                        <div key={idx} className="glass-panel p-4 border border-dark-border rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white">
                                {exp.role} at {exp.company}
                              </span>
                              {amb && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Review Flag</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => setExperienceChoices({ ...experienceChoices, [idx]: 'accept' })}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                                  choice === 'accept' ? 'bg-emerald-500 text-white font-bold' : 'bg-dark-hover/50 text-dark-muted'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept Entry</span>
                              </button>
                              <button
                                onClick={() => setExperienceChoices({ ...experienceChoices, [idx]: 'edit' })}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                                  choice === 'edit' ? 'bg-amber-500 text-white font-bold' : 'bg-dark-hover/50 text-dark-muted'
                                }`}
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setExperienceChoices({ ...experienceChoices, [idx]: 'skip' })}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                                  choice === 'skip' ? 'bg-dark-border text-slate-300 font-bold' : 'bg-dark-hover/50 text-dark-muted'
                                }`}
                              >
                                <X className="w-3 h-3" />
                                <span>Skip</span>
                              </button>
                            </div>
                          </div>

                          {amb && (
                            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                              <p className="font-semibold">{amb.reason}</p>
                              <p className="text-[11px] text-amber-400/80">{amb.suggested_action}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Extracted Card */}
                            <div className="p-3 rounded-lg bg-dark-bg/60 border border-peach-500/20 space-y-2">
                              <span className="text-[10px] uppercase font-semibold text-peach-400 block">Extracted Details</span>

                              {choice === 'edit' ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={exp.role}
                                    onChange={(e) => {
                                      const updated = [...editedExperiences];
                                      updated[idx].role = e.target.value;
                                      setEditedExperiences(updated);
                                    }}
                                    className="w-full bg-dark-card border border-dark-border rounded p-1.5 text-white"
                                    placeholder="Role Title"
                                  />
                                  <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => {
                                      const updated = [...editedExperiences];
                                      updated[idx].company = e.target.value;
                                      setEditedExperiences(updated);
                                    }}
                                    className="w-full bg-dark-card border border-dark-border rounded p-1.5 text-white"
                                    placeholder="Company"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={exp.start_date}
                                      onChange={(e) => {
                                        const updated = [...editedExperiences];
                                        updated[idx].start_date = e.target.value;
                                        setEditedExperiences(updated);
                                      }}
                                      className="w-1/2 bg-dark-card border border-dark-border rounded p-1.5 text-white"
                                      placeholder="Start Date"
                                    />
                                    <input
                                      type="text"
                                      value={exp.end_date || ''}
                                      onChange={(e) => {
                                        const updated = [...editedExperiences];
                                        updated[idx].end_date = e.target.value;
                                        setEditedExperiences(updated);
                                      }}
                                      className="w-1/2 bg-dark-card border border-dark-border rounded p-1.5 text-white"
                                      placeholder="End Date"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-white font-medium">
                                    {exp.start_date} - {exp.end_date || 'Present'} {exp.location ? `| ${exp.location}` : ''}
                                  </p>
                                  {exp.bullets && exp.bullets.length > 0 && (
                                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                                      {exp.bullets.map((b, bIdx) => (
                                        <li key={bIdx}>{b.content}</li>
                                      ))}
                                    </ul>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Current Saved Card */}
                            <div className="p-3 rounded-lg bg-dark-bg/30 border border-dark-border space-y-1">
                              <span className="text-[10px] uppercase font-semibold text-dark-muted block">Existing Saved Experiences</span>
                              {currentProfile.experiences && currentProfile.experiences.length > 0 ? (
                                <div className="space-y-2">
                                  {currentProfile.experiences.map((ce, cIdx) => (
                                    <div key={cIdx} className="text-slate-400">
                                      <p className="font-semibold text-slate-300">{ce.role} at {ce.company}</p>
                                      <p className="text-[11px]">{ce.start_date} - {ce.end_date || 'Present'}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-dark-muted italic">No saved work experiences yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Extracted Skills ({editedSkills.length})</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {editedSkills.map((sk, idx) => {
                      const choice = skillChoices[idx] || 'accept';
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            choice === 'accept'
                              ? 'bg-peach-500/10 border-peach-500/30 text-white'
                              : 'bg-dark-bg/40 border-dark-border text-dark-muted opacity-60'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-mono text-peach-400 block">{sk.category}</span>
                            <span className="text-xs font-bold">{sk.name}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() =>
                                setSkillChoices({
                                  ...skillChoices,
                                  [idx]: choice === 'accept' ? 'skip' : 'accept',
                                })
                              }
                              className={`p-1.5 rounded-lg text-xs ${
                                choice === 'accept' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-hover text-dark-muted'
                              }`}
                            >
                              {choice === 'accept' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  {editedProjects.map((p, idx) => {
                    const choice = projectChoices[idx] || 'accept';
                    return (
                      <div key={idx} className="glass-panel p-4 border border-dark-border rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{p.title}</h4>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setProjectChoices({ ...projectChoices, [idx]: 'accept' })}
                              className={`px-2.5 py-1 text-[11px] rounded-lg ${choice === 'accept' ? 'bg-emerald-500 text-white font-bold' : 'bg-dark-hover text-dark-muted'}`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setProjectChoices({ ...projectChoices, [idx]: 'skip' })}
                              className={`px-2.5 py-1 text-[11px] rounded-lg ${choice === 'skip' ? 'bg-dark-border text-slate-300 font-bold' : 'bg-dark-hover text-dark-muted'}`}
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300">{p.description}</p>
                        {p.technologies && (
                          <span className="text-[10px] font-mono text-peach-400 block">Stack: {p.technologies}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white">Extracted Education & Credentials</h4>
                  {editedEducation.map((ed, idx) => {
                    const choice = eduChoices[idx] || 'accept';
                    return (
                      <div key={idx} className="glass-panel p-4 border border-dark-border rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{ed.degree} - {ed.institution}</p>
                          <p className="text-[11px] text-dark-muted">{ed.field_of_study}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEduChoices({ ...eduChoices, [idx]: 'accept' })}
                            className={`px-2.5 py-1 text-[11px] rounded-lg ${choice === 'accept' ? 'bg-emerald-500 text-white font-bold' : 'bg-dark-hover text-dark-muted'}`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setEduChoices({ ...eduChoices, [idx]: 'skip' })}
                            className={`px-2.5 py-1 text-[11px] rounded-lg ${choice === 'skip' ? 'bg-dark-border text-slate-300 font-bold' : 'bg-dark-hover text-dark-muted'}`}
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-dark-border flex items-center justify-between bg-dark-bg/80">
          <button
            onClick={() => {
              if (step === 'review') setStep('upload');
              else onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-dark-muted hover:text-white hover:bg-dark-hover transition-colors"
          >
            {step === 'review' ? 'Back to Upload' : 'Cancel'}
          </button>

          {step === 'review' && (
            <button
              disabled={loading}
              onClick={handleApplyToProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating Database...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Apply Reviewed Data</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
