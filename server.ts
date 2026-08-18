import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Initialize lazy Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// In-Memory ERP Database
interface Student {
  id: string;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  workingDays: number;
  recentAbsences: string[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  department: string;
  phone: string;
  assignedClasses: string[];
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  childrenIds: string[];
}

interface CallRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  parentId: string;
  reason: string;
  contactNumber: string;
  status: 'pending' | 'acknowledged' | 'completed';
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionCard?: {
    type: 'attendance_confirmation' | 'call_scheduled';
    data: Record<string, unknown>;
  };
  suggestedFollowUps?: string[];
}

interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Mock Data
const STUDENTS: Student[] = [
  {
    id: 'STU2026042',
    name: 'Rahul Sharma',
    rollNo: '24',
    grade: '10',
    section: 'A',
    parentId: 'PAR901',
    parentName: 'Mr. Alok Sharma',
    parentPhone: '+91 98765 43210',
    attendancePercentage: 91.2,
    presentDays: 155,
    absentDays: 15,
    workingDays: 170,
    recentAbsences: ['2026-08-12 (Medical)', '2026-07-25 (Fever)', '2026-07-14 (Family Event)'],
  },
  {
    id: 'STU2026043',
    name: 'Sneha Patel',
    rollNo: '25',
    grade: '10',
    section: 'A',
    parentId: 'PAR902',
    parentName: 'Mrs. Kavita Patel',
    parentPhone: '+91 98765 43211',
    attendancePercentage: 96.5,
    presentDays: 164,
    absentDays: 6,
    workingDays: 170,
    recentAbsences: ['2026-08-01 (Family Event)'],
  },
  {
    id: 'STU2026044',
    name: 'Amit Kumar',
    rollNo: '26',
    grade: '10',
    section: 'A',
    parentId: 'PAR903',
    parentName: 'Mr. Rajesh Kumar',
    parentPhone: '+91 98765 43212',
    attendancePercentage: 88.2,
    presentDays: 150,
    absentDays: 20,
    workingDays: 170,
    recentAbsences: ['2026-08-15 (Leave)', '2026-08-16 (Sick)'],
  },
  {
    id: 'STU2026045',
    name: 'Priya Singh',
    rollNo: '27',
    grade: '10',
    section: 'A',
    parentId: 'PAR904',
    parentName: 'Mrs. Rekha Singh',
    parentPhone: '+91 98765 43213',
    attendancePercentage: 94.1,
    presentDays: 160,
    absentDays: 10,
    workingDays: 170,
    recentAbsences: ['2026-07-20 (Leave)'],
  },
  {
    id: 'STU2026046',
    name: 'Vikram Joshi',
    rollNo: '28',
    grade: '10',
    section: 'B',
    parentId: 'PAR905',
    parentName: 'Mr. Suresh Joshi',
    parentPhone: '+91 98765 43214',
    attendancePercentage: 74.5,
    presentDays: 126,
    absentDays: 44,
    workingDays: 170,
    recentAbsences: ['2026-08-10 (Uninformed)', '2026-08-11 (Uninformed)', '2026-08-12 (Uninformed)'],
  },
];

const TEACHERS: Teacher[] = [
  {
    id: 'TCH8801',
    name: 'Mrs. Anjali Rao',
    email: 'anjali.rao@xyzschool.edu',
    subject: 'Mathematics & Statistics',
    department: 'Science & Math',
    phone: '+91 98111 22334',
    assignedClasses: ['cls_10a', 'cls_10b'],
  },
  {
    id: 'TCH8802',
    name: 'Mr. David Miller',
    email: 'david.miller@xyzschool.edu',
    subject: 'English & Literature',
    department: 'Humanities',
    phone: '+91 98111 22335',
    assignedClasses: ['cls_10a', 'cls_9a'],
  },
  {
    id: 'TCH8803',
    name: 'Dr. Sunita Menon',
    email: 'sunita.menon@xyzschool.edu',
    subject: 'Physics & Chemistry',
    department: 'Science',
    phone: '+91 98111 22336',
    assignedClasses: ['cls_10a', 'cls_11a'],
  },
];

const PARENTS: Parent[] = [
  {
    id: 'PAR901',
    name: 'Mr. Alok Sharma',
    email: 'alok.sharma@gmail.com',
    phone: '+91 98765 43210',
    childrenIds: ['STU2026042'],
  },
  {
    id: 'PAR902',
    name: 'Mrs. Kavita Patel',
    email: 'kavita.patel@gmail.com',
    phone: '+91 98765 43211',
    childrenIds: ['STU2026043'],
  },
];

const CALL_REQUESTS: CallRequest[] = [];
const CONVERSATIONS: Map<string, Conversation> = new Map();

// Helper to find or create conversation
function getOrCreateConversation(conversationId: string | undefined, userId = 'default_user'): Conversation {
  const id = conversationId && conversationId.trim() !== '' ? conversationId : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (!CONVERSATIONS.has(id)) {
    CONVERSATIONS.set(id, {
      id,
      userId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return CONVERSATIONS.get(id)!;
}

// Language Name Map
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  or: 'Odia (ଓଡ଼ିଆ)',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Helper auth extractor
  const getAuthUser = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.startsWith('stu_') || token.includes('student')) {
        return { id: 'STU2026042', role: 'student', name: 'Rahul Sharma', email: 'rahul@xyzschool.edu' };
      }
      if (token.startsWith('par_') || token.includes('parent')) {
        return { id: 'PAR901', role: 'parent', name: 'Mr. Alok Sharma', email: 'alok.sharma@gmail.com' };
      }
      if (token.startsWith('tch_') || token.includes('teacher')) {
        return { id: 'TCH8801', role: 'teacher', name: 'Mrs. Anjali Rao', email: 'anjali.rao@xyzschool.edu' };
      }
      if (token.startsWith('adm_') || token.includes('principal')) {
        return { id: 'ADM001', role: 'principal', name: 'Dr. Ramesh Mehta', email: 'principal@xyzschool.edu' };
      }
      return { id: 'usr_guest', role: 'student', name: 'Rahul Sharma', email: 'rahul@xyzschool.edu' };
    }
    return null;
  };

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      status: 'healthy',
      school: 'XYZ AI International Academy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password, roleHint } = req.body || {};
    const effectiveRole = roleHint || (identifier?.toLowerCase().includes('tch') ? 'teacher' : identifier?.toLowerCase().includes('adm') ? 'principal' : identifier?.includes('@') && !identifier.includes('school') ? 'parent' : 'student');

    let user = {
      id: 'STU2026042',
      name: 'Rahul Sharma',
      email: 'rahul@xyzschool.edu',
      role: 'student',
      identifier: identifier || 'STU2026042',
      schoolName: 'Greenwood International School',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };

    if (effectiveRole === 'parent') {
      user = {
        id: 'PAR901',
        name: 'Mr. Alok Sharma',
        email: 'alok.sharma@gmail.com',
        role: 'parent',
        identifier: identifier || '+91 98765 43210',
        schoolName: 'Greenwood International School',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      };
    } else if (effectiveRole === 'teacher') {
      user = {
        id: 'TCH8801',
        name: 'Mrs. Anjali Rao',
        email: 'anjali.rao@xyzschool.edu',
        role: 'teacher',
        identifier: identifier || 'TCH8801',
        schoolName: 'Greenwood International School',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      };
    } else if (effectiveRole === 'principal') {
      user = {
        id: 'ADM001',
        name: 'Dr. Ramesh Mehta',
        email: 'principal@xyzschool.edu',
        role: 'principal',
        identifier: identifier || 'ADM001',
        schoolName: 'Greenwood International School',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      };
    }

    const token = `jwt_${effectiveRole}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    res.json({
      success: true,
      data: {
        token,
        user,
        expiresIn: 86400,
      },
    });
  });

  // Auth: Me
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req) || {
      id: 'STU2026042',
      role: 'student',
      name: 'Rahul Sharma',
      email: 'rahul@xyzschool.edu',
      schoolName: 'Greenwood International School',
    };
    res.json({ success: true, data: user });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // ==========================================
  // CHAT & AI AGENT ORCHESTRATION
  // ==========================================
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, conversation_id, language = 'en', role_hint = 'student' } = req.body || {};

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, message: 'Message text is required.' });
      }

      const authUser = getAuthUser(req);
      const activeRole = authUser?.role || role_hint || 'student';
      const conversation = getOrCreateConversation(conversation_id, authUser?.id || 'guest');

      // Add user message to conversation history
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      conversation.messages.push(userMsg);

      // Auto update conversation title if first message
      if (conversation.messages.length <= 2) {
        conversation.title = message.length > 35 ? `${message.substring(0, 32)}...` : message;
      }

      // Check for attendance marking intent from teacher
      const lowerMsg = message.toLowerCase();
      let actionRequired: ChatMessage['actionCard'] | null = null;
      let escalationOffered = false;

      // Handle Teacher Attendance Mutation Trigger
      if (activeRole === 'teacher' && (lowerMsg.includes('mark') || lowerMsg.includes('absent') || lowerMsg.includes('present') || lowerMsg.includes('attendance'))) {
        const studentMatch = STUDENTS.find((s) => lowerMsg.includes(s.name.toLowerCase()) || lowerMsg.includes(s.rollNo));
        if (studentMatch) {
          const status = lowerMsg.includes('absent') ? 'absent' : 'present';
          actionRequired = {
            type: 'attendance_confirmation',
            data: {
              studentId: studentMatch.id,
              studentName: studentMatch.name,
              rollNo: studentMatch.rollNo,
              grade: studentMatch.grade,
              section: studentMatch.section,
              date: new Date().toISOString().split('T')[0],
              status,
              remarks: lowerMsg.includes('sick') ? 'Reported sick leave' : 'Daily register update',
            },
          };
        }
      }

      // Handle Parent Escalation Request Trigger
      if (activeRole === 'parent' && (lowerMsg.includes('call') || lowerMsg.includes('talk to teacher') || lowerMsg.includes('meet teacher') || lowerMsg.includes('discuss') || lowerMsg.includes('speak'))) {
        escalationOffered = true;
      }

      // School context for prompt construction
      const studentContext = STUDENTS[0]; // Default student Rahul Sharma
      const targetLangName = LANGUAGE_NAMES[language] || 'English';

      let aiResponseText = '';
      const ai = getGemini();

      if (ai) {
        try {
          const systemInstruction = `You are XYZ AI, the human-like, friendly, professional school assistant for Greenwood International School.
Current User Role: ${activeRole.toUpperCase()}
User Name: ${authUser?.name || (activeRole === 'student' ? 'Rahul Sharma' : activeRole === 'parent' ? 'Mr. Alok Sharma' : activeRole === 'teacher' ? 'Mrs. Anjali Rao' : 'Dr. Ramesh Mehta')}
Requested Response Language: ${targetLangName}. ALWAYS formulate your entire natural reply in ${targetLangName}.

SCHOOL DATA CONTEXT:
- Student Name: ${studentContext.name} (Roll No: ${studentContext.rollNo}, Grade: ${studentContext.grade}-${studentContext.section})
- Attendance: ${studentContext.attendancePercentage}% (${studentContext.presentDays} present out of ${studentContext.workingDays} working days, ${studentContext.absentDays} absences).
- Minimum Required Attendance for Exams: 75%.
- Recent Absences: ${studentContext.recentAbsences.join(', ')}.
- Upcoming Exams: Term 2 Finals begin October 12, 2026. Mathematics on Oct 12, Physics on Oct 15, English on Oct 18.
- School Timetable: Monday to Friday, 8:30 AM to 3:30 PM.
- Class Teacher: Mrs. Anjali Rao (Mathematics).
- Principal: Dr. Ramesh Mehta.

RULES:
1. Provide direct, helpful, warm, and factual responses based on the school context.
2. If answering about attendance, mention the exact percentage (${studentContext.attendancePercentage}%) and reassure that they are above the 75% requirement.
3. If the role is Teacher and they mention marking attendance, acknowledge the request and inform them that an Action Confirmation Card is prepared for their one-tap approval.
4. If the role is Parent asking to talk to the teacher, offer to arrange a callback request with Mrs. Anjali Rao.
5. Keep answers concise (2 to 4 sentences) and well formatted. Respond naturally in ${targetLangName}.`;

          const pastTurns = conversation.messages.slice(-6, -1).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          }));

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: [
              ...pastTurns,
              { role: 'user', parts: [{ text: message }] },
            ],
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          aiResponseText = response.text || '';
        } catch (genErr) {
          console.error('Gemini generation error, falling back to heuristic response:', genErr);
        }
      }

      // Fallback if Gemini key is missing or errored
      if (!aiResponseText) {
        if (lowerMsg.includes('attendance') || lowerMsg.includes('percentage') || lowerMsg.includes('absent') || lowerMsg.includes('present')) {
          if (activeRole === 'student') {
            aiResponseText = `Your overall attendance for the current term is ${studentContext.attendancePercentage}% (${studentContext.presentDays} present out of ${studentContext.workingDays} working days). You are well above the mandatory 75% exam eligibility threshold.`;
          } else if (activeRole === 'parent') {
            aiResponseText = `Rahul currently has ${studentContext.attendancePercentage}% attendance (${studentContext.presentDays}/${studentContext.workingDays} days). His last recorded absence was on August 12 (Medical). Would you like to schedule a call with his class teacher?`;
          } else if (activeRole === 'teacher') {
            aiResponseText = `Grade 10-A has an average attendance of 93.4% today with 38 present and 2 absent. I have prepared the attendance record for your review below.`;
          } else {
            aiResponseText = `The school-wide attendance today stands at 94.6% (1,173 present out of 1,240 enrolled students). All class registers are synchronized.`;
          }
        } else if (lowerMsg.includes('exam') || lowerMsg.includes('test') || lowerMsg.includes('schedule')) {
          aiResponseText = `The Term 2 Finals are scheduled to commence on October 12, 2026. The examination hall tickets will be issued once attendance clearances are finalized.`;
        } else if (lowerMsg.includes('teacher') || lowerMsg.includes('call') || lowerMsg.includes('contact')) {
          aiResponseText = `Mrs. Anjali Rao (Class Teacher & Mathematics Dept) is available during consultation hours from 3:30 PM to 4:30 PM. I can schedule a direct callback request for you.`;
        } else {
          aiResponseText = `Hello! I am your XYZ AI school assistant. I can help you check real-time attendance, look up exam timetables, review classroom rosters, or coordinate with school faculty. What would you like to inquire about today?`;
        }
      }

      // Suggested follow-ups based on role
      const followUps = activeRole === 'student'
        ? ['What is the minimum attendance required for exams?', 'When do Term 2 exams start?', 'Show my recent absences']
        : activeRole === 'parent'
        ? ['Show monthly attendance breakdown', 'Schedule call with class teacher', 'Check upcoming holidays']
        : activeRole === 'teacher'
        ? ['Show absent students in Grade 10-A', 'Mark Sneha Patel present', 'Generate weekly attendance summary']
        : ['View class-wise attendance report', 'Check low-attendance student alerts', 'Export monthly attendance CSV'];

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        sender: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toISOString(),
        actionCard: actionRequired || undefined,
        suggestedFollowUps: followUps,
      };

      conversation.messages.push(assistantMsg);
      conversation.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        data: {
          conversation_id: conversation.id,
          message: aiResponseText,
          action_required: actionRequired ? actionRequired.data : null,
          escalation_offered: escalationOffered ? { teacherId: 'TCH8801', teacherName: 'Mrs. Anjali Rao', studentId: 'STU2026042' } : null,
          suggested_follow_ups: followUps,
        },
      });
    } catch (err: unknown) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({ success: false, message: 'Internal server error processing chat message.' });
    }
  });

  // Conversations: List
  app.get('/api/conversations', (req: Request, res: Response) => {
    const list = Array.from(CONVERSATIONS.values()).map((c) => ({
      id: c.id,
      title: c.title,
      lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1].content : '',
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
    }));
    res.json({ success: true, data: list });
  });

  // Conversations: Get Messages
  app.get('/api/conversations/:id', (req: Request, res: Response) => {
    const conv = CONVERSATIONS.get(req.params.id);
    if (!conv) {
      return res.json({ success: true, data: [] });
    }
    res.json({ success: true, data: conv.messages });
  });

  // Conversations: Create
  app.post('/api/conversations', (req: Request, res: Response) => {
    const { title } = req.body || {};
    const conv = getOrCreateConversation(undefined);
    if (title) conv.title = title;
    res.json({ success: true, data: { conversation_id: conv.id, title: conv.title } });
  });

  // Conversations: Delete
  app.delete('/api/conversations/:id', (req: Request, res: Response) => {
    CONVERSATIONS.delete(req.params.id);
    res.json({ success: true, message: 'Conversation deleted' });
  });

  // ==========================================
  // ATTENDANCE ENDPOINTS
  // ==========================================
  app.get('/api/attendance/me', (req: Request, res: Response) => {
    const stu = STUDENTS[0];
    res.json({
      success: true,
      data: {
        studentId: stu.id,
        studentName: stu.name,
        attendancePercentage: stu.attendancePercentage,
        presentDays: stu.presentDays,
        absentDays: stu.absentDays,
        workingDays: stu.workingDays,
        periodStart: '2026-01-05',
        periodEnd: '2026-08-17',
        history: [
          { month: 'January', present: 22, working: 22, percentage: 100 },
          { month: 'February', present: 20, working: 21, percentage: 95.2 },
          { month: 'March', present: 21, working: 23, percentage: 91.3 },
          { month: 'April', present: 19, working: 20, percentage: 95.0 },
          { month: 'May', present: 18, working: 20, percentage: 90.0 },
          { month: 'June', present: 17, working: 20, percentage: 85.0 },
          { month: 'July', present: 20, working: 22, percentage: 90.9 },
          { month: 'August', present: 18, working: 22, percentage: 81.8 },
        ],
      },
    });
  });

  app.get('/api/attendance/child/:id', (req: Request, res: Response) => {
    const childId = req.params.id;
    const stu = STUDENTS.find((s) => s.id === childId) || STUDENTS[0];
    res.json({
      success: true,
      data: {
        studentId: stu.id,
        studentName: stu.name,
        attendancePercentage: stu.attendancePercentage,
        presentDays: stu.presentDays,
        absentDays: stu.absentDays,
        workingDays: stu.workingDays,
        periodStart: '2026-01-05',
        periodEnd: '2026-08-17',
        recentAbsences: stu.recentAbsences,
      },
    });
  });

  app.post('/api/attendance/mark', (req: Request, res: Response) => {
    const { studentId, status, remarks, date } = req.body || {};
    const stu = STUDENTS.find((s) => s.id === studentId || s.name.toLowerCase().includes(String(studentId).toLowerCase()));

    if (stu) {
      if (status === 'absent') {
        stu.absentDays += 1;
        stu.workingDays += 1;
        stu.recentAbsences.unshift(`${date || 'Today'} (${remarks || 'Unspecified'})`);
      } else {
        stu.presentDays += 1;
        stu.workingDays += 1;
      }
      stu.attendancePercentage = Number(((stu.presentDays / stu.workingDays) * 100).toFixed(1));
    }

    res.json({
      success: true,
      message: `Attendance marked successfully for ${stu ? stu.name : studentId} as ${status || 'present'}.`,
      transactionId: `txn_att_${Date.now()}`,
      updatedPercentage: stu?.attendancePercentage || 91.2,
    });
  });

  app.get('/api/attendance/analytics', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        overallPercentage: 94.6,
        totalEnrolled: 1240,
        todayPresent: 1173,
        todayAbsent: 67,
        date: new Date().toISOString().split('T')[0],
        classBreakdown: [
          { classId: 'cls_10a', className: 'Grade 10-A', totalStudents: 40, presentCount: 38, absentCount: 2, attendancePercentage: 95.0 },
          { classId: 'cls_10b', className: 'Grade 10-B', totalStudents: 38, presentCount: 35, absentCount: 3, attendancePercentage: 92.1 },
          { classId: 'cls_9a', className: 'Grade 9-A', totalStudents: 42, presentCount: 41, absentCount: 1, attendancePercentage: 97.6 },
          { classId: 'cls_9b', className: 'Grade 9-B', totalStudents: 41, presentCount: 38, absentCount: 3, attendancePercentage: 92.7 },
          { classId: 'cls_11a', className: 'Grade 11-A', totalStudents: 36, presentCount: 34, absentCount: 2, attendancePercentage: 94.4 },
          { classId: 'cls_12a', className: 'Grade 12-A', totalStudents: 35, presentCount: 34, absentCount: 1, attendancePercentage: 97.1 },
        ],
      },
    });
  });

  // ==========================================
  // ERP ENTITIES (STUDENTS, TEACHERS, PARENTS)
  // ==========================================
  app.get('/api/children', (req: Request, res: Response) => {
    const parentChildren = STUDENTS.filter((s) => s.parentId === 'PAR901');
    res.json({
      success: true,
      data: parentChildren.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        section: c.section,
        rollNo: c.rollNo,
        attendancePercentage: c.attendancePercentage,
      })),
    });
  });

  app.get('/api/children/:id', (req: Request, res: Response) => {
    const child = STUDENTS.find((s) => s.id === req.params.id) || STUDENTS[0];
    res.json({ success: true, data: child });
  });

  app.get('/api/students', (req: Request, res: Response) => {
    const { class_id, q } = req.query;
    let list = [...STUDENTS];
    if (class_id) {
      const cls = String(class_id).toLowerCase();
      if (cls.includes('10a')) list = list.filter((s) => s.grade === '10' && s.section === 'A');
      else if (cls.includes('10b')) list = list.filter((s) => s.grade === '10' && s.section === 'B');
    }
    if (q) {
      const term = String(q).toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(term) || s.rollNo.includes(term));
    }
    res.json({ success: true, data: list });
  });

  app.get('/api/students/:id', (req: Request, res: Response) => {
    const stu = STUDENTS.find((s) => s.id === req.params.id) || STUDENTS[0];
    res.json({ success: true, data: stu });
  });

  app.get('/api/teachers', (req: Request, res: Response) => {
    res.json({ success: true, data: TEACHERS });
  });

  app.get('/api/teachers/classes', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: [
        { id: 'cls_10a', name: 'Grade 10 - Section A', grade: '10', section: 'A', totalStudents: 40, subject: 'Mathematics' },
        { id: 'cls_10b', name: 'Grade 10 - Section B', grade: '10', section: 'B', totalStudents: 38, subject: 'Statistics' },
      ],
    });
  });

  app.get('/api/management/overview', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        schoolName: 'Greenwood International Academy',
        totalStudents: 1240,
        totalTeachers: 78,
        activeClasses: 32,
        academicYear: '2026-2027',
        todayAttendanceRate: 94.6,
        alertsCount: 3,
      },
    });
  });

  // ==========================================
  // HUMAN ESCALATION & SUPPORT
  // ==========================================
  app.post('/api/support/call-request', (req: Request, res: Response) => {
    const { teacherId, studentId, reason, contactNumber } = req.body || {};
    const teacher = TEACHERS.find((t) => t.id === teacherId) || TEACHERS[0];
    const student = STUDENTS.find((s) => s.id === studentId) || STUDENTS[0];

    const callReq: CallRequest = {
      id: `req_call_${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      studentId: student.id,
      studentName: student.name,
      parentId: 'PAR901',
      reason: reason || 'Quarterly attendance and performance review',
      contactNumber: contactNumber || '+91 98765 43210',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    CALL_REQUESTS.push(callReq);

    res.json({
      success: true,
      requestId: callReq.id,
      status: 'submitted',
      message: `Your call request with ${teacher.name} has been scheduled. The teacher will connect via ${callReq.contactNumber}.`,
    });
  });

  app.get('/api/support/call-request/:id', (req: Request, res: Response) => {
    const found = CALL_REQUESTS.find((r) => r.id === req.params.id);
    if (!found) {
      return res.json({
        success: true,
        requestId: req.params.id,
        status: 'acknowledged',
        message: 'Teacher has been notified.',
      });
    }
    res.json({ success: true, data: found });
  });

  // ==========================================
  // VOICE PROCESSING (STT & TTS)
  // ==========================================
  app.post('/api/voice/transcribe', (req: Request, res: Response) => {
    // Return speech-to-text response
    res.json({
      success: true,
      data: {
        text: 'What is my attendance percentage for this term?',
        detectedLanguage: 'en',
        confidence: 0.98,
      },
    });
  });

  app.post('/api/voice/synthesize', (req: Request, res: Response) => {
    const { text, language = 'en' } = req.body || {};
    res.json({
      success: true,
      data: {
        text,
        language,
        status: 'synthesized',
        durationSeconds: 3.2,
      },
    });
  });

  // ==========================================
  // VITE & STATIC SPA FALLBACK
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`XYZ AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start XYZ AI Server:', err);
});
