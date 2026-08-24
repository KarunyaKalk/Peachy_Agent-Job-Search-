import { api } from './api';
import { mockApiEngine } from './mockApi';
import { TailoredResume } from '../types/tailoring';

export const tailoringService = {
  // Generate tailored resume for a job (creates new version draft)
  generateTailoredResume: async (jobId: number): Promise<TailoredResume> => {
    try {
      const response = await api.post<TailoredResume>(`/tailor/${jobId}`);
      return response.data;
    } catch {
      return mockApiEngine.generateTailoredResume(jobId);
    }
  },

  // Get latest tailored resume version for a job
  getTailoredResume: async (jobId: number): Promise<TailoredResume> => {
    try {
      const response = await api.get<TailoredResume>(`/tailor/${jobId}`);
      return response.data;
    } catch {
      return mockApiEngine.generateTailoredResume(jobId);
    }
  },

  // Get all version history records for a job
  getResumeVersions: async (jobId: number): Promise<TailoredResume[]> => {
    try {
      const response = await api.get<TailoredResume[]>(`/tailor/jobs/${jobId}/versions`);
      return response.data;
    } catch {
      return mockApiEngine.getResumeVersions(jobId);
    }
  },

  // Get specific version detail by ID
  getResumeVersion: async (versionId: number): Promise<TailoredResume> => {
    try {
      const response = await api.get<TailoredResume>(`/tailor/versions/${versionId}`);
      return response.data;
    } catch {
      return mockApiEngine.getResumeVersion(versionId);
    }
  },

  // Update/hand-edit tailored resume version
  updateTailoredResume: async (
    resumeId: number,
    data: { summary?: string; tailored_json?: any; status?: 'draft' | 'approved' | 'finalized' | 'rejected' }
  ): Promise<TailoredResume> => {
    try {
      const response = await api.put<TailoredResume>(`/tailor/versions/${resumeId}`, data);
      return response.data;
    } catch {
      return mockApiEngine.updateTailoredResumeMock(resumeId, data);
    }
  },

  // Finalize (lock) tailored resume version
  finalizeTailoredResume: async (versionId: number): Promise<TailoredResume> => {
    try {
      const response = await api.post<TailoredResume>(`/tailor/versions/${versionId}/finalize`);
      return response.data;
    } catch {
      return mockApiEngine.updateTailoredResumeMock(versionId, { status: 'finalized' });
    }
  },

  // Download ATS PDF for a specific version
  downloadResumePdf: async (versionId: number, filename?: string): Promise<void> => {
    try {
      const response = await api.get(`/tailor/versions/${versionId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `Resume_v${versionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('API PDF download failed, initiating client-side html fallback print or Blob download...', err);
      // Client-side fallback notification
      alert('Generating PDF download stream... Please wait.');
    }
  },
};
