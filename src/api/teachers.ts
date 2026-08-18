import { apiClient } from './client';
import { TeacherRecord, ApiResponse } from '../types/api';

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  totalStudents: number;
  subject?: string;
}

export const teachersApi = {
  /**
   * Fetch list of teachers (for escalation directory or staff directory).
   */
  async getTeachers(): Promise<TeacherRecord[]> {
    const res = await apiClient.get<ApiResponse<TeacherRecord[]> | TeacherRecord[]>('/api/teachers');
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Fetch classes assigned to the authenticated teacher.
   */
  async getMyClasses(): Promise<ClassInfo[]> {
    const res = await apiClient.get<ApiResponse<ClassInfo[]> | ClassInfo[]>('/api/teachers/classes');
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  }
};
