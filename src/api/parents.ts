import { apiClient } from './client';
import { ChildRecord, ApiResponse } from '../types/api';

export const parentsApi = {
  /**
   * Fetch children associated with the authenticated parent account.
   * Authorization and parent-child association is enforced by backend.
   */
  async getChildren(): Promise<ChildRecord[]> {
    const res = await apiClient.get<ApiResponse<ChildRecord[]> | ChildRecord[]>('/api/children');
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Fetch specific child details.
   */
  async getChildDetails(childId: string): Promise<ChildRecord> {
    const res = await apiClient.get<ApiResponse<ChildRecord> | ChildRecord>(
      `/api/children/${childId}`
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as ChildRecord;
  }
};
