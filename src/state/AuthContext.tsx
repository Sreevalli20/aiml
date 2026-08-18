import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, UserRole, LoginCredentials } from '../types/auth';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  authError: string | null;
  login: (creds: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  setActiveRole: (role: UserRole) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('xyz_user_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('xyz_auth_token');
    }
    return null;
  });

  // Default initial active role view for demo exploration (will be superseded by real authenticated role)
  const [activeRole, setActiveRoleState] = useState<UserRole>(user?.role || 'student');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync profile when token changes
  useEffect(() => {
    let isMounted = true;
    if (token) {
      setIsLoading(true);
      authApi.getMe()
        .then((profile) => {
          if (isMounted && profile) {
            setUser(profile);
            setActiveRoleState(profile.role);
            localStorage.setItem('xyz_user_profile', JSON.stringify(profile));
          }
        })
        .catch((err) => {
          // If token is expired or backend returned 401
          if (err instanceof ApiError && err.status === 401) {
            localStorage.removeItem('xyz_auth_token');
            localStorage.removeItem('xyz_user_profile');
            if (isMounted) {
              setToken(null);
              setUser(null);
            }
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const resp = await authApi.login(credentials);
      if (resp && resp.token) {
        localStorage.setItem('xyz_auth_token', resp.token);
        setToken(resp.token);
        if (resp.user) {
          localStorage.setItem('xyz_user_profile', JSON.stringify(resp.user));
          setUser(resp.user);
          setActiveRoleState(resp.user.role);
        }
        return true;
      }
      return false;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setAuthError(err.message);
      } else {
        setAuthError('Authentication failed. Please check your credentials or backend server status.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await authApi.logout();
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const setActiveRole = useCallback((role: UserRole) => {
    setActiveRoleState(role);
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    activeRole: user ? user.role : activeRole,
    authError,
    login,
    logout,
    setActiveRole,
    clearError
  }), [user, token, isLoading, activeRole, authError, login, logout, setActiveRole, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
