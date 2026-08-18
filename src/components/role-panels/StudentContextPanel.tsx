import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Clock, Award, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import { AttendanceSummary } from '../../types/attendance';
import { AttendanceCardSkeleton } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { ErrorAlert } from '../common/ErrorAlert';
import { formatPercentage, formatDate } from '../../utils/formatters';

export const StudentContextPanel: React.FC = () => {
  const [data, setData] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getMyAttendance();
      setData(res);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch student attendance from backend API.'
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Student Attendance
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="h-4 bg-slate-100 rounded w-28 animate-pulse" />
            <div className="h-8 bg-slate-100 rounded w-20 animate-pulse" />
            <div className="h-2 bg-slate-100 rounded-full w-full animate-pulse" />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs aspect-square flex flex-col justify-between">
            <div className="h-3 bg-slate-100 rounded w-12" />
            <div className="h-6 bg-slate-100 rounded w-16" />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs aspect-square flex flex-col justify-between">
            <div className="h-3 bg-slate-100 rounded w-12" />
            <div className="h-6 bg-slate-100 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Student Attendance
          </p>
          <button
            onClick={fetchAttendance}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-800 mb-1">Backend Connection Status</p>
          <p className="text-xs text-slate-500 mb-3">{error}</p>
          <button
            onClick={fetchAttendance}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Calendar}
          title="No Attendance Records"
          description="No attendance data found for current student profile."
          actionLabel="Refresh from Server"
          onAction={fetchAttendance}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Student Attendance
        </p>
        <button
          onClick={fetchAttendance}
          title="Refresh attendance data"
          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Main 2-Col Span Real-Time Attendance Card */}
        <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Real-time Attendance</p>
          <div className="flex items-end gap-2 mb-2">
            <div className="text-2xl font-bold text-slate-900 font-display">
              {formatPercentage(data.attendancePercentage)}
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-blue-600 transition-all duration-700 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, data.attendancePercentage))}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-blue-600 font-medium">
            Term: {formatDate(data.periodStart)} – {formatDate(data.periodEnd)}
          </p>
        </div>

        {/* Square Aspect Card: Present */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Present Days</p>
          <div className="text-2xl font-bold text-emerald-600 font-display">{data.presentDays}</div>
          <p className="text-[10px] text-slate-400">Class Sessions</p>
        </div>

        {/* Square Aspect Card: Absent */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Absent Days</p>
          <div className="text-2xl font-bold text-rose-600 font-display">{data.absentDays}</div>
          <p className="text-[10px] text-slate-400">Total: {data.workingDays} Days</p>
        </div>

        {/* Dark Bento Card: System Health & Sync */}
        <div className="col-span-2 bg-slate-900 p-5 rounded-2xl text-white relative overflow-hidden shadow-md">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-wider">
              Student System Status
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Auth Token Verification</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Attendance Sync</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">ERP SIS Gateway</span>
                <div className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
