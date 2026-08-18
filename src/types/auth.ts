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
  isDemo?: boolean;
}

export interface AuthResponse {
  token: string | { access_token: string; token_type: string; expires_in: number };
  refreshToken?: string;
  user: UserProfile;
  expiresIn?: number;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}
