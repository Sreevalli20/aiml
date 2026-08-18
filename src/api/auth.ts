import { apiClient } from './client';
import { AuthResponse, LoginCredentials, UserProfile } from '../types/auth';
import { ApiResponse } from '../types/api';

export const authApi = {
  /**
   * Authenticate user with credentials.
   * Note: The real backend performs password verification, JWT token issuance, and role authorization.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse> | AuthResponse>('/api/auth/login', credentials);
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as AuthResponse;
  },

  /**
   * Fetch authenticated user's profile and verified role from JWT token.
   */
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<UserProfile> | UserProfile>('/api/auth/me');
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as UserProfile;
  },

  /**
   * Logout from backend session if supported.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('xyz_auth_token');
        localStorage.removeItem('xyz_user_profile');
      }
    }
  }
};
