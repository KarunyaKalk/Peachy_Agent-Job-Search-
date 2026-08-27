import { api } from './api';
import { mockApiEngine } from './mockApi';
import { InterviewPrepPack } from '../types/interview_prep';

export const interviewPrepService = {
  // Generate interview prep pack for a job
  generatePrepPack: async (jobId: number): Promise<InterviewPrepPack> => {
    try {
      const response = await api.post<InterviewPrepPack>(`/interview-prep/generate/${jobId}`);
      return response.data;
    } catch {
      return mockApiEngine.generateInterviewPrepPack(jobId);
    }
  },

  // Fetch interview prep pack for a job
  getPrepPackByJob: async (jobId: number): Promise<InterviewPrepPack> => {
    try {
      const response = await api.get<InterviewPrepPack>(`/interview-prep/job/${jobId}`);
      return response.data;
    } catch {
      return mockApiEngine.getInterviewPrepPack(jobId);
    }
  },

  // Get all interview prep packs
  getAllPrepPacks: async (): Promise<InterviewPrepPack[]> => {
    try {
      const response = await api.get<InterviewPrepPack[]>('/interview-prep/all');
      return response.data;
    } catch {
      return mockApiEngine.getAllInterviewPrepPacks();
    }
  },

  // Update item completion status or personal notes
  updatePrepItem: async (
    packId: number,
    data: { item_id: string; item_type: 'technical' | 'behavioral'; is_completed?: boolean; notes?: string }
  ): Promise<InterviewPrepPack> => {
    try {
      const response = await api.put<InterviewPrepPack>(`/interview-prep/${packId}/item`, data);
      return response.data;
    } catch {
      return mockApiEngine.updatePrepItem(packId, data);
    }
  },
};
