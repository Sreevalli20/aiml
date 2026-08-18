export type UserRole = 'student' | 'parent' | 'teacher' | 'principal';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  schoolName?: string;
  identifier?: string; // Student roll no, employee ID, etc.
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface LoginCredentials {
  identifier: string; // email, roll number, or phone
  password?: string;
  roleHint?: UserRole;
  otp?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
  expiresIn?: number;
}
