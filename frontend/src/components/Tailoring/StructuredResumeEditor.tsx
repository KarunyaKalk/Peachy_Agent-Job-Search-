import React, { useState } from 'react';
import { TailoredJson, TailoredExperience, TailoredProject, TailoredEducation, ContactInfo } from '../../types/tailoring';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Edit3,
  User,
  FileText,
  Wrench,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

interface Props {
  tailoredJson: TailoredJson;
  onChange: (updatedJson: TailoredJson) => void;
  isReadOnly?: boolean;
}

export const StructuredResumeEditor: React.FC<Props> = ({ tailoredJson, onChange, isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'visibility'>('experience');

  const contact: ContactInfo = tailoredJson.contact || {
    name: 'Karunya Kalkhundiya',
    phone: '',
    email: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  };

  const visibility = tailoredJson.visibility || {
    summary: true,
    skills: true,
    experiences: true,
    projects: true,
    education: true,
  };

  const updateContact = (field: keyof ContactInfo, val: string) => {
    onChange({
      ...tailoredJson,
      contact: {
        ...contact,
        [field]: val,
      },
    });
  };

  const updateSummary = (val: string) => {
    onChange({
      ...tailoredJson,
      summary: val,
    });
  };

  const updateVisibility = (key: keyof typeof visibility) => {
    onChange({
      ...tailoredJson,
      visibility: {
        ...visibility,
        [key]: !visibility[key],
      },
    });
  };

  // --- Skills handlers ---
  const [newSkillText, setNewSkillText] = useState('');
  const addSkill = () => {
    if (!newSkillText.trim()) return;
    const skills = [...(tailoredJson.skills || []), newSkillText.trim()];
    onChange({ ...tailoredJson, skills });
    setNewSkillText('');
  };

  const editSkill = (idx: number, text: string) => {
    const skills = [...(tailoredJson.skills || [])];
    skills[idx] = text;
    onChange({ ...tailoredJson, skills });
  };

  const removeSkill = (idx: number) => {
    const skills = (tailoredJson.skills || []).filter((_, i) => i !== idx);
    onChange({ ...tailoredJson, skills });
  };

  const moveSkill = (idx: number, dir: -1 | 1) => {
    const skills = [...(tailoredJson.skills || [])];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= skills.length) return;
    const temp = skills[idx];
    skills[idx] = skills[targetIdx];
    skills[targetIdx] = temp;
    onChange({ ...tailoredJson, skills });
  };

  // --- Experience Bullets handlers ---
  const moveBullet = (expIdx: number, bulletIdx: number, dir: -1 | 1) => {
    const exps = [...(tailoredJson.experiences || [])];
    const exp = { ...exps[expIdx] };
    const bullets = [...exp.bullets];
    const targetIdx = bulletIdx + dir;
    if (targetIdx < 0 || targetIdx >= bullets.length) return;
    const temp = bullets[bulletIdx];
    bullets[bulletIdx] = bullets[targetIdx];
    bullets[targetIdx] = temp;
    exp.bullets = bullets;
    exps[expIdx] = exp;
    onChange({ ...tailoredJson, experiences: exps });
  };

  const editBullet = (expIdx: number, bulletIdx: number, text: string) => {
    const exps = [...(tailoredJson.experiences || [])];
    const exp = { ...exps[expIdx] };
    const bullets = [...exp.bullets];
    bullets[bulletIdx] = text;
    exp.bullets = bullets;
    exps[expIdx] = exp;
    onChange({ ...tailoredJson, experiences: exps });
  };

  const deleteBullet = (expIdx: number, bulletIdx: number) => {
    const exps = [...(tailoredJson.experiences || [])];
    const exp = { ...exps[expIdx] };
    exp.bullets = exp.bullets.filter((_, i) => i !== bulletIdx);
    exps[expIdx] = exp;
    onChange({ ...tailoredJson, experiences: exps });
  };

  const addBullet = (expIdx: number) => {
    const exps = [...(tailoredJson.experiences || [])];
    const exp = { ...exps[expIdx] };
    exp.bullets = [...exp.bullets, 'Newly tailored accomplishment bullet point aligning with job requirements.'];
    exps[expIdx] = exp;
    onChange({ ...tailoredJson, experiences: exps });
  };

  const editExperienceHeader = (expIdx: number, field: keyof TailoredExperience, val: string) => {
    const exps = [...(tailoredJson.experiences || [])];
    const exp = { ...exps[expIdx], [field]: val };
    exps[expIdx] = exp;
    onChange({ ...tailoredJson, experiences: exps });
  };

  // --- Project Bullet handlers ---
  const moveProjectBullet = (pIdx: number, bulletIdx: number, dir: -1 | 1) => {
    const projs = [...(tailoredJson.projects || [])];
    const p = { ...projs[pIdx] };
    const bullets = [...(p.bullets || [])];
    const targetIdx = bulletIdx + dir;
    if (targetIdx < 0 || targetIdx >= bullets.length) return;
    const temp = bullets[bulletIdx];
    bullets[bulletIdx] = bullets[targetIdx];
    bullets[targetIdx] = temp;
    p.bullets = bullets;
    projs[pIdx] = p;
    onChange({ ...tailoredJson, projects: projs });
  };

  const editProjectBullet = (pIdx: number, bulletIdx: number, text: string) => {
    const projs = [...(tailoredJson.projects || [])];
    const p = { ...projs[pIdx] };
    const bullets = [...(p.bullets || [])];
    bullets[bulletIdx] = text;
    p.bullets = bullets;
    projs[pIdx] = p;
    onChange({ ...tailoredJson, projects: projs });
  };

  const deleteProjectBullet = (pIdx: number, bulletIdx: number) => {
    const projs = [...(tailoredJson.projects || [])];
    const p = { ...projs[pIdx] };
    p.bullets = (p.bullets || []).filter((_, i) => i !== bulletIdx);
    projs[pIdx] = p;
    onChange({ ...tailoredJson, projects: projs });
  };

  const addProjectBullet = (pIdx: number) => {
    const projs = [...(tailoredJson.projects || [])];
    const p = { ...projs[pIdx] };
    p.bullets = [...(p.bullets || []), 'Built high throughput API module.'];
    projs[pIdx] = p;
    onChange({ ...tailoredJson, projects: projs });
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg/40 rounded-xl border border-dark-border overflow-hidden">
      {/* Editor Top Navigation Tabs */}
      <div className="flex items-center space-x-1 p-2 bg-dark-card border-b border-dark-border overflow-x-auto shrink-0 text-xs">
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
            activeTab === 'experience'
              ? 'bg-peach-500/20 text-peach-300 border border-peach-500/30'
              : 'text-slate-400 hover:text-white hover:bg-dark-hover'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Work Experience</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
            activeTab === 'skills'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-dark-hover'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Skills</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
            activeTab === 'summary'
              ? 'bg-peach-500/20 text-peach-300 border border-peach-500/30'
              : 'text-slate-400 hover:text-white hover:bg-dark-hover'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
            activeTab === 'contact'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-dark-hover'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Contact Info</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
            activeTab === 'projects'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-dark-hover'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab('education')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
            activeTab === 'education'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-dark-hover'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education</span>
        </button>

        <button
          onClick={() => setActiveTab('visibility')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
            activeTab === 'visibility'
              ? 'bg-slate-700 text-white border border-slate-600'
              : 'text-slate-400 hover:text-white hover:bg-dark-hover'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Section Visibility</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
        {/* WORK EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
              <h4 className="font-bold text-white uppercase tracking-wider">Tailored Work Experience & Bullets</h4>
              <span className="text-dark-muted">Reorder bullets or hand-edit text</span>
            </div>

            {(tailoredJson.experiences || []).map((exp, expIdx) => (
              <div key={expIdx} className="glass-panel p-4 space-y-3 border-dark-border">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Role Title</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={exp.role}
                      onChange={(e) => editExperienceHeader(expIdx, 'role', e.target.value)}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Company</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={exp.company}
                      onChange={(e) => editExperienceHeader(expIdx, 'company', e.target.value)}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-peach-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Start Date</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={exp.start_date}
                      onChange={(e) => editExperienceHeader(expIdx, 'start_date', e.target.value)}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">End Date</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={exp.end_date || 'Present'}
                      onChange={(e) => editExperienceHeader(expIdx, 'end_date', e.target.value)}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Experience Bullets</span>
                    {!isReadOnly && (
                      <button
                        onClick={() => addBullet(expIdx)}
                        className="px-2 py-1 bg-peach-500/10 hover:bg-peach-500/20 text-peach-300 border border-peach-500/30 rounded text-[11px] flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    )}
                  </div>

                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start space-x-2 bg-dark-bg/60 p-2 rounded-lg border border-dark-border/60">
                      <div className="flex flex-col space-y-1 pt-1 shrink-0">
                        {!isReadOnly && (
                          <>
                            <button
                              disabled={bIdx === 0}
                              onClick={() => moveBullet(expIdx, bIdx, -1)}
                              className="p-1 rounded bg-dark-hover hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                              title="Move Bullet Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={bIdx === exp.bullets.length - 1}
                              onClick={() => moveBullet(expIdx, bIdx, 1)}
                              className="p-1 rounded bg-dark-hover hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                              title="Move Bullet Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>

                      <textarea
                        disabled={isReadOnly}
                        rows={2}
                        value={bullet}
                        onChange={(e) => editBullet(expIdx, bIdx, e.target.value)}
                        className="flex-1 p-2 bg-transparent border border-dark-border/40 focus:border-peach-500 rounded text-slate-200 resize-y leading-relaxed text-xs focus:outline-none"
                      />

                      {!isReadOnly && (
                        <button
                          onClick={() => deleteBullet(expIdx, bIdx)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 shrink-0"
                          title="Delete Bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
              <h4 className="font-bold text-white uppercase tracking-wider">JD-Aligned Technical Skills</h4>
              <span className="text-dark-muted">Reorder or edit skill tags</span>
            </div>

            {!isReadOnly && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add new skill (e.g. AWS, Docker, Kubernetes)..."
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(tailoredJson.skills || []).map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between bg-dark-bg/80 border border-dark-border p-2 rounded-lg">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={skill}
                    onChange={(e) => editSkill(idx, e.target.value)}
                    className="bg-transparent text-cyan-300 font-semibold focus:outline-none flex-1"
                  />
                  {!isReadOnly && (
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveSkill(idx, -1)}
                        className="p-1 rounded hover:bg-dark-hover text-slate-400 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === (tailoredJson.skills || []).length - 1}
                        onClick={() => moveSkill(idx, 1)}
                        className="p-1 rounded hover:bg-dark-hover text-slate-400 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeSkill(idx)}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-dark-border/60">
              Tailored Professional Summary
            </h4>
            <p className="text-dark-muted">Edit the 2-3 sentence overview targeting the employer's core needs:</p>
            <textarea
              disabled={isReadOnly}
              rows={5}
              value={tailoredJson.summary}
              onChange={(e) => updateSummary(e.target.value)}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white leading-relaxed focus:outline-none focus:border-peach-500"
            />
          </div>
        )}

        {/* CONTACT INFO TAB */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-dark-border/60">
              Candidate Contact Information (ATS Header Flow)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-dark-muted block mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={contact.name || ''}
                  onChange={(e) => updateContact('name', e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white font-bold"
                />
              </div>
              <div>
                <label className="text-dark-muted block mb-1">Email</label>
                <input
                  type="email"
                  disabled={isReadOnly}
                  value={contact.email || ''}
                  onChange={(e) => updateContact('email', e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-dark-muted block mb-1">Phone</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={contact.phone || ''}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-dark-muted block mb-1">Location</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={contact.location || ''}
                  onChange={(e) => updateContact('location', e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-dark-muted block mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={contact.linkedin_url || ''}
                  onChange={(e) => updateContact('linkedin_url', e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-dark-muted block mb-1">GitHub URL</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={contact.github_url || ''}
                  onChange={(e) => updateContact('github_url', e.target.value)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-dark-border/60">
              Technical Projects
            </h4>
            {(tailoredJson.projects || []).map((proj, pIdx) => (
              <div key={pIdx} className="glass-panel p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Project Title</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={proj.title}
                      onChange={(e) => {
                        const projs = [...(tailoredJson.projects || [])];
                        projs[pIdx] = { ...proj, title: e.target.value };
                        onChange({ ...tailoredJson, projects: projs });
                      }}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Tech Stack</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={proj.tech_stack || ''}
                      onChange={(e) => {
                        const projs = [...(tailoredJson.projects || [])];
                        projs[pIdx] = { ...proj, tech_stack: e.target.value };
                        onChange({ ...tailoredJson, projects: projs });
                      }}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-emerald-300"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Project Bullets</span>
                    {!isReadOnly && (
                      <button
                        onClick={() => addProjectBullet(pIdx)}
                        className="px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded text-[11px] flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    )}
                  </div>

                  {(proj.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center space-x-2 bg-dark-bg/60 p-2 rounded border border-dark-border/60">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={b}
                        onChange={(e) => editProjectBullet(pIdx, bIdx, e.target.value)}
                        className="flex-1 p-1 bg-transparent border-b border-dark-border text-slate-200 text-xs focus:outline-none"
                      />
                      {!isReadOnly && (
                        <div className="flex items-center space-x-1">
                          <button
                            disabled={bIdx === 0}
                            onClick={() => moveProjectBullet(pIdx, bIdx, -1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={bIdx === (proj.bullets || []).length - 1}
                            onClick={() => moveProjectBullet(pIdx, bIdx, 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteProjectBullet(pIdx, bIdx)}
                            className="p-1 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-dark-border/60">
              Education & Degrees
            </h4>
            {(tailoredJson.education || []).map((edu, edIdx) => (
              <div key={edIdx} className="glass-panel p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Degree</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={edu.degree}
                      onChange={(e) => {
                        const edus = [...(tailoredJson.education || [])];
                        edus[edIdx] = { ...edu, degree: e.target.value };
                        onChange({ ...tailoredJson, education: edus });
                      }}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Institution</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={edu.institution}
                      onChange={(e) => {
                        const edus = [...(tailoredJson.education || [])];
                        edus[edIdx] = { ...edu, institution: e.target.value };
                        onChange({ ...tailoredJson, education: edus });
                      }}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-amber-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Field of Study</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={edu.field_of_study || ''}
                      onChange={(e) => {
                        const edus = [...(tailoredJson.education || [])];
                        edus[edIdx] = { ...edu, field_of_study: e.target.value };
                        onChange({ ...tailoredJson, education: edus });
                      }}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-dark-muted block mb-0.5">Graduation Year</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={edu.graduation_date || ''}
                      onChange={(e) => {
                        const edus = [...(tailoredJson.education || [])];
                        edus[edIdx] = { ...edu, graduation_date: e.target.value };
                        onChange({ ...tailoredJson, education: edus });
                      }}
                      className="w-full p-2 bg-dark-bg border border-dark-border rounded text-slate-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION VISIBILITY TAB */}
        {activeTab === 'visibility' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-dark-border/60">
              Toggle Resume Section Visibility
            </h4>
            <div className="space-y-2">
              {[
                { key: 'summary' as const, label: 'Professional Summary' },
                { key: 'skills' as const, label: 'Technical Skills' },
                { key: 'experiences' as const, label: 'Work Experience' },
                { key: 'projects' as const, label: 'Projects' },
                { key: 'education' as const, label: 'Education' },
              ].map((sec) => (
                <div key={sec.key} className="flex items-center justify-between p-3 bg-dark-bg border border-dark-border rounded-lg">
                  <span className="font-semibold text-white">{sec.label}</span>
                  <button
                    disabled={isReadOnly}
                    onClick={() => updateVisibility(sec.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                      visibility[sec.key]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-dark-hover text-slate-500 border border-dark-border'
                    }`}
                  >
                    {visibility[sec.key] ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
