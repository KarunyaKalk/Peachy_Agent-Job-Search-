import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { MasterProfile } from '../types/profile';
import { profileService } from '../services/profile';

import { ContactSummarySection } from '../components/Profile/ContactSummarySection';
import { ExperienceSection } from '../components/Profile/ExperienceSection';
import { SkillsSection } from '../components/Profile/SkillsSection';
import { ProjectsSection } from '../components/Profile/ProjectsSection';
import { EducationCertSection } from '../components/Profile/EducationCertSection';
import { JobPreferencesSection } from '../components/Profile/JobPreferencesSection';

import {
  UserCheck,
  Briefcase,
  Wrench,
  FolderGit2,
  GraduationCap,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const MasterProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'contact' | 'experience' | 'skills' | 'projects' | 'education' | 'preferences'
  >('contact');

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Compute profile completeness score (0 - 100%)
  const computeCompleteness = (p: MasterProfile | null): number => {
    if (!p) return 0;
    let score = 0;

    if (p.summary && p.summary.length > 20) score += 20;
    if (p.phone || p.location) score += 10;
    if (p.experiences && p.experiences.length > 0) score += 25;
    if (p.skills && p.skills.length >= 3) score += 20;
    if (p.projects && p.projects.length > 0) score += 10;
    if (p.education && p.education.length > 0) score += 5;
    if (p.preferences && p.preferences.target_roles.length > 0) score += 10;

    return Math.min(score, 100);
  };

  const completeness = computeCompleteness(profile);

  const tabs = [
    { id: 'contact', name: 'Contact & Summary', icon: UserCheck },
    { id: 'experience', name: 'Work Experience', icon: Briefcase, badge: profile?.experiences?.length ? `${profile.experiences.length}` : undefined },
    { id: 'skills', name: 'Skills Inventory', icon: Wrench, badge: profile?.skills?.length ? `${profile.skills.length}` : undefined },
    { id: 'projects', name: 'Projects', icon: FolderGit2 },
    { id: 'education', name: 'Education & Certs', icon: GraduationCap },
    { id: 'preferences', name: 'Job Preferences', icon: Target, highlight: true },
  ];

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Master Profile & Resume Data Model"
        subtitle="Single source of truth for work experience, skills, bullet variants, and job search preferences."
      />

      {loading ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-peach-500/20 border-t-peach-500 rounded-full animate-spin"></div>
          <p className="text-xs text-dark-muted font-medium animate-pulse">Loading master profile...</p>
        </div>
      ) : !profile ? (
        <div className="glass-panel p-8 text-center text-red-400 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p>Failed to load master profile data. Please refresh.</p>
        </div>
      ) : (
        <>
          {/* Profile Completeness & Status Banner */}
          <div className="glass-panel p-5 border border-peach-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-dark-border" fill="transparent" />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-peach-500 transition-all duration-1000 ease-out"
                    fill="transparent"
                    strokeDasharray={138}
                    strokeDashoffset={138 - (138 * completeness) / 100}
                  />
                </svg>
                <span className="absolute font-mono font-extrabold text-xs text-white">{completeness}%</span>
              </div>

              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Master Profile Status:</span>
                  <span className={completeness >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                    {completeness >= 80 ? 'Ready for AI Tailoring' : 'Incomplete Data'}
                  </span>
                </h2>
                <p className="text-xs text-dark-muted">
                  All generated resumes strictly derive from this truthful master dataset with zero hallucinations.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-peach-500/10 text-peach-400 border border-peach-500/20 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fact-Guard Active</span>
              </span>
            </div>
          </div>

          {/* Section Tabs Navigation */}
          <div className="flex items-center space-x-1 border-b border-dark-border overflow-x-auto pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-peach-500 text-peach-400 bg-peach-500/10'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-dark-hover/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-dark-bg text-dark-muted border border-dark-border text-[10px] font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Viewport */}
          <div className="pt-2">
            {activeTab === 'contact' && (
              <ContactSummarySection profile={profile} onUpdate={setProfile} />
            )}
            {activeTab === 'experience' && (
              <ExperienceSection profile={profile} onUpdate={setProfile} />
            )}
            {activeTab === 'skills' && (
              <SkillsSection profile={profile} onUpdate={setProfile} />
            )}
            {activeTab === 'projects' && (
              <ProjectsSection profile={profile} onUpdate={setProfile} />
            )}
            {activeTab === 'education' && (
              <EducationCertSection profile={profile} onUpdate={setProfile} />
            )}
            {activeTab === 'preferences' && (
              <JobPreferencesSection profile={profile} onUpdate={setProfile} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
