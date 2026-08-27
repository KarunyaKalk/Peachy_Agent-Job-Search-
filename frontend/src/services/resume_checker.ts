import { api } from './api';
import { mockApiEngine } from './mockApi';
import { ResumeCheckerRequest, ResumeCheckerResponse } from '../types/resume_checker';

export const resumeCheckerService = {
  analyzeResume: async (data: ResumeCheckerRequest): Promise<ResumeCheckerResponse> => {
    try {
      const response = await api.post<ResumeCheckerResponse>('/resume-checker/analyze', data);
      return response.data;
    } catch {
      return mockApiEngine.analyzeResumeMock(data);
    }
  },

  saveFingerprint: async (keywords: string[]): Promise<{ message: string; keyword_fingerprint: string[] }> => {
    try {
      const response = await api.post<{ message: string; keyword_fingerprint: string[] }>(
        '/resume-checker/save-fingerprint',
        { keywords }
      );
      return response.data;
    } catch {
      return mockApiEngine.saveFingerprintMock(keywords);
    }
  },
};
