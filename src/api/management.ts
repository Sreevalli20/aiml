import { apiClient } from './client';
import { ApiResponse } from '../types/api';

export interface SchoolOverview {
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
  academicYear: string;
  todayAttendanceRate?: number;
  alertsCount?: number;
}

export const managementApi = {
  /**
   * Fetch school overview metrics for Principal / Management.
   */
  async getSchoolOverview(): Promise<SchoolOverview> {
    const res = await apiClient.get<ApiResponse<SchoolOverview> | SchoolOverview>(
      '/api/management/overview'
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as SchoolOverview;
  }
};
