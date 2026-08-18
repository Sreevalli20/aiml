import React, { useState } from 'react';
import { GraduationCap, Users, BookOpen, Building2, Check, ArrowRight, Bot } from 'lucide-react';
import { UserRole } from '../../types/auth';
import { cn } from '../../utils/cn';

interface RoleShowcaseProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleShowcase: React.FC<RoleShowcaseProps> = ({ onSelectRole }) => {
  const [activeTab, setActiveTab] = useState<UserRole>('student');

  const roleDetails: Record<UserRole, {
    title: string;
    badge: string;
    description: string;
    features: string[];
    samplePrompt: string;
    sampleResponse: string;
    color: string;
  }> = {
    student: {
      title: 'Student Portal Experience',
      badge: 'Academic & Attendance Clarity',
      description: 'Provides students with immediate, transparent insight into their attendance records, exam schedules, and classroom resources.',
      features: [
        'Personal attendance calculation and threshold alerts',
        'Academic FAQ assistance and exam calendar queries',
        'Direct connection to student ERP profile'
      ],
      samplePrompt: 'What is my current attendance percentage for Semester 1?',
      sampleResponse: 'Your overall attendance is currently 88.5% (85 of 96 working days attended). You meet the eligibility threshold.',
      color: 'blue',
    },
    parent: {
      title: 'Parent Portal Experience',
      badge: 'Transparent Student Progress',
      description: 'Keeps parents informed regarding daily attendance, school announcements, fee statuses, and offers immediate teacher callback escalation.',
      features: [
        'Multi-child support and individual performance logs',
        'Instant attendance discrepancy notifications',
        'One-click teacher escalation and callback requests'
      ],
      samplePrompt: 'Why was Rohan marked absent yesterday on Thursday?',
      sampleResponse: 'Rohan was recorded absent during the morning roll call. Would you like me to request a callback from his class teacher, Mrs. Sharma?',
      color: 'indigo',
    },
    teacher: {
      title: 'Teacher Portal Experience',
      badge: 'Classroom & Register Management',
      description: 'Empowers teachers to record and modify attendance quickly via natural language prompts with interactive confirmation safeguards.',
      features: [
        'Class section rosters and automated roll verification',
        'Natural-language attendance updates with Action Cards',
        'Escalation callback inbox management'
      ],
      samplePrompt: 'Mark Rahul absent today for Grade 10-A.',
      sampleResponse: 'I have prepared an attendance update: Mark Rahul (Grade 10-A) as Absent for today. Please confirm to commit this to the SIS.',
      color: 'emerald',
    },
    principal: {
      title: 'Principal & Management Portal',
      badge: 'School-Wide Operational Analytics',
      description: 'Offers school leadership real-time attendance trends, class-by-class breakdowns, faculty presence tracking, and system health metrics.',
      features: [
        'School-wide real-time attendance gauge and charts',
        'Class-by-class comparison and trend forecasting',
        'System architecture health and ERP sync telemetry'
      ],
      samplePrompt: 'Give me today’s school attendance overview across all grades.',
      sampleResponse: 'School attendance is currently at 94.2% across 1,240 enrolled students. Grade 10 has the highest attendance at 97.1%.',
      color: 'amber',
    },
  };

  const current = roleDetails[activeTab];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Designed for Every Stakeholder
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            Select a role to preview how XYZ AI customizes responses and workflow tools.
          </p>
        </div>

        {/* Role Tab Navigation (Bento Style) */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-2xl mx-auto">
          {[
            { id: 'student', label: 'Student', icon: GraduationCap },
            { id: 'parent', label: 'Parent', icon: Users },
            { id: 'teacher', label: 'Teacher', icon: BookOpen },
            { id: 'principal', label: 'Principal / Admin', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as UserRole)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-slate-500')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bento Showcase Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                {current.badge}
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">
                {current.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {current.description}
              </p>
            </div>

            <div className="space-y-2.5">
              {current.features.map((feat, i) => (
                <div key={i} className="flex items-center space-x-3 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectRole(activeTab)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Launch {tabTitle(activeTab)} Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Chat Preview Tile */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  X
                </div>
                <span className="text-xs font-bold text-slate-900 font-display">Simulated Exchange</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Preview</span>
            </div>

            {/* Simulated User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white text-xs p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-xs">
                {current.samplePrompt}
              </div>
            </div>

            {/* Simulated AI Response */}
            <div className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3.5 rounded-2xl rounded-tl-none leading-relaxed">
                {current.sampleResponse}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function tabTitle(role: UserRole): string {
  switch (role) {
    case 'student': return 'Student';
    case 'parent': return 'Parent';
    case 'teacher': return 'Teacher';
    case 'principal': return 'Principal';
  }
}
