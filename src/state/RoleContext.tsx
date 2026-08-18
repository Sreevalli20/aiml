import React, { createContext, useContext, useState, useMemo } from 'react';
import { UserRole } from '../types/auth';

export interface RolePersonaInfo {
  role: UserRole;
  title: string;
  badge: string;
  personaName: string;
  personaDescription: string;
  suggestedPrompts: string[];
  primaryCapabilities: string[];
}

export const ROLE_PERSONAS: Record<UserRole, RolePersonaInfo> = {
  student: {
    role: 'student',
    title: 'Student Portal',
    badge: 'Student Academic Assistant',
    personaName: 'Academic Buddy AI',
    personaDescription: 'Friendly and supportive academic assistant focused on student learning, attendance queries, and everyday school information.',
    suggestedPrompts: [
      'What is my attendance?',
      'Help me with my studies.',
      'What can you help me with?'
    ],
    primaryCapabilities: [
      'My attendance records',
      'Academic guidance & schedule',
      'School calendar & announcements',
      'General curriculum queries'
    ]
  },
  parent: {
    role: 'parent',
    title: 'Parent Portal',
    badge: 'Parent Support Assistant',
    personaName: 'Parent Care AI',
    personaDescription: 'Caring and patient parent support assistant providing transparent child attendance insights, school updates, and verified teacher communication channels.',
    suggestedPrompts: [
      'How much attendance does my child have?',
      "Show my child's recent attendance.",
      "I want to talk to my child's teacher."
    ],
    primaryCapabilities: [
      'Child attendance tracking',
      'Child performance information',
      'School notices & fee updates',
      'Teacher callback escalation requests'
    ]
  },
  teacher: {
    role: 'teacher',
    title: 'Staff / Teacher Portal',
    badge: 'Teaching Assistant AI',
    personaName: 'Faculty Assistant AI',
    personaDescription: 'Professional teaching assistant facilitating fast classroom operations, verified attendance logging actions, and student roster lookups.',
    suggestedPrompts: [
      'Mark Rahul absent today.',
      "Show today's attendance.",
      'Help me with my class.'
    ],
    primaryCapabilities: [
      'Voice & text attendance marking',
      'Class roster & student status',
      'Lesson plan & teaching resources',
      'Parent callback coordination'
    ]
  },
  principal: {
    role: 'principal',
    title: 'Management Portal',
    badge: 'Management Assistant AI',
    personaName: 'Executive School AI',
    personaDescription: 'Strategic and analytical management assistant providing school-wide attendance metrics, operational insights, and administrative intelligence.',
    suggestedPrompts: [
      'What is the overall attendance?',
      'Show school attendance analytics.',
      'Give me the school attendance overview.'
    ],
    primaryCapabilities: [
      'School-wide attendance analytics',
      'Department & class breakdowns',
      'Chronic absenteeism alerts',
      'Executive operational summaries'
    ]
  }
};

interface RoleContextValue {
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  currentPersona: RolePersonaInfo;
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const currentPersona = useMemo(() => ROLE_PERSONAS[selectedRole], [selectedRole]);

  const value = useMemo<RoleContextValue>(() => ({
    selectedRole,
    setSelectedRole,
    currentPersona,
    selectedChildId,
    setSelectedChildId,
    selectedClassId,
    setSelectedClassId
  }), [selectedRole, currentPersona, selectedChildId, selectedClassId]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
