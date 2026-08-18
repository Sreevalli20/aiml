import React, { useState } from 'react';
import { X, Lock, UserCheck, ShieldAlert, GraduationCap, Users, BookOpen, Building2 } from 'lucide-react';
import { UserRole } from '../../types/auth';
import { useAuth } from '../../state/AuthContext';
import { cn } from '../../utils/cn';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'student'
}) => {
  const { login, isLoading, authError, clearError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState('STU2026042');
  const [password, setPassword] = useState('pass123');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleConfigs: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; placeholder: string; helper: string; defaultId: string }> = {
    student: {
      label: 'Student',
      icon: GraduationCap,
      placeholder: 'e.g. STU2026042 or student@school.edu',
      helper: 'Access attendance records, timetable, and study queries',
      defaultId: 'STU2026042'
    },
    parent: {
      label: 'Parent',
      icon: Users,
      placeholder: 'e.g. +91 9876543210 or parent@email.com',
      helper: "Track child's attendance & request teacher callbacks",
      defaultId: '+91 98765 43210'
    },
    teacher: {
      label: 'Teacher / Staff',
      icon: BookOpen,
      placeholder: 'e.g. TCH8801 or teacher@school.edu',
      helper: 'Classroom attendance actions, rosters & lesson tools',
      defaultId: 'TCH8801'
    },
    principal: {
      label: 'Management',
      icon: Building2,
      placeholder: 'e.g. ADM001 or principal@school.edu',
      helper: 'School-wide analytics, alerts & operational overview',
      defaultId: 'ADM001'
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(roleConfigs[role].defaultId);
    setPassword('pass123');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const idToUse = identifier.trim() || roleConfigs[selectedRole].defaultId;
    const pwdToUse = password || 'pass123';

    const success = await login({
      identifier: idToUse,
      password: pwdToUse,
      roleHint: selectedRole
    });

    if (success) {
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              X
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">XYZ AI Portal Login</h3>
              <p className="text-xs text-slate-500">Authenticate with School ERP credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role selector tab */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select School Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleConfigs) as UserRole[]).map((r) => {
                const config = roleConfigs[r];
                const Icon = config.icon;
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      handleRoleChange(r);
                    }}
                    className={cn(
                      'flex items-center space-x-2 p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer',
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isSelected ? 'text-blue-600' : 'text-slate-400')} />
                    <span className="text-xs">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              School ID / Registered Email / Phone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={roleConfigs[selectedRole].placeholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {roleConfigs[selectedRole].helper}
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password or Access Token
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Error notice */}
          {(localError || authError) && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Security notice */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-blue-700">Security Architecture: </span>
            This client calls <code className="text-blue-800 font-mono font-semibold">POST /api/auth/login</code>. Role verification and resource authorization are strictly validated by the backend.
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-2/3 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
