import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, User, Calendar, Check, X, RefreshCw } from 'lucide-react';
import { ActionConfirmationData } from '../../types/chat';
import { cn } from '../../utils/cn';

interface ConfirmationCardProps {
  action: ActionConfirmationData;
  onConfirm: (action: ActionConfirmationData) => Promise<void>;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  action,
  onConfirm
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(action);
    setIsSubmitting(false);
  };

  if (isCancelled) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
        <X className="w-4 h-4 text-slate-400" />
        <span>Action cancelled by user. No backend changes were made.</span>
      </div>
    );
  }

  if (action.confirmed) {
    const isSuccess = action.executed;
    return (
      <div className={cn(
        'mt-3 p-3.5 rounded-xl border text-xs flex items-start space-x-3 transition-all',
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-800'
      )}>
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p className="font-semibold">
            {isSuccess ? 'Backend Action Completed' : 'Action Failed'}
          </p>
          <p className="opacity-90">{action.statusMessage || (isSuccess ? 'Attendance updated successfully in School SIS.' : 'Attendance could not be updated.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-blue-200 text-slate-800 shadow-xs space-y-3">
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/80">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
          Attendance Action Confirmation Required
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200">
          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-slate-500">Student:</span>
          <span className="font-semibold text-slate-800 truncate">{action.studentName || action.studentId || 'Rahul'}</span>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-slate-500">Date:</span>
          <span className="font-semibold text-slate-800">{action.date || 'Today'}</span>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs">
        <span className="text-slate-600">Action: </span>
        <span className="font-bold text-blue-700 uppercase">
          Mark {action.status || 'Absent'}
        </span>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-1">
        <button
          type="button"
          onClick={() => setIsCancelled(true)}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Calling Backend...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Mark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
