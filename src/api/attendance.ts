import { apiClient } from './client';
import { 
  AttendanceAnalytics, 
  AttendanceSummary, 
  MarkAttendanceRequest, 
  MarkAttendanceResponse 
} from '../types/attendance';
import { ApiResponse } from '../types/api';

export const attendanceApi = {
  /**
   * Fetch attendance data for the currently authenticated student.
   */
  async getMyAttendance(): Promise<AttendanceSummary> {
    const res = await apiClient.get<ApiResponse<AttendanceSummary> | AttendanceSummary>('/api/v1/attendance/me');
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as AttendanceSummary;
  },

  /**
   * Fetch attendance records for a specific child (authorized parent only).
   */
  async getChildAttendance(childId: string): Promise<AttendanceSummary> {
    const res = await apiClient.get<ApiResponse<AttendanceSummary> | AttendanceSummary>(
      `/api/v1/attendance/child/${childId}`
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as AttendanceSummary;
  },

  /**
   * Teacher action to mark/update attendance for a student.
   * Calls the real backend only after explicit user confirmation.
   */
  async markAttendance(payload: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    const res = await apiClient.post<ApiResponse<MarkAttendanceResponse> | MarkAttendanceResponse>(
      '/api/v1/attendance/mark',
      payload
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as MarkAttendanceResponse;
  },

  /**
   * Principal/Management analytics: overall attendance percentage, class breakdown, trends.
   */
  async getAttendanceAnalytics(): Promise<AttendanceAnalytics> {
    const res = await apiClient.get<ApiResponse<AttendanceAnalytics> | AttendanceAnalytics>(
      '/api/v1/attendance/analytics'
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as AttendanceAnalytics;
  }
};
