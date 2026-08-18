export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  error?: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  field?: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface ChildRecord {
  id: string;
  name: string;
  grade: string;
  section: string;
  rollNo: string;
  avatarUrl?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  parentName?: string;
  contactNumber?: string;
  currentStatus?: 'present' | 'absent' | 'late';
}

export interface TeacherRecord {
  id: string;
  name: string;
  subject: string;
  department: string;
  email: string;
  phone?: string;
  availableForCall?: boolean;
}

export interface CallRequestPayload {
  teacherId?: string;
  studentId?: string;
  reason: string;
  contactNumber: string;
  preferredTime?: string;
  roleHint?: string;
}

export interface CallRequestResponse {
  requestId: string;
  status: 'submitted' | 'scheduled' | 'failed';
  message: string;
  estimatedCallbackTime?: string;
}
