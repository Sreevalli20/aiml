import React, { useState } from 'react';
import { 
  FileCode2, 
  Send, 
  Lock, 
  CheckCircle, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { API_CONFIG } from '../../config/env';
import { cn } from '../../utils/cn';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'Authentication' | 'Conversations & Chat' | 'Attendance' | 'ERP Entities' | 'Human Support' | 'Voice Processing';
  description: string;
  authRequired: boolean;
  requiredRole?: string;
  requestBody?: string;
  responseBody: string;
}

export const API_ENDPOINTS: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    category: 'Authentication',
    description: 'Authenticate user credentials with school ERP database and receive JWT access token.',
    authRequired: false,
    requestBody: JSON.stringify({
      identifier: 'STU2026042',
      password: '••••••••••••',
      roleHint: 'student'
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'usr_99182',
          name: 'Rahul Sharma',
          email: 'rahul@school.edu',
          role: 'student',
          identifier: 'STU2026042',
          schoolName: 'Greenwood International School'
        },
        expiresIn: 86400
      }
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/auth/me',
    category: 'Authentication',
    description: 'Fetch current authenticated user profile and cryptographically verified role permissions.',
    authRequired: true,
    responseBody: JSON.stringify({
      success: true,
      data: {
        id: 'usr_99182',
        name: 'Rahul Sharma',
        role: 'student',
        identifier: 'STU2026042',
        schoolName: 'Greenwood International School'
      }
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/v1/chat',
    category: 'Conversations & Chat',
    description: 'Send user prompt to the AI agent orchestration layer. Maintains multi-turn context via conversation_id.',
    authRequired: true,
    requestBody: JSON.stringify({
      message: 'What is my attendance?',
      conversation_id: 'conv_4812a',
      language: 'en',
      role_hint: 'student',
      client_timestamp: '2026-08-18T03:45:00Z'
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      data: {
        conversation_id: 'conv_4812a',
        message: 'Your overall attendance for the current term is 91.2% (155 present out of 170 working days).',
        action_required: null,
        escalation_offered: null,
        suggested_follow_ups: ['Show my monthly breakdown', 'Show my recent absences']
      }
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/chat/conversations',
    category: 'Conversations & Chat',
    description: 'List user conversation histories with timestamps and summaries.',
    authRequired: true,
    responseBody: JSON.stringify({
      success: true,
      data: [
        {
          id: 'conv_4812a',
          title: 'Term Attendance Inquiry',
          lastMessage: 'Your overall attendance is 91.2%',
          updatedAt: '2026-08-18T03:45:00Z',
          messageCount: 4
        }
      ]
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/chat/conversations/{conversation_id}',
    category: 'Conversations & Chat',
    description: 'Retrieve full message transcript and action cards for a specific conversation.',
    authRequired: true,
    responseBody: JSON.stringify({
      success: true,
      data: [
        {
          id: 'msg_1',
          sender: 'user',
          content: 'What is my attendance?',
          timestamp: '2026-08-18T03:44:50Z'
        },
        {
          id: 'msg_2',
          sender: 'assistant',
          content: 'Your overall attendance is 91.2%.',
          timestamp: '2026-08-18T03:44:52Z'
        }
      ]
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/attendance/me',
    category: 'Attendance',
    description: 'Fetch student personal attendance statistics for the current academic session.',
    authRequired: true,
    requiredRole: 'student',
    responseBody: JSON.stringify({
      success: true,
      data: {
        studentId: 'STU2026042',
        studentName: 'Rahul Sharma',
        attendancePercentage: 91.2,
        presentDays: 155,
        absentDays: 15,
        workingDays: 170,
        periodStart: '2026-01-05',
        periodEnd: '2026-08-17'
      }
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/attendance/child/{child_id}',
    category: 'Attendance',
    description: 'Fetch attendance records for a specific child (authorized parent only).',
    authRequired: true,
    requiredRole: 'parent',
    responseBody: JSON.stringify({
      success: true,
      data: {
        studentId: 'STU2026042',
        studentName: 'Rahul Sharma',
        attendancePercentage: 91.2,
        presentDays: 155,
        absentDays: 15,
        workingDays: 170
      }
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/v1/attendance/mark',
    category: 'Attendance',
    description: 'Teacher mutation to mark/update daily student attendance in the school register.',
    authRequired: true,
    requiredRole: 'teacher',
    requestBody: JSON.stringify({
      studentId: 'STU2026042',
      studentName: 'Rahul Sharma',
      classId: 'cls_10a',
      date: '2026-08-18',
      status: 'absent',
      remarks: 'Informed sick leave'
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      message: 'Attendance record updated successfully for Rahul Sharma (Absent).',
      transactionId: 'txn_att_8892'
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/attendance/analytics',
    category: 'Attendance',
    description: 'School-wide attendance analytics, distributions, and trend metrics for School Management & Principal.',
    authRequired: true,
    requiredRole: 'principal',
    responseBody: JSON.stringify({
      success: true,
      data: {
        overallPercentage: 94.6,
        totalEnrolled: 1240,
        todayPresent: 1173,
        todayAbsent: 67,
        date: '2026-08-18',
        classBreakdown: [
          { classId: '10A', className: 'Grade 10-A', totalStudents: 40, presentCount: 38, absentCount: 2, attendancePercentage: 95.0 },
          { classId: '10B', className: 'Grade 10-B', totalStudents: 38, presentCount: 35, absentCount: 3, attendancePercentage: 92.1 }
        ]
      }
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/children',
    category: 'ERP Entities',
    description: 'List children registered under the authenticated parent account.',
    authRequired: true,
    requiredRole: 'parent',
    responseBody: JSON.stringify({
      success: true,
      data: [
        {
          id: 'STU2026042',
          name: 'Rahul Sharma',
          grade: '10',
          section: 'A',
          rollNo: '24'
        }
      ]
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/students',
    category: 'ERP Entities',
    description: 'Query student rosters with optional class_id or search keyword filters.',
    authRequired: true,
    requiredRole: 'teacher | principal',
    responseBody: JSON.stringify({
      success: true,
      data: [
        { id: 'STU2026042', name: 'Rahul Sharma', rollNo: '24', grade: '10', section: 'A' }
      ]
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/teachers',
    category: 'ERP Entities',
    description: 'List faculty staff members and department directory.',
    authRequired: true,
    responseBody: JSON.stringify({
      success: true,
      data: [
        { id: 'TCH8801', name: 'Mrs. Anjali Rao', subject: 'Mathematics', department: 'Science' }
      ]
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/support/call-request',
    category: 'Human Support',
    description: 'Parent escalation endpoint to request a callback from a teacher or administration.',
    authRequired: true,
    requiredRole: 'parent',
    requestBody: JSON.stringify({
      teacherId: 'TCH8801',
      studentId: 'STU2026042',
      reason: 'Discuss quarterly attendance & upcoming exams',
      contactNumber: '+91 98765 43210'
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      requestId: 'req_call_7719',
      status: 'submitted',
      message: 'Your call request has been submitted to the teacher.'
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/voice/transcribe',
    category: 'Voice Processing',
    description: 'Transcribe multipart/form-data audio blob to text via Speech-to-Text pipeline.',
    authRequired: true,
    responseBody: JSON.stringify({
      success: true,
      data: {
        text: 'What is my attendance?',
        detectedLanguage: 'en',
        confidence: 0.98
      }
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/voice/synthesize',
    category: 'Voice Processing',
    description: 'Convert text response to speech audio via Text-to-Speech synthesis.',
    authRequired: true,
    requestBody: JSON.stringify({
      text: 'Rahul currently has 91.2% attendance.',
      language: 'en',
      voiceGender: 'female'
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      data: {
        audioUrl: 'https://cdn.xyzai.school/audio/syn_9981.mp3',
        durationSeconds: 3.4
      }
    }, null, 2)
  }
];

export const ApiDocsViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({
    'POST /api/v1/chat': true,
    'POST /api/v1/auth/login': true
  });

  const categories = ['All', 'Authentication', 'Conversations & Chat', 'Attendance', 'ERP Entities', 'Human Support', 'Voice Processing'];

  const filteredEndpoints = selectedCategory === 'All'
    ? API_ENDPOINTS
    : API_ENDPOINTS.filter((e) => e.category === selectedCategory);

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold uppercase tracking-wider">
            <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Backend Integration Contract Specification</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">
            XYZ AI REST API Contract
          </h2>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            This API contract specifies all 15 endpoints required by the XYZ AI frontend. The Python backend (FastAPI / Flask) provides authentication, role verification, database mutations, and AI agent orchestration.
          </p>
        </div>

        {/* Integration Architecture Bento Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Target Connection Settings</span>
            </h4>
            <span className="text-xs font-mono text-blue-600 font-semibold">
              VITE_API_BASE_URL: {API_CONFIG.baseUrl || '(Relative Origin)'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-slate-500 font-semibold mb-1">Frontend Client</span>
              <span className="text-slate-900 font-mono font-bold">React 19 + TypeScript (Vercel)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-slate-500 font-semibold mb-1">Backend Server</span>
              <span className="text-slate-900 font-mono font-bold">Python (FastAPI / Render)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-slate-500 font-semibold mb-1">Auth Protocol</span>
              <span className="text-slate-900 font-mono font-bold">Bearer JWT (Auth Header)</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Endpoints List */}
        <div className="space-y-3">
          {filteredEndpoints.map((ep) => {
            const key = `${ep.method} ${ep.path}`;
            const isExpanded = Boolean(expandedEndpoints[key]);

            return (
              <div
                key={key}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Endpoint Header Bar */}
                <div
                  onClick={() => toggleEndpoint(key)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider',
                        ep.method === 'GET' && 'bg-blue-50 text-blue-700 border border-blue-200',
                        ep.method === 'POST' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                        ep.method === 'DELETE' && 'bg-rose-50 text-rose-700 border border-rose-200'
                      )}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-900 truncate">{ep.path}</span>
                    {ep.requiredRole && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                        Role: {ep.requiredRole}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs text-slate-500 hidden md:inline">{ep.category}</span>
                    {ep.authRequired ? (
                      <span className="flex items-center space-x-1 text-[11px] text-amber-600 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Auth</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Public</span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs">
                    <p className="text-slate-600 leading-relaxed font-normal">{ep.description}</p>

                    {ep.requestBody && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span className="font-bold uppercase tracking-wider">Example Request Body (JSON)</span>
                          <button
                            onClick={() => handleCopy(ep.requestBody || '', `${key}-req`)}
                            className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 cursor-pointer font-sans"
                          >
                            {copiedKey === `${key}-req` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono overflow-x-auto text-xs">
                          {ep.requestBody}
                        </pre>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="font-bold uppercase tracking-wider">Example Response (200 OK JSON)</span>
                        <button
                          onClick={() => handleCopy(ep.responseBody, `${key}-res`)}
                          className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 cursor-pointer font-sans"
                        >
                          {copiedKey === `${key}-res` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-mono overflow-x-auto text-xs">
                        {ep.responseBody}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
