import axios from 'axios';
import {
  MasterProfile,
  JobPreference,
  Job,
  TailoredResume,
  Application,
  OutreachLog,
  AuditLog,
  UserSettings,
  ATSCheckResult
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Auth
  getMe: async () => (await api.get('/api/auth/me')).data,

  // Profile & Auto-Fill
  getProfile: async (): Promise<MasterProfile> => (await api.get('/api/profile')).data,
  updateProfile: async (data: Partial<MasterProfile>): Promise<MasterProfile> => (await api.put('/api/profile', data)).data,
  uploadResumeAutoFill: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await api.post('/api/profile/autofill', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },
  getPreferences: async (): Promise<JobPreference> => (await api.get('/api/profile/preferences')).data,
  updatePreferences: async (data: Partial<JobPreference>): Promise<JobPreference> => (await api.put('/api/profile/preferences', data)).data,

  // Jobs
  getJobs: async (minScore = 0, search = ''): Promise<Job[]> => (await api.get(`/api/jobs?min_score=${minScore}&search=${encodeURIComponent(search)}`)).data,
  triggerJobScan: async () => (await api.post('/api/jobs/scan')).data,
  parseLinkedInUrl: async (url: string): Promise<Job> => (await api.post('/api/jobs/parse-linkedin', { url })).data,
  getJobDetail: async (jobId: number): Promise<Job> => (await api.get(`/api/jobs/${jobId}`)).data,

  // Resumes & ATS Checker
  tailorResume: async (jobId: number, instructions = ''): Promise<TailoredResume> => (await api.post('/api/resumes/tailor', { job_id: jobId, custom_instructions: instructions })).data,
  runStandaloneChecker: async (file?: File, jdText?: string, trackedJobId?: number): Promise<ATSCheckResult> => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (jdText) formData.append('jd_text', jdText);
    if (trackedJobId) formData.append('tracked_job_id', String(trackedJobId));
    
    return (await api.post('/api/resumes/standalone-checker', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },
  getPdfUrl: (resumeId: number) => `${API_BASE_URL}/api/resumes/${resumeId}/pdf`,

  // Applications Kanban
  getApplications: async (): Promise<Application[]> => (await api.get('/api/applications')).data,
  updateApplicationStatus: async (appId: number, status: string, notes?: string): Promise<Application> => (await api.patch(`/api/applications/${appId}/status`, { status, notes })).data,
  executeFormFillPreview: async (appId: number) => (await api.post(`/api/applications/${appId}/form-fill-preview`)).data,
  finalizeSubmission: async (appId: number) => (await api.post(`/api/applications/${appId}/submit`)).data,

  // Cold Email Outreach
  getOutreachLogs: async (): Promise<OutreachLog[]> => (await api.get('/api/outreach/logs')).data,
  findContact: async (company: string, domain?: string) => (await api.post('/api/outreach/find-contact', { company, domain })).data,
  generateColdEmail: async (jobId: number, recipientName: string, recipientTitle: string, recipientEmail: string) => (await api.post('/api/outreach/generate-email', { job_id: jobId, recipient_name: recipientName, recipient_title: recipientTitle, recipient_email: recipientEmail })).data,
  sendColdEmail: async (payload: { jobId?: number; recipient_email: string; recipient_name: string; recipient_title: string; subject: string; body: string }) => (await api.post('/api/outreach/send', payload)).data,
  sendTestEmail: async (targetEmail: string) => (await api.post('/api/outreach/send-test-email', { target_email: targetEmail })).data,

  // Interview Prep
  getInterviewPrep: async (jobId: number) => (await api.get(`/api/interview/prep/${jobId}`)).data,

  // Settings & Audit
  getSettings: async (): Promise<UserSettings> => (await api.get('/api/settings')).data,
  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => (await api.put('/api/settings', data)).data,
  getAuditLogs: async (): Promise<AuditLog[]> => (await api.get('/api/audit')).data,
};
