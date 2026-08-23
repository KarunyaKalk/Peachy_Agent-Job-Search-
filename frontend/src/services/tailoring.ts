import { api } from './api';
import { mockApiEngine } from './mockApi';
import { TailoredResume } from '../types/tailoring';

export const tailoringService = {
  // Generate tailored resume for a job
  generateTailoredResume: async (jobId: number): Promise<TailoredResume> => {
    try {
      const response = await api.post<TailoredResume>(`/tailor/${jobId}`);
      return response.data;
    } catch {
      return mockApiEngine.generateTailoredResume(jobId);
    }
  },

  // Get existing tailored resume version for a job
  getTailoredResume: async (jobId: number): Promise<TailoredResume> => {
    try {
      const response = await api.get<TailoredResume>(`/tailor/${jobId}`);
      return response.data;
    } catch {
      return mockApiEngine.generateTailoredResume(jobId);
    }
  },

  // Update/approve tailored resume status
  updateTailoredResume: async (
    resumeId: number,
    data: { summary?: string; tailored_json?: any; status?: 'draft' | 'approved' | 'rejected' }
  ): Promise<TailoredResume> => {
    try {
      const response = await api.put<TailoredResume>(`/tailor/${resumeId}`, data);
      return response.data;
    } catch {
      const resume = mockApiEngine.generateTailoredResume(1);
      if (data.status) resume.status = data.status;
      return resume;
    }
  },
};
