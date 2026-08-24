import { api } from './api';
import { mockApiEngine } from './mockApi';
import { HiringContact, ColdEmailDraft, DailyQuota, OutreachRecord } from '../types/outreach';

export const outreachService = {
  // Find hiring contacts for a job's target company via Hunter.io
  findContacts: async (jobId: number): Promise<HiringContact[]> => {
    try {
      const response = await api.post<HiringContact[]>(`/outreach/contacts/${jobId}`);
      return response.data;
    } catch {
      return mockApiEngine.findContactsMock(jobId);
    }
  },

  // Generate personalized cold email draft via Claude API
  generateColdEmail: async (payload: {
    job_id: number;
    contact_name: string;
    contact_title?: string;
    contact_email?: string;
    confidence_score?: number;
  }): Promise<ColdEmailDraft> => {
    try {
      const response = await api.post<ColdEmailDraft>('/outreach/generate', payload);
      return response.data;
    } catch {
      return mockApiEngine.generateColdEmailMock(payload);
    }
  },

  // Send cold email draft (enforcing daily cap 15/day & adding opt-out footer line)
  sendColdEmail: async (draftId: number): Promise<OutreachRecord> => {
    try {
      const response = await api.post<OutreachRecord>(`/outreach/send/${draftId}`);
      return response.data;
    } catch (err: any) {
      if (err?.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }
      return mockApiEngine.sendColdEmailMock(draftId);
    }
  },

  // Get daily quota status (sent_today, daily_cap=15, remaining)
  getDailyQuota: async (): Promise<DailyQuota> => {
    try {
      const response = await api.get<DailyQuota>('/outreach/quota');
      return response.data;
    } catch {
      return mockApiEngine.getDailyQuotaMock();
    }
  },

  // Get sent outreach logs list
  getOutreachLog: async (jobId?: number): Promise<OutreachRecord[]> => {
    try {
      const response = await api.get<OutreachRecord[]>('/outreach/log', {
        params: { job_id: jobId },
      });
      return response.data;
    } catch {
      return mockApiEngine.getOutreachLogMock(jobId);
    }
  },

  // Get cold email drafts for job or user
  getColdEmailDrafts: async (jobId?: number): Promise<ColdEmailDraft[]> => {
    try {
      const url = jobId ? `/outreach/job/${jobId}` : '/outreach/drafts';
      const response = await api.get<ColdEmailDraft[]>(url);
      return response.data;
    } catch {
      return mockApiEngine.getColdEmailDraftsMock(jobId);
    }
  },

  // Update subject or body of a cold email draft
  updateColdEmailDraft: async (
    draftId: number,
    payload: { subject?: string; body?: string; status?: 'draft' | 'ready' | 'sent' }
  ): Promise<ColdEmailDraft> => {
    try {
      const response = await api.put<ColdEmailDraft>(`/outreach/drafts/${draftId}`, payload);
      return response.data;
    } catch {
      return mockApiEngine.updateColdEmailDraftMock(draftId, payload);
    }
  },
};
