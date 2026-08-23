import { api } from './api';
import { Job, JobScanResult, JobFilterParams } from '../types/job';

export const jobService = {
  // Fetch discovered jobs
  getJobs: async (params?: JobFilterParams): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs', { params });
    return response.data;
  },

  // Trigger manual job scan
  triggerScan: async (): Promise<JobScanResult> => {
    const response = await api.post<JobScanResult>('/jobs/search');
    return response.data;
  },

  // Update job saved / discarded status
  updateJobStatus: async (
    jobId: number,
    status: { is_saved?: boolean; is_discarded?: boolean }
  ): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${jobId}/status`, status);
    return response.data;
  },

  // Import single LinkedIn job URL
  importLinkedInJob: async (url: string): Promise<Job> => {
    const response = await api.post<Job>('/jobs/linkedin-import', { url });
    return response.data;
  },
};
