import { api } from './api';
import { mockApiEngine } from './mockApi';
import { Job, JobScanResult, JobFilterParams } from '../types/job';

export const jobService = {
  // Fetch discovered jobs
  getJobs: async (params?: JobFilterParams): Promise<Job[]> => {
    try {
      const response = await api.get<Job[]>('/jobs', { params });
      return response.data;
    } catch {
      return mockApiEngine.getJobs(params);
    }
  },

  // Trigger manual job scan
  triggerScan: async (): Promise<JobScanResult> => {
    try {
      const response = await api.post<JobScanResult>('/jobs/search');
      return response.data;
    } catch {
      return mockApiEngine.triggerScan();
    }
  },

  // Update job saved / discarded status
  updateJobStatus: async (
    jobId: number,
    status: { is_saved?: boolean; is_discarded?: boolean }
  ): Promise<Job> => {
    try {
      const response = await api.put<Job>(`/jobs/${jobId}/status`, status);
      return response.data;
    } catch {
      const jobs = mockApiEngine.getJobs();
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        if (status.is_saved !== undefined) job.is_saved = status.is_saved;
        if (status.is_discarded !== undefined) job.is_discarded = status.is_discarded;
      }
      return job || jobs[0];
    }
  },

  // Import single LinkedIn job URL
  importLinkedInJob: async (url: string): Promise<Job> => {
    try {
      const response = await api.post<Job>('/jobs/linkedin-import', { url });
      return response.data;
    } catch {
      return mockApiEngine.importLinkedInJob(url);
    }
  },
};
