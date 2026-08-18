import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, CheckSquare, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';
import { teachersApi, ClassInfo } from '../../api/teachers';
import { studentsApi } from '../../api/students';
import { StudentRecord } from '../../types/api';
import { TableRowSkeleton } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { ErrorAlert } from '../common/ErrorAlert';
import { useChat } from '../../state/ChatContext';

export const TeacherContextPanel: React.FC = () => {
  const { sendMessage } = useChat();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoadingClasses(true);
    setError(null);
    try {
      const list = await teachersApi.getMyClasses();
      setClasses(list);
      if (list.length > 0 && !selectedClassId) {
        setSelectedClassId(list[0].id);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch teacher assigned classes from backend.'
      );
    } finally {
      setIsLoadingClasses(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }

    let isMounted = true;
    setIsLoadingStudents(true);
    studentsApi.getStudents({ classId: selectedClassId })
      .then((res) => {
        if (isMounted) setStudents(res);
      })
      .catch(() => {
        if (isMounted) setStudents([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStudents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedClassId]);

  const handleQuickMark = (studentName: string) => {
    sendMessage(`Mark ${studentName} absent today.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Classroom Register
        </p>
        <button
          onClick={fetchClasses}
          title="Refresh class data"
          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Class Picker */}
      {classes.length > 0 && (
        <div>
          <select
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-medium"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.totalStudents} Students)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Quick Action Bento Card */}
        <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-xs text-blue-700 uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Attendance Action Prompt</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tell XYZ AI: &ldquo;Mark Rahul absent today&rdquo;. It presents a confirmation card before updating the backend register.
          </p>
          <button
            onClick={() => handleQuickMark('Rahul')}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Try: &ldquo;Mark Rahul absent today&rdquo;
          </button>
        </div>

        {/* Square Tiles */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned</p>
          <div className="text-2xl font-bold text-slate-900 font-display">{classes.length}</div>
          <p className="text-[10px] text-slate-400">Class Sections</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Roster</p>
          <div className="text-2xl font-bold text-blue-600 font-display">{students.length}</div>
          <p className="text-[10px] text-slate-400">Enrolled Students</p>
        </div>

        {/* Students Roster Roster Card */}
        <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700 uppercase text-[10px]">Student Roster</span>
            <span className="font-mono text-[10px]">{students.length} Total</span>
          </div>

          {isLoadingStudents ? (
            <TableRowSkeleton rows={3} />
          ) : students.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800 block text-xs">{st.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Roll #{st.rollNo}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickMark(st.name)}
                    className="px-2 py-1 text-[10px] font-semibold rounded-md bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    Mark Absent
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">
              Roster connects via <code className="font-mono text-blue-600">/api/students</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
