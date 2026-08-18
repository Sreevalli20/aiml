import React, { useState, useEffect, useCallback } from 'react';
import { Building2, TrendingUp, Users, AlertTriangle, RefreshCw, BarChart3, ShieldAlert } from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import { managementApi, SchoolOverview } from '../../api/management';
import { AttendanceAnalytics } from '../../types/attendance';
import { formatPercentage, formatDate } from '../../utils/formatters';

export const PrincipalAnalyticsPanel: React.FC = () => {
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [overview, setOverview] = useState<SchoolOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsData, overviewData] = await Promise.allSettled([
        attendanceApi.getAttendanceAnalytics(),
        managementApi.getSchoolOverview(),
      ]);

      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      }
      if (overviewData.status === 'fulfilled') {
        setOverview(overviewData.value);
      }

      if (analyticsData.status === 'rejected' && overviewData.status === 'rejected') {
        throw analyticsData.reason || new Error('Backend analytics unreachable');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch school-wide attendance analytics from backend.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Management Preview
        </p>
        <button
          onClick={fetchAnalytics}
          title="Refresh analytics data"
          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Real-time Attendance (2-col span) */}
        <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Real-time Attendance</p>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-bold text-slate-900 font-display">
              {analytics ? formatPercentage(analytics.overallPercentage) : '--%'}
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-blue-600 transition-all duration-1000 rounded-full"
                style={{ width: `${analytics ? Math.min(100, Math.max(0, analytics.overallPercentage)) : 0}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-blue-600 font-medium mt-1">
            {analytics ? `Today: ${analytics.todayPresent} Present • ${analytics.todayAbsent} Absent` : 'Waiting for API sync...'}
          </p>
        </div>

        {/* Square Aspect: Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Students</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-md" />
          ) : (
            <div className="text-2xl font-bold text-slate-900 font-display">
              {overview?.totalStudents ?? analytics?.totalEnrolled ?? '--'}
            </div>
          )}
          <p className="text-xs font-semibold text-slate-900">
            {isLoading ? 'Loading...' : 'Enrolled'}
          </p>
        </div>

        {/* Square Aspect: Faculty */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Faculty</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-md" />
          ) : (
            <div className="text-2xl font-bold text-slate-900 font-display">
              {overview?.totalTeachers ?? '--'}
            </div>
          )}
          <p className="text-xs font-semibold text-slate-900">
            {isLoading ? 'Loading...' : 'Staff Members'}
          </p>
        </div>

        {/* Dark Bento Card: System Health */}
        <div className="col-span-2 bg-slate-900 p-5 rounded-2xl text-white relative overflow-hidden shadow-md">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-wider">
              System Health
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Auth Module</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">AI Engine</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">ERP Connect</span>
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Class-level Breakdown if available */}
        {analytics?.classBreakdown && analytics.classBreakdown.length > 0 && (
          <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Class Breakdown</p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {analytics.classBreakdown.map((cls) => (
                <div key={cls.classId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <span className="font-medium text-slate-800">{cls.className}</span>
                  <span className="font-mono font-bold text-blue-600">{formatPercentage(cls.attendancePercentage)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
