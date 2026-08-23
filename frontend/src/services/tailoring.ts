import { api } from './api';
import { TailoredResume } from '../types/tailoring';

export const tailoringService = {
  // Generate tailored resume for a job
  generateTailoredResume: async (jobId: number): Promise<TailoredResume> => {
    const response = await api.post<TailoredResume>(`/tailor/${jobId}`);
    return response.data;
  },

  // Get existing tailored resume version for a job
  getTailoredResume: async (jobId: number): Promise<TailoredResume> => {
    const response = await api.get<TailoredResume>(`/tailor/${jobId}`);
    return response.data;
  },

  // Update/approve tailored resume status
  updateTailoredResume: async (
    resumeId: number,
    data: { summary?: string; tailored_json?: any; status?: 'draft' | 'approved' | 'rejected' }
  ): Promise<TailoredResume> => {
    const response = await api.put<TailoredResume>(`/tailor/${resumeId}`, data);
    return response.data;
  },
};
