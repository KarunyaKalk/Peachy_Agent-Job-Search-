import { api } from './api';
import { mockApiEngine } from './mockApi';
import { AuditLogEntry } from '../types/audit';

export const auditService = {
  getAuditLogs: async (category?: string, status?: string, limit: number = 50): Promise<AuditLogEntry[]> => {
    try {
      const response = await api.get<AuditLogEntry[]>('/audit', {
        params: { category, status, limit },
      });
      return response.data;
    } catch {
      return mockApiEngine.getAuditLogs(category, status);
    }
  },

  createAuditLog: async (data: { category: string; action: string; details?: string; status?: string }): Promise<AuditLogEntry> => {
    try {
      const response = await api.post<AuditLogEntry>('/audit', data);
      return response.data;
    } catch {
      return mockApiEngine.createAuditLog(data);
    }
  },
};
