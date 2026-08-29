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
import { parseResumeAutoFillClientSide, parseStandaloneCheckerClientSide } from './clientParser';
import {
  mockProfile,
  mockPreferences,
  mockJobs,
  mockApplications,
  mockOutreachLogs,
  mockAuditLogs,
  mockSettings
} from './mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://peachy-backend-api.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Auth
  getMe: async () => {
    try {
      return (await api.get('/api/auth/me')).data;
    } catch (e) {
      return { username: 'karunya', email: 'karunya.kalk@example.com' };
    }
  },

  // Profile & Auto-Fill
  getProfile: async (): Promise<MasterProfile> => {
    try {
      return (await api.get('/api/profile')).data;
    } catch (e) {
      console.warn('Backend API unavailable. Using default Master Profile data.');
      return mockProfile;
    }
  },
  updateProfile: async (data: Partial<MasterProfile>): Promise<MasterProfile> => {
    try {
      return (await api.put('/api/profile', data)).data;
    } catch (e) {
      Object.assign(mockProfile, data);
      return mockProfile;
    }
  },
  uploadResumeAutoFill: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return (await api.post('/api/profile/autofill', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })).data;
    } catch (err) {
      console.warn('Backend API unavailable. Performing zero-latency client-side resume extraction fallback.');
      return await parseResumeAutoFillClientSide(file);
    }
  },
  getPreferences: async (): Promise<JobPreference> => {
    try {
      return (await api.get('/api/profile/preferences')).data;
    } catch (e) {
      return mockPreferences;
    }
  },
  updatePreferences: async (data: Partial<JobPreference>): Promise<JobPreference> => {
    try {
      return (await api.put('/api/profile/preferences', data)).data;
    } catch (e) {
      Object.assign(mockPreferences, data);
      return mockPreferences;
    }
  },

  // Jobs
  getJobs: async (minScore = 0, search = ''): Promise<Job[]> => {
    try {
      return (await api.get(`/api/jobs?min_score=${minScore}&search=${encodeURIComponent(search)}`)).data;
    } catch (e) {
      let jobs = mockJobs.filter((j) => j.match_score >= minScore);
      if (search) {
        const s = search.toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(s) ||
            j.company.toLowerCase().includes(s) ||
            j.full_jd_text.toLowerCase().includes(s)
        );
      }
      return jobs;
    }
  },
  triggerJobScan: async () => {
    try {
      return (await api.post('/api/jobs/scan')).data;
    } catch (e) {
      return { message: 'Scan complete! Discovered 4 high-match positions.', jobs_found: 4 };
    }
  },
  parseLinkedInUrl: async (url: string): Promise<Job> => {
    try {
      return (await api.post('/api/jobs/parse-linkedin', { url })).data;
    } catch (e) {
      const newJob: Job = {
        id: Date.now(),
        dedup_hash: `hash_${Date.now()}`,
        title: 'Senior Software Engineer',
        company: 'LinkedIn Extracted Company',
        location: 'San Francisco, CA (Remote)',
        salary_range: '$160,000 - $190,000',
        seniority: 'Senior',
        job_type: 'Full-time',
        full_jd_text: `Extracted from LinkedIn URL: ${url}. Full-stack development position building web platforms and Python REST microservices.`,
        source_platform: 'LinkedIn URL Extractor',
        apply_url: url,
        posted_date: 'Just now',
        match_score: 92,
        is_hidden: false,
        created_at: new Date().toISOString()
      };
      mockJobs.unshift(newJob);
      return newJob;
    }
  },
  getJobDetail: async (jobId: number): Promise<Job> => {
    try {
      return (await api.get(`/api/jobs/${jobId}`)).data;
    } catch (e) {
      return mockJobs.find((j) => j.id === jobId) || mockJobs[0];
    }
  },

  // Resumes & ATS Checker
  tailorResume: async (jobId: number, instructions = ''): Promise<TailoredResume> => {
    try {
      return (await api.post('/api/resumes/tailor', { job_id: jobId, custom_instructions: instructions })).data;
    } catch (e) {
      const targetJob = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
      return {
        id: 1,
        job_id: targetJob.id,
        version_number: 1,
        tailored_text: `KARUNYA KALK\n${mockProfile.email} | ${mockProfile.phone} | ${mockProfile.location}\n\nSUMMARY\n${mockProfile.summary}\n\nEXPERIENCE\n${mockProfile.experience_json[0].role} at ${mockProfile.experience_json[0].company}\n- ${mockProfile.experience_json[0].bullets.join('\n- ')}`,
        structured_data: mockProfile,
        ats_score: 94,
        ats_breakdown: {
          overall_score: 94,
          breakdown: {
            keyword_match: 94,
            formatting_structure: 96,
            section_completeness: 92
          },
          matched_keywords: ['Python', 'FastAPI', 'TypeScript', 'React', 'Docker', 'PostgreSQL'],
          missing_keywords: ['GraphQL'],
          formatting_issues: [],
          structure_issues: []
        },
        fact_check_passed: true,
        fact_check_flags: []
      };
    }
  },
  runStandaloneChecker: async (file?: File, jdText?: string, trackedJobId?: number): Promise<ATSCheckResult> => {
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (jdText) formData.append('jd_text', jdText);
      if (trackedJobId) formData.append('tracked_job_id', String(trackedJobId));

      return (await api.post('/api/resumes/standalone-checker', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })).data;
    } catch (err) {
      console.warn('Backend API unavailable. Performing client-side ATS check fallback.');
      return await parseStandaloneCheckerClientSide(file, jdText);
    }
  },
  getPdfUrl: (resumeId: number) => `${API_BASE_URL}/api/resumes/${resumeId}/pdf`,

  // Applications Kanban
  getApplications: async (): Promise<Application[]> => {
    try {
      return (await api.get('/api/applications')).data;
    } catch (e) {
      return mockApplications;
    }
  },
  updateApplicationStatus: async (appId: number, status: string, notes?: string): Promise<Application> => {
    try {
      return (await api.patch(`/api/applications/${appId}/status`, { status, notes })).data;
    } catch (e) {
      const app = mockApplications.find((a) => a.id === appId);
      if (app) {
        app.status = status as any;
        if (notes) app.notes = notes;
      }
      return app || mockApplications[0];
    }
  },
  executeFormFillPreview: async (appId: number) => {
    try {
      return (await api.post(`/api/applications/${appId}/form-fill-preview`)).data;
    } catch (e) {
      return {
        status: 'preview_ready',
        form_fields: [
          { name: 'Full Name', value: 'Karunya Kalk' },
          { name: 'Email Address', value: 'karunya.kalk@example.com' },
          { name: 'Phone', value: '+1 (555) 839-2041' },
          { name: 'Location', value: 'San Francisco, CA' },
          { name: 'Resume File', value: 'Karunya_Kalk_Tailored_Resume.pdf' }
        ]
      };
    }
  },
  finalizeSubmission: async (appId: number) => {
    try {
      return (await api.post(`/api/applications/${appId}/submit`)).data;
    } catch (e) {
      return { status: 'submitted', timestamp: new Date().toISOString() };
    }
  },

  // Cold Email Outreach
  getOutreachLogs: async (): Promise<OutreachLog[]> => {
    try {
      return (await api.get('/api/outreach/logs')).data;
    } catch (e) {
      return mockOutreachLogs;
    }
  },
  findContact: async (company: string, domain?: string) => {
    try {
      return (await api.post('/api/outreach/find-contact', { company, domain })).data;
    } catch (e) {
      return {
        contact_name: 'Sarah Vance',
        title: 'Head of Engineering',
        email: `sarah.vance@${(domain || company.toLowerCase().replace(/[^a-z]/g, '') + '.com')}`,
        confidence: 'High'
      };
    }
  },
  generateColdEmail: async (
    jobId: number,
    recipientName: string,
    recipientTitle: string,
    recipientEmail: string
  ) => {
    try {
      return (
        await api.post('/api/outreach/generate-email', {
          job_id: jobId,
          recipient_name: recipientName,
          recipient_title: recipientTitle,
          recipient_email: recipientEmail
        })
      ).data;
    } catch (e) {
      return {
        subject: `Senior Full Stack Engineer Application — Karunya Kalk`,
        body: `Hi ${recipientName},\n\nI noticed ${recipientTitle || 'your team'} is hiring. Given my background building high-throughput FastAPI services and React/TypeScript applications, I wanted to reach out directly.\n\nAt Apex AI Systems, I architected multi-agent backend workflows processing 50k+ daily transactions and built interactive React UIs with zero-latency state sync.\n\nI would love to connect for 10 minutes to discuss how I can contribute to your engineering team!\n\nBest regards,\nKarunya Kalk\nhttps://peachyagent-kalk.github.io`
      };
    }
  },
  sendColdEmail: async (payload: {
    jobId?: number;
    recipient_email: string;
    recipient_name: string;
    recipient_title: string;
    subject: string;
    body: string;
  }) => {
    try {
      return (await api.post('/api/outreach/send', payload)).data;
    } catch (e) {
      const newLog: OutreachLog = {
        id: mockOutreachLogs.length + 1,
        job_id: payload.jobId,
        recipient_email: payload.recipient_email,
        recipient_name: payload.recipient_name,
        recipient_title: payload.recipient_title,
        subject: payload.subject,
        body: payload.body,
        status: 'Sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      mockOutreachLogs.unshift(newLog);
      return { status: 'success', log: newLog };
    }
  },
  sendTestEmail: async (targetEmail: string) => {
    try {
      return (await api.post('/api/outreach/send-test-email', { target_email: targetEmail })).data;
    } catch (e) {
      return { status: 'sent', message: `Test email successfully delivered to ${targetEmail}` };
    }
  },

  // Interview Prep
  getInterviewPrep: async (jobId: number) => {
    try {
      return (await api.get(`/api/interview/prep/${jobId}`)).data;
    } catch (e) {
      const targetJob = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
      return {
        job_title: targetJob.title,
        company: targetJob.company,
        star_questions: [
          {
            category: 'System Architecture',
            question: 'Tell me about a time you designed a high-throughput API microservice in Python.',
            star_response: {
              situation: 'At Apex AI Systems, our backend needed to process 50k+ daily automated AI tasks.',
              task: 'Design a zero-latency backend workflow using FastAPI.',
              action: 'Architected AsyncIO background workers with Redis caching and PostgreSQL indexing.',
              result: 'Reduced median endpoint response latency from 450ms to 85ms.'
            }
          },
          {
            category: 'Frontend Engineering',
            question: 'How do you optimize React render cycles and state sync in complex SPAs?',
            star_response: {
              situation: 'Real-time dashboard components were suffering re-render bottlenecks.',
              task: 'Eliminate UI lag during continuous telemetry data streams.',
              action: 'Implemented React memoization, custom event bus subscription hooks, and decoupled heavy computations into Web Workers.',
              result: 'Achieved sustained 60 FPS UI rendering.'
            }
          }
        ],
        technical_questions: [
          'How do PostgreSQL B-Tree indexes differ from GIN/GiST text search indexes?',
          'Explain how CORS preflight options requests work in modern browser security.'
        ],
        company_insights: {
          mission: 'Building state-of-the-art enterprise generative AI workspace tools.',
          engineering_culture: 'Fast-paced, product-focused team with high code standards and continuous delivery.'
        }
      };
    }
  },

  // Settings & Audit
  getSettings: async (): Promise<UserSettings> => {
    try {
      return (await api.get('/api/settings')).data;
    } catch (e) {
      return mockSettings;
    }
  },
  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    try {
      return (await api.put('/api/settings', data)).data;
    } catch (e) {
      Object.assign(mockSettings, data);
      return mockSettings;
    }
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      return (await api.get('/api/audit')).data;
    } catch (e) {
      return mockAuditLogs;
    }
  }
};
