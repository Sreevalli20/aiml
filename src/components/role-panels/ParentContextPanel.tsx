import React, { useState, useEffect, useCallback } from 'react';
import { Users, PhoneCall, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { parentsApi } from '../../api/parents';
import { attendanceApi } from '../../api/attendance';
import { ChildRecord } from '../../types/api';
import { AttendanceSummary } from '../../types/attendance';
import { AttendanceCardSkeleton } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { ErrorAlert } from '../common/ErrorAlert';
import { formatPercentage, formatDate } from '../../utils/formatters';
import { useChat } from '../../state/ChatContext';

export const ParentContextPanel: React.FC = () => {
  const { sendMessage } = useChat();
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState<boolean>(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    setIsLoadingChildren(true);
    setError(null);
    try {
      const list = await parentsApi.getChildren();
      setChildren(list);
      if (list.length > 0 && !selectedChildId) {
        setSelectedChildId(list[0].id);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch parent account child records from backend.'
      );
    } finally {
      setIsLoadingChildren(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    if (!selectedChildId) {
      setAttendance(null);
      return;
    }

    let isMounted = true;
    setIsLoadingAttendance(true);
    attendanceApi.getChildAttendance(selectedChildId)
      .then((res) => {
        if (isMounted) setAttendance(res);
      })
      .catch(() => {
        if (isMounted) setAttendance(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingAttendance(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedChildId]);

  const handleEscalationQuery = () => {
    sendMessage("I want to talk to my child's teacher.");
  };

  if (isLoadingChildren) {
    return (
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Parent Support
        </p>
        <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="h-4 bg-slate-100 rounded w-28 animate-pulse" />
          <div className="h-8 bg-slate-100 rounded w-20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Parent Support
        </p>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-800 mb-1">Parent API Status</p>
          <p className="text-xs text-slate-500 mb-3">{error}</p>
          <button
            onClick={fetchChildren}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  const currentChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Child Info & Attendance
        </p>
        <button
          onClick={fetchChildren}
          title="Refresh child records"
          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div>
          <select
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-medium"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.grade} - {c.section})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Child Profile Card */}
        {currentChild && (
          <div className="col-span-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
              {currentChild.name.charAt(0)}
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800 font-display">{currentChild.name}</h5>
              <p className="text-[11px] text-slate-500">
                Grade {currentChild.grade}-{currentChild.section} • Roll #{currentChild.rollNo}
              </p>
            </div>
          </div>
        )}

        {/* Real-time Attendance Gauge */}
        <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Child Attendance Rate</p>
          <div className="flex items-end gap-2 mb-2">
            <div className="text-2xl font-bold text-slate-900 font-display">
              {attendance ? formatPercentage(attendance.attendancePercentage) : '--%'}
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-blue-600 transition-all duration-700 rounded-full"
                style={{ width: `${attendance ? Math.min(100, Math.max(0, attendance.attendancePercentage)) : 0}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-blue-600 font-medium">
            {attendance ? `Present: ${attendance.presentDays} / ${attendance.workingDays} Days` : 'Connecting to API...'}
          </p>
        </div>

        {/* Square Aspect Stats */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Present</p>
          <div className="text-2xl font-bold text-emerald-600 font-display">
            {attendance?.presentDays ?? '--'}
          </div>
          <p className="text-[10px] text-slate-400">Class Sessions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Absent</p>
          <div className="text-2xl font-bold text-rose-600 font-display">
            {attendance?.absentDays ?? '--'}
          </div>
          <p className="text-[10px] text-slate-400">Excused/Unexcused</p>
        </div>
      </div>

      {/* Human Escalation Action Trigger */}
      <button
        onClick={handleEscalationQuery}
        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
      >
        <PhoneCall className="w-3.5 h-3.5" />
        <span>Request Teacher Callback</span>
      </button>
    </div>
  );
};
