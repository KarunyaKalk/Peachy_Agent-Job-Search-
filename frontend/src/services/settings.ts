import { api } from './api';
import { mockApiEngine } from './mockApi';
import { SystemSettings } from '../types/settings';

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await api.get<SystemSettings>('/settings');
      return response.data;
    } catch {
      return mockApiEngine.getSettings();
    }
  },

  updateSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    try {
      const response = await api.put<SystemSettings>('/settings', data);
      return response.data;
    } catch {
      return mockApiEngine.updateSettings(data);
    }
  },
};
