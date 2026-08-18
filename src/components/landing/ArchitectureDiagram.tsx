import React from 'react';
import { Cpu, Server, Database, ShieldCheck, ArrowRight, Layers, FileText } from 'lucide-react';

interface ArchitectureDiagramProps {
  onViewDocs: () => void;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ onViewDocs }) => {
  return (
    <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <Layers className="w-3.5 h-3.5" />
            <span>Clean Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Designed for Python / FastMCP Backends
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            The frontend serves as an untrusted client, communicating strictly through structured JSON API contracts.
          </p>
        </div>

        {/* Bento Grid Architecture flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: React / Vite Frontend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase">
                Tier 1: Client
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              React + TypeScript Frontend
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>State & Role Context Managers</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Web Audio & Speech Synthesizer</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Interactive Confirmation Action Cards</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Python Agentic Backend */}
          <div className="bg-[#0f172a] text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-900/50 px-2.5 py-1 rounded-md uppercase">
                Tier 2: Backend Orchestrator
              </span>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Python / FastMCP Server
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>JWT Authentication & RBAC</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>LLM Context & Tool Calling Orchestrator</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Speech Recognition & Voice TTS</span>
              </li>
            </ul>
          </div>

          {/* Card 3: School SIS / ERP Database */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase">
                Tier 3: School Data
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              School SIS / ERP / Database
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span>Real Student & Faculty Records</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span>Live Attendance Rolls & History</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span>Human Escalation Dispatch Inbox</span>
              </li>
            </ul>
          </div>
        </div>

        {/* API Contract CTA Bar */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-display">Ready for Backend Developers</h4>
              <p className="text-xs text-slate-500">Read the complete API specifications and sample payload models in the API contract.</p>
            </div>
          </div>
          <button
            onClick={onViewDocs}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-sm shadow-blue-500/20 shrink-0"
          >
            <span>Open API Contract</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
