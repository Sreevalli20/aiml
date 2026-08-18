import React from 'react';
import { Bot, Sparkles, LogIn, ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import { LandingHero } from '../components/landing/LandingHero';
import { FeaturesGrid } from '../components/landing/FeaturesGrid';
import { RoleShowcase } from '../components/landing/RoleShowcase';
import { ArchitectureDiagram } from '../components/landing/ArchitectureDiagram';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { UserRole } from '../types/auth';
import { useRole } from '../state/RoleContext';

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onOpenAuth: () => void;
  onViewDocs: () => void;
  onOpenDiagnostics: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
  onOpenAuth,
  onViewDocs,
  onOpenDiagnostics,
}) => {
  const { setSelectedRole } = useRole();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    onEnterWorkspace();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Sticky Landing Header */}
      <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            X
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight font-display text-base">
              XYZ AI
            </span>
            <span className="ml-2 hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono">
              ERP Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onEnterWorkspace}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Open Assistant</span>
          </button>

          <button
            onClick={onViewDocs}
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <span>API Docs</span>
          </button>

          <LanguageSelector compact />

          <button
            onClick={onOpenAuth}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      <LandingHero
        onGetStarted={onOpenAuth}
        onExploreDemo={onEnterWorkspace}
        onViewDocs={onViewDocs}
      />
      <FeaturesGrid />
      <RoleShowcase onSelectRole={handleRoleSelect} />
      <ArchitectureDiagram onViewDocs={onViewDocs} />
      <LandingFooter
        onViewDocs={onViewDocs}
        onOpenDiagnostics={onOpenDiagnostics}
      />
    </div>
  );
};
