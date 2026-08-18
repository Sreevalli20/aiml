import React from 'react';
import { Menu, Sparkles, Mic, Bot, User, LogIn, LogOut, PanelRightOpen, PanelRightClose, FileCode2, Radio } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useRole } from '../../state/RoleContext';
import { LanguageSelector } from './LanguageSelector';
import { BackendStatusBadge } from './BackendStatusBadge';
import { UserRole } from '../../types/auth';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleRightPanel: () => void;
  isRightPanelOpen: boolean;
  onOpenAuth: () => void;
  onOpenDiagnostics: () => void;
  onOpenVoice: () => void;
  currentView: 'chat' | 'avatar' | 'docs';
  onChangeView: (view: 'chat' | 'avatar' | 'docs') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onToggleRightPanel,
  isRightPanelOpen,
  onOpenAuth,
  onOpenDiagnostics,
  onOpenVoice,
  currentView,
  onChangeView
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { selectedRole, setSelectedRole, currentPersona } = useRole();

  const roles: { role: UserRole; label: string }[] = [
    { role: 'student', label: 'Student' },
    { role: 'parent', label: 'Parent' },
    { role: 'teacher', label: 'Teacher' },
    { role: 'principal', label: 'Principal' }
  ];

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-4 md:px-8 flex items-center justify-between z-30 sticky top-0 shadow-xs">
      {/* Left: Mobile menu toggle + Brand Identity */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            X
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 tracking-tight font-display text-base">
                XYZ AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 uppercase tracking-wider font-mono">
                API Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[140px] sm:max-w-none">
              {currentPersona.badge}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Segmented Role Pill Switcher (Bento Style) */}
      <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium border border-slate-200/60">
        {roles.map((r) => {
          const isActive = (user ? user.role : selectedRole) === r.role;
          return (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={cn(
                'px-3.5 py-1.5 rounded-md transition-all cursor-pointer text-xs font-medium',
                isActive
                  ? 'bg-white shadow-sm text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* View Mode Toggle (Chat / Avatar Studio / API Docs) */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium border border-slate-200/60">
          <button
            onClick={() => onChangeView('chat')}
            className={cn(
              'px-3 py-1 rounded-md transition-all cursor-pointer',
              currentView === 'chat' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Chat
          </button>
          <button
            onClick={() => onChangeView('avatar')}
            className={cn(
              'px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1',
              currentView === 'avatar' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Avatar</span>
          </button>
          <button
            onClick={() => onChangeView('docs')}
            className={cn(
              'px-3 py-1 rounded-md transition-all cursor-pointer',
              currentView === 'docs' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            API Docs
          </button>
        </div>

        {/* Voice Trigger Button */}
        <button
          onClick={onOpenVoice}
          title="Voice Assistant Mode"
          className="p-2 rounded-xl text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <Mic className="w-4 h-4 text-blue-600" />
        </button>

        {/* Language Selector */}
        <LanguageSelector compact />

        {/* Backend Status */}
        <BackendStatusBadge onOpenDiagnostics={onOpenDiagnostics} />

        {/* Context Right Panel Toggle */}
        <button
          onClick={onToggleRightPanel}
          title={isRightPanelOpen ? 'Collapse ERP Context Panel' : 'Expand ERP Context Panel'}
          className={cn(
            'p-2 rounded-xl border transition-colors cursor-pointer',
            isRightPanelOpen
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          )}
        >
          {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        {/* Auth CTA */}
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
