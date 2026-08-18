import React from 'react';
import { ChevronRight, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useRole } from '../../state/RoleContext';
import { StudentContextPanel } from './StudentContextPanel';
import { ParentContextPanel } from './ParentContextPanel';
import { TeacherContextPanel } from './TeacherContextPanel';
import { PrincipalAnalyticsPanel } from './PrincipalAnalyticsPanel';
import { cn } from '../../utils/cn';

interface RightPanelWrapperProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const RightPanelWrapper: React.FC<RightPanelWrapperProps> = ({
  isOpen,
  onToggle
}) => {
  const { user } = useAuth();
  const { selectedRole } = useRole();

  const activeRole = user ? user.role : selectedRole;

  return (
    <aside
      className={cn(
        'bg-slate-50 border-l border-slate-200 transition-all duration-300 flex flex-col shrink-0 z-20 relative overflow-hidden',
        isOpen ? 'w-80 md:w-88' : 'w-0 overflow-hidden border-l-0'
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white">
        <div className="flex items-center space-x-2">
          <h4 className="font-bold text-slate-900 text-sm tracking-tight font-display uppercase">
            Dashboard Preview
          </h4>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
        <button
          onClick={onToggle}
          title="Collapse Panel"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Role specific Bento Grid content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeRole === 'student' && <StudentContextPanel />}
        {activeRole === 'parent' && <ParentContextPanel />}
        {activeRole === 'teacher' && <TeacherContextPanel />}
        {activeRole === 'principal' && <PrincipalAnalyticsPanel />}
      </div>

      {/* Bottom Developer Note Card (Bento Style) */}
      <div className="p-4 border-t border-slate-200 bg-white mt-auto">
        <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
          <p className="text-[11px] font-bold text-blue-700 mb-1 uppercase tracking-wider">
            API Integration Scoped
          </p>
          <p className="text-[10px] leading-relaxed text-blue-600">
            Frontend is fully connected to backend contracts via <code className="font-mono font-semibold">/api/attendance</code> and <code className="font-mono font-semibold">/api/chat</code>.
          </p>
        </div>
      </div>
    </aside>
  );
};
