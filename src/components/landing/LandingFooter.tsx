import React from 'react';
import { Bot, Shield, Globe, Github } from 'lucide-react';

interface LandingFooterProps {
  onViewDocs: () => void;
  onOpenDiagnostics: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onViewDocs,
  onOpenDiagnostics
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-4 md:px-8 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            X
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight font-display text-sm">
              XYZ AI
            </span>
            <p className="text-[11px] text-slate-400">
              Human-Like AI School Assistant
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
          <button
            onClick={onViewDocs}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            API Contract
          </button>
          <button
            onClick={onOpenDiagnostics}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Diagnostics & Telemetry
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">Vercel & Cloud-Ready SPA</span>
        </div>

        {/* Copyright */}
        <div className="text-slate-400 text-center md:text-right font-mono text-[11px]">
          XYZ AI Frontend • Production Ready
        </div>
      </div>
    </footer>
  );
};
