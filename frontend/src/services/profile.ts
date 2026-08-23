import { api } from './api';
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
} from '../types/profile';

export const profileService = {
  // Get full master profile
  getProfile: async (): Promise<MasterProfile> => {
    const response = await api.get<MasterProfile>('/profile');
    return response.data;
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
    const response = await api.put<MasterProfile>('/profile/contact', data);
    return response.data;
  },

  // Skills
  addSkill: async (skill: Omit<Skill, 'id' | 'profile_id'>): Promise<Skill> => {
    const response = await api.post<Skill>('/profile/skills', skill);
    return response.data;
  },

  deleteSkill: async (skillId: number): Promise<void> => {
    await api.delete(`/profile/skills/${skillId}`);
  },

  // Work Experience
  addExperience: async (exp: Omit<WorkExperience, 'id' | 'profile_id' | 'bullets'>): Promise<WorkExperience> => {
    const response = await api.post<WorkExperience>('/profile/experiences', exp);
    return response.data;
  },

  updateExperience: async (expId: number, exp: Partial<WorkExperience>): Promise<WorkExperience> => {
    const response = await api.put<WorkExperience>(`/profile/experiences/${expId}`, exp);
    return response.data;
  },

  deleteExperience: async (expId: number): Promise<void> => {
    await api.delete(`/profile/experiences/${expId}`);
  },

  // Experience Bullets
  addBullet: async (expId: number, bullet: { content: string; impact_category?: string }): Promise<ExperienceBullet> => {
    const response = await api.post<ExperienceBullet>(`/profile/experiences/${expId}/bullets`, bullet);
    return response.data;
  },

  updateBullet: async (bulletId: number, bullet: { content: string; impact_category?: string }): Promise<ExperienceBullet> => {
    const response = await api.put<ExperienceBullet>(`/profile/bullets/${bulletId}`, bullet);
    return response.data;
  },

  deleteBullet: async (bulletId: number): Promise<void> => {
    await api.delete(`/profile/bullets/${bulletId}`);
  },

  // Bullet Variants
  addBulletVariant: async (bulletId: number, variant: { variant_text: string; tag?: string }): Promise<BulletVariant> => {
    const response = await api.post<BulletVariant>(`/profile/bullets/${bulletId}/variants`, variant);
    return response.data;
  },

  deleteBulletVariant: async (variantId: number): Promise<void> => {
    await api.delete(`/profile/variants/${variantId}`);
  },

  // Projects
  addProject: async (project: Omit<Project, 'id' | 'profile_id'>): Promise<Project> => {
    const response = await api.post<Project>('/profile/projects', project);
    return response.data;
  },

  deleteProject: async (projectId: number): Promise<void> => {
    await api.delete(`/profile/projects/${projectId}`);
  },

  // Education
  addEducation: async (edu: Omit<Education, 'id' | 'profile_id'>): Promise<Education> => {
    const response = await api.post<Education>('/profile/education', edu);
    return response.data;
  },

  deleteEducation: async (eduId: number): Promise<void> => {
    await api.delete(`/profile/education/${eduId}`);
  },

  // Certifications
  addCertification: async (cert: Omit<Certification, 'id' | 'profile_id'>): Promise<Certification> => {
    const response = await api.post<Certification>('/profile/certifications', cert);
    return response.data;
  },

  deleteCertification: async (certId: number): Promise<void> => {
    await api.delete(`/profile/certifications/${certId}`);
  },

  // Preferences
  updatePreferences: async (preferences: Partial<JobPreferences>): Promise<JobPreferences> => {
    const response = await api.put<JobPreferences>('/profile/preferences', preferences);
    return response.data;
  },
};
