import { api } from './api';
import { mockApiEngine } from './mockApi';
import {
  MasterProfile,
  WorkExperience,
  ExperienceBullet,
  BulletVariant,
  Skill,
  Project,
  Education,
  Certification,
  JobPreferences,
  ResumeParseResponse,
  ApplyParsedResumePayload,
} from '../types/profile';

export const profileService = {
  // Resume upload & auto-fill parsing
  uploadResume: async (file: File): Promise<ResumeParseResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<ResumeParseResponse>('/profile/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 1500,
      });
      return response.data;
    } catch {
      return await mockApiEngine.uploadResume(file);
    }
  },


  applyParsedResume: async (payload: ApplyParsedResumePayload): Promise<MasterProfile> => {
    try {
      const response = await api.post<MasterProfile>('/profile/apply-parsed-resume', payload);
      return response.data;
    } catch {
      return mockApiEngine.applyParsedResume(payload);
    }
  },


  // Get full master profile
  getProfile: async (): Promise<MasterProfile> => {
    try {
      const response = await api.get<MasterProfile>('/profile');
      return response.data;
    } catch {
      return mockApiEngine.getProfile();
    }
  },


  // Contact Info & Summary
  updateContactSummary: async (data: {
    phone?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    summary?: string;
  }): Promise<MasterProfile> => {
    try {
      const response = await api.put<MasterProfile>('/profile/contact', data);
      return response.data;
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.summary = data.summary || profile.summary;
      profile.phone = data.phone || profile.phone;
      profile.location = data.location || profile.location;
      profile.linkedin_url = data.linkedin_url || profile.linkedin_url;
      profile.github_url = data.github_url || profile.github_url;
      profile.portfolio_url = data.portfolio_url || profile.portfolio_url;
      return mockApiEngine.updateProfile(profile);
    }
  },

  // Skills
  addSkill: async (skill: Omit<Skill, 'id' | 'profile_id'>): Promise<Skill> => {
    try {
      const response = await api.post<Skill>('/profile/skills', skill);
      return response.data;
    } catch {
      const newSkill: Skill = { id: Date.now(), ...skill };
      const profile = mockApiEngine.getProfile();
      profile.skills = [...(profile.skills || []), newSkill];
      mockApiEngine.updateProfile(profile);
      return newSkill;
    }
  },

  deleteSkill: async (skillId: number): Promise<void> => {
    try {
      await api.delete(`/profile/skills/${skillId}`);
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.skills = (profile.skills || []).filter((s) => s.id !== skillId);
      mockApiEngine.updateProfile(profile);
    }
  },

  // Work Experience
  addExperience: async (exp: Omit<WorkExperience, 'id' | 'profile_id' | 'bullets'>): Promise<WorkExperience> => {
    try {
      const response = await api.post<WorkExperience>('/profile/experiences', exp);
      return response.data;
    } catch {
      const newExp: WorkExperience = { id: Date.now(), ...exp, bullets: [] };
      const profile = mockApiEngine.getProfile();
      profile.experiences = [...(profile.experiences || []), newExp];
      mockApiEngine.updateProfile(profile);
      return newExp;
    }
  },

  updateExperience: async (expId: number, exp: Partial<WorkExperience>): Promise<WorkExperience> => {
    try {
      const response = await api.put<WorkExperience>(`/profile/experiences/${expId}`, exp);
      return response.data;
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.experiences = (profile.experiences || []).map((e) => (e.id === expId ? { ...e, ...exp } : e));
      mockApiEngine.updateProfile(profile);
      return profile.experiences.find((e) => e.id === expId)!;
    }
  },

  deleteExperience: async (expId: number): Promise<void> => {
    try {
      await api.delete(`/profile/experiences/${expId}`);
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.experiences = (profile.experiences || []).filter((e) => e.id !== expId);
      mockApiEngine.updateProfile(profile);
    }
  },

  // Experience Bullets
  addBullet: async (expId: number, bullet: { content: string; impact_category?: string }): Promise<ExperienceBullet> => {
    try {
      const response = await api.post<ExperienceBullet>(`/profile/experiences/${expId}/bullets`, bullet);
      return response.data;
    } catch {
      const newBullet: ExperienceBullet = { id: Date.now(), experience_id: expId, content: bullet.content, variants: [] };
      const profile = mockApiEngine.getProfile();
      profile.experiences = (profile.experiences || []).map((e) =>
        e.id === expId ? { ...e, bullets: [...(e.bullets || []), newBullet] } : e
      );
      mockApiEngine.updateProfile(profile);
      return newBullet;
    }
  },

  updateBullet: async (bulletId: number, bullet: { content: string; impact_category?: string }): Promise<ExperienceBullet> => {
    try {
      const response = await api.put<ExperienceBullet>(`/profile/bullets/${bulletId}`, bullet);
      return response.data;
    } catch {
      const profile = mockApiEngine.getProfile();
      let updatedBullet: ExperienceBullet | null = null;
      profile.experiences = (profile.experiences || []).map((e) => ({
        ...e,
        bullets: (e.bullets || []).map((b) => {
          if (b.id === bulletId) {
            updatedBullet = { ...b, content: bullet.content };
            return updatedBullet;
          }
          return b;
        }),
      }));
      mockApiEngine.updateProfile(profile);
      return updatedBullet || { id: bulletId, content: bullet.content, variants: [] };
    }
  },

  deleteBullet: async (bulletId: number): Promise<void> => {
    try {
      await api.delete(`/profile/bullets/${bulletId}`);
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.experiences = (profile.experiences || []).map((e) => ({
        ...e,
        bullets: (e.bullets || []).filter((b) => b.id !== bulletId),
      }));
      mockApiEngine.updateProfile(profile);
    }
  },

  // Bullet Variants
  addBulletVariant: async (bulletId: number, variant: { variant_text: string; tag?: string }): Promise<BulletVariant> => {
    try {
      const response = await api.post<BulletVariant>(`/profile/bullets/${bulletId}/variants`, variant);
      return response.data;
    } catch {
      const newVariant: BulletVariant = { id: Date.now(), bullet_id: bulletId, variant_text: variant.variant_text, tag: variant.tag };
      const profile = mockApiEngine.getProfile();
      profile.experiences = (profile.experiences || []).map((e) => ({
        ...e,
        bullets: (e.bullets || []).map((b) =>
          b.id === bulletId ? { ...b, variants: [...(b.variants || []), newVariant] } : b
        ),
      }));
      mockApiEngine.updateProfile(profile);
      return newVariant;
    }
  },

  deleteBulletVariant: async (variantId: number): Promise<void> => {
    try {
      await api.delete(`/profile/variants/${variantId}`);
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.experiences = (profile.experiences || []).map((e) => ({
        ...e,
        bullets: (e.bullets || []).map((b) => ({
          ...b,
          variants: (b.variants || []).filter((v) => v.id !== variantId),
        })),
      }));
      mockApiEngine.updateProfile(profile);
    }
  },

  // Projects
  addProject: async (project: Omit<Project, 'id' | 'profile_id'>): Promise<Project> => {
    try {
      const response = await api.post<Project>('/profile/projects', project);
      return response.data;
    } catch {
      const newProject: Project = { id: Date.now(), ...project };
      const profile = mockApiEngine.getProfile();
      profile.projects = [...(profile.projects || []), newProject];
      mockApiEngine.updateProfile(profile);
      return newProject;
    }
  },

  deleteProject: async (projectId: number): Promise<void> => {
    try {
      await api.delete(`/profile/projects/${projectId}`);
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.projects = (profile.projects || []).filter((p) => p.id !== projectId);
      mockApiEngine.updateProfile(profile);
    }
  },

  // Education
  addEducation: async (edu: Omit<Education, 'id' | 'profile_id'>): Promise<Education> => {
    try {
      const response = await api.post<Education>('/profile/education', edu);
      return response.data;
    } catch {
      const newEdu: Education = { id: Date.now(), ...edu };
      const profile = mockApiEngine.getProfile();
      profile.education = [...(profile.education || []), newEdu];
      mockApiEngine.updateProfile(profile);
      return newEdu;
    }
  },

  deleteEducation: async (eduId: number): Promise<void> => {
    try {
      await api.delete(`/profile/education/${eduId}`);
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.education = (profile.education || []).filter((e) => e.id !== eduId);
      mockApiEngine.updateProfile(profile);
    }
  },

  // Certifications
  addCertification: async (cert: Omit<Certification, 'id' | 'profile_id'>): Promise<Certification> => {
    try {
      const response = await api.post<Certification>('/profile/certifications', cert);
      return response.data;
    } catch {
      const newCert: Certification = { id: Date.now(), ...cert };
      const profile = mockApiEngine.getProfile();
      profile.certifications = [...(profile.certifications || []), newCert];
      mockApiEngine.updateProfile(profile);
      return newCert;
    }
  },

  deleteCertification: async (certId: number): Promise<void> => {
    try {
      await api.delete(`/profile/certifications/${certId}`);
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.certifications = (profile.certifications || []).filter((c) => c.id !== certId);
      mockApiEngine.updateProfile(profile);
    }
  },

  // Preferences
  updatePreferences: async (preferences: Partial<JobPreferences>): Promise<JobPreferences> => {
    try {
      const response = await api.put<JobPreferences>('/profile/preferences', preferences);
      return response.data;
    } catch {
      const profile = mockApiEngine.getProfile();
      profile.preferences = { ...profile.preferences, ...preferences };
      mockApiEngine.updateProfile(profile);
      return profile.preferences!;
    }
  },
};
