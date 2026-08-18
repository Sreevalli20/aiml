import React from 'react';
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Sparkles, 
  Mic, 
  FileCode2, 
  Activity, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Building2, 
  Home, 
  LogOut, 
  LogIn, 
  Globe, 
  HelpCircle,
  X
} from 'lucide-react';
import { useChat } from '../../state/ChatContext';
import { useAuth } from '../../state/AuthContext';
import { useRole } from '../../state/RoleContext';
import { UserRole } from '../../types/auth';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
  currentView: 'chat' | 'avatar' | 'docs';
  onChangeView: (view: 'chat' | 'avatar' | 'docs') => void;
  onOpenVoice: () => void;
  onOpenDiagnostics: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNavigateHome,
  currentView,
  onChangeView,
  onOpenVoice,
  onOpenDiagnostics,
  onOpenAuth,
}) => {
  const {
    conversations,
    activeConversationId,
    startNewConversation,
    selectConversation,
    deleteConversation,
    isLoadingHistory,
  } = useChat();

  const { user, isAuthenticated, logout } = useAuth();
  const { selectedRole, setSelectedRole } = useRole();

  const activeRole = user ? user.role : selectedRole;

  const roleNavItems: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'student', label: 'Student Portal', icon: GraduationCap },
    { role: 'parent', label: 'Parent Portal', icon: Users },
    { role: 'teacher', label: 'Teacher Portal', icon: BookOpen },
    { role: 'principal', label: 'Management Portal', icon: Building2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              X
            </div>
            <div>
              <h1 className="text-white font-semibold tracking-tight text-xl leading-none font-display">
                XYZ AI
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                School Assistant
              </p>
            </div>
          </button>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => {
              startNewConversation();
              onChangeView('chat');
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Navigation & Conversations Scroll Area */}
        <nav className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigateHome();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                onChangeView('chat');
                onClose();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                currentView === 'chat'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Conversations</span>
            </button>

            <button
              onClick={() => {
                onChangeView('avatar');
                onClose();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                currentView === 'avatar'
                  ? 'bg-blue-600/15 text-blue-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Avatar Studio</span>
            </button>

            <button
              onClick={() => {
                onOpenVoice();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-blue-400" />
              <span>Voice Interaction</span>
            </button>
          </div>

          {/* Role Experience Switcher */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Role Portals
            </div>
            <div className="space-y-1">
              {roleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      setSelectedRole(item.role);
                      onChangeView('chat');
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                      isActive
                        ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-blue-400' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Conversations */}
          <div>
            <div className="flex items-center justify-between px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>Chat History</span>
              <span className="font-mono text-[9px]">{conversations.length}</span>
            </div>

            {conversations.length === 0 ? (
              <div className="px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400">No past conversations</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Loaded via <code className="font-mono">/api/conversations</code></p>
              </div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {conversations.map((c) => {
                  const isSelected = activeConversationId === c.id;
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        'group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-blue-950/60 text-blue-200 border border-blue-800/50 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      )}
                      onClick={() => {
                        selectConversation(c.id);
                        onChangeView('chat');
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{c.title || 'Conversation'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(c.id);
                        }}
                        title="Delete conversation"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* System & Architecture */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              API & System
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onChangeView('docs');
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  currentView === 'docs'
                    ? 'bg-blue-600/15 text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                <FileCode2 className="w-4 h-4 text-blue-400" />
                <span>API Contract</span>
              </button>

              <button
                onClick={() => {
                  onOpenDiagnostics();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>System Diagnostics</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer User Card (Bento Style) */}
        <div className="p-4 border-t border-slate-800 bg-[#0c1322]">
          {isAuthenticated && user ? (
            <div className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-3 border border-slate-700/60">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user.role} Portal</p>
              </div>
              <button
                onClick={() => logout()}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Guest Session</p>
                  <p className="text-[10px] text-slate-400">Ready to Connect</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onOpenAuth();
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
