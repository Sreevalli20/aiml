export interface AttendanceSummary {
  studentId: string;
  studentName?: string;
  className?: string;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  workingDays: number;
  lateDays?: number;
  periodStart: string;
  periodEnd: string;
  recentLogs?: AttendanceDayLog[];
}

export interface AttendanceDayLog {
  date: string;
  status: 'present' | 'absent' | 'late' | 'holiday' | 'leave';
  subject?: string;
  remarks?: string;
}

export interface MarkAttendanceRequest {
  studentId: string;
  studentName?: string;
  classId?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  updatedRecord?: AttendanceDayLog;
}

export interface ClassAttendanceMetric {
  classId: string;
  className: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface AttendanceTrendPoint {
  date: string;
  dayLabel: string;
  percentage: number;
  presentCount?: number;
  absentCount?: number;
}

export interface AttendanceAnalytics {
  overallPercentage: number;
  totalEnrolled: number;
  todayPresent: number;
  todayAbsent: number;
  date: string;
  weeklyTrends: AttendanceTrendPoint[];
  classBreakdown: ClassAttendanceMetric[];
  lowAttendanceAlertCount?: number;
}
