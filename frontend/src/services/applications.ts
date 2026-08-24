import { api } from './api';
import { mockApiEngine } from './mockApi';
import { Application, ReviewQueueItem, ApplicationStatus, SubmissionTriggerResult } from '../types/application';

export const applicationService = {
  // Fetch items pending review in queue
  getReviewQueue: async (): Promise<ReviewQueueItem[]> => {
    try {
      const response = await api.get<ReviewQueueItem[]>('/applications/queue');
      return response.data;
    } catch {
      return mockApiEngine.getReviewQueue();
    }
  },

  // Approve a job in review queue -> moves to tracker with status "Ready to Apply"
  approveApplication: async (jobId: number, notes?: string): Promise<Application> => {
    try {
      const response = await api.post<Application>(`/applications/approve/${jobId}`, null, {
        params: { notes },
      });
      return response.data;
    } catch {
      return mockApiEngine.approveApplicationMock(jobId, notes);
    }
  },

  // Reject a job in review queue
  rejectApplication: async (jobId: number, notes?: string): Promise<void> => {
    try {
      await api.post(`/applications/reject/${jobId}`, null, {
        params: { notes },
      });
    } catch {
      mockApiEngine.rejectApplicationMock(jobId, notes);
    }
  },

  // Get all applications with optional status filter
  getApplications: async (statusFilter?: string): Promise<Application[]> => {
    try {
      const response = await api.get<Application[]>('/applications', {
        params: { status_filter: statusFilter },
      });
      return response.data;
    } catch {
      return mockApiEngine.getApplicationsMock(statusFilter);
    }
  },

  // Get Kanban Board grouped applications
  getKanbanBoard: async (): Promise<Record<string, Application[]>> => {
    try {
      const response = await api.get<Record<string, Application[]>>('/applications/dashboard/kanban');
      return response.data;
    } catch {
      return mockApiEngine.getKanbanBoardMock();
    }
  },

  // Trigger submission (Direct API OR Playwright Form Pre-Fill Hard Pause)
  submitApplication: async (applicationId: number): Promise<SubmissionTriggerResult> => {
    try {
      const response = await api.post<SubmissionTriggerResult>(`/applications/${applicationId}/submit`);
      return response.data;
    } catch {
      return mockApiEngine.submitApplicationMock(applicationId);
    }
  },

  // Confirm submission following human-in-the-loop hard pause
  confirmFormSubmission: async (applicationId: number): Promise<SubmissionTriggerResult> => {
    try {
      const response = await api.post<SubmissionTriggerResult>(`/applications/${applicationId}/confirm-submission`);
      return response.data;
    } catch {
      return mockApiEngine.confirmSubmissionMock(applicationId);
    }
  },

  // Update application status or notes
  updateApplication: async (
    id: number,
    data: { status?: ApplicationStatus; notes?: string }
  ): Promise<Application> => {
    try {
      const response = await api.put<Application>(`/applications/${id}`, data);
      return response.data;
    } catch {
      return mockApiEngine.updateApplicationMock(id, data);
    }
  },
};
