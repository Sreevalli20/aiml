import React from 'react';
import { Bot, ArrowRight, Sparkles, Shield, Mic, Globe, Cpu, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';

interface LandingHeroProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
  onViewDocs: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onGetStarted,
  onExploreDemo,
  onViewDocs,
}) => {
  const { currentLanguage } = useLanguage();

  return (
    <div className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 bg-white">
      {/* Background Ambient Bento Grid subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 text-center space-y-8">
        {/* Top Tag Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Next-Generation School ERP AI Assistant</span>
          <span className="w-1 h-1 rounded-full bg-blue-400" />
          <span className="font-mono text-[11px] text-blue-800">11 Regional Languages</span>
        </div>

        {/* Brand Headline & Subheading */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.15]">
            XYZ AI — <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">Your Intelligent School Assistant</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            One intelligent assistant for students, parents, teachers and school management.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-150 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemo}
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span>Launch Workspace</span>
          </button>

          <button
            onClick={onViewDocs}
            className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 transition-all duration-150 cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>API Specification</span>
          </button>
        </div>

        {/* Feature Highlights Bento Grid Strip */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3 hover:border-blue-300 transition-colors">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">4 Stakeholder Roles</p>
              <p className="text-[10px] text-slate-500">Student, Parent, Staff, Admin</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3 hover:border-blue-300 transition-colors">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Voice & AI Avatar</p>
              <p className="text-[10px] text-slate-500">Speech-to-Text & Synthesizer</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3 hover:border-blue-300 transition-colors">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">11 Languages</p>
              <p className="text-[10px] text-slate-500">Indian Regional Languages</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3 hover:border-blue-300 transition-colors">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">API Contract Ready</p>
              <p className="text-[10px] text-slate-500">Zero Fake Hardcoded Data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
