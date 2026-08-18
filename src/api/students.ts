import { apiClient } from './client';
import { StudentRecord, ApiResponse } from '../types/api';

export const studentsApi = {
  /**
   * Fetch list of students (filtered by class_id for teachers, or school-wide for management).
   */
  async getStudents(params?: { classId?: string; search?: string }): Promise<StudentRecord[]> {
    const res = await apiClient.get<ApiResponse<StudentRecord[]> | StudentRecord[]>(
      '/api/students',
      { class_id: params?.classId, q: params?.search }
    );
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Fetch specific student details by ID.
   */
  async getStudentById(id: string): Promise<StudentRecord> {
    const res = await apiClient.get<ApiResponse<StudentRecord> | StudentRecord>(
      `/api/students/${id}`
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as StudentRecord;
  }
};
