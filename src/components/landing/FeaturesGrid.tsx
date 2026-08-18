import React from 'react';
import { 
  MessageSquare, 
  Users, 
  CalendarCheck, 
  BarChart3, 
  PhoneForwarded, 
  Sparkles, 
  Mic, 
  Languages, 
  CheckCircle,
  FileCode2,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Built for the Modern School Ecosystem
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            Everything needed to connect AI agents to your School SIS/ERP system seamlessly.
          </p>
        </div>

        {/* Bento Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 (Span 2): Multi-Role AI Assistant */}
          <div className="md:col-span-2 bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Role-Aware Intelligent Conversations
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                XYZ AI automatically adapts its tone, knowledge domain, and permissions based on whether a Student, Parent, Teacher, or Principal is logged in.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-800 block">Student</span>
                <span className="text-[10px] text-slate-500">Attendance & FAQs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-800 block">Parent</span>
                <span className="text-[10px] text-slate-500">Child Progress & Callbacks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-800 block">Teacher</span>
                <span className="text-[10px] text-slate-500">Attendance Actions</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-800 block">Principal</span>
                <span className="text-[10px] text-slate-500">School-Wide Analytics</span>
              </div>
            </div>
          </div>

          {/* Card 2: Voice & Interactive Avatar */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Mic className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Voice & Real-Time Avatar
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Natural speech interaction with live audio waveform analysis and an animated SVG AI Avatar persona.
                </p>
              </div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl text-white text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Audio Engine</span>
                <span className="text-emerald-400 font-mono">Web Audio API</span>
              </div>
              <p className="text-[10px] text-slate-300">Live mic capture + speech synthesis fallback</p>
            </div>
          </div>

          {/* Card 3: Action Confirmation Cards */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Action Cards & Confirmation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When teachers request attendance changes, XYZ AI renders an interactive Confirmation Card to prevent accidental modifications.
              </p>
            </div>
          </div>

          {/* Card 4: Human Escalation */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <PhoneForwarded className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Human Teacher Escalation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Parents can request direct callbacks or meetings with class teachers through a dedicated escalation card.
              </p>
            </div>
          </div>

          {/* Card 5: 11 Regional Languages */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Languages className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Multilingual by Design
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                English, Hindi, Telugu, Tamil, Marathi, Bengali, Gujarati, Kannada, Malayalam, Punjabi, and Odia supported with automatic header passthrough.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
