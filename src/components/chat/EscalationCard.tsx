import React, { useState } from 'react';
import { PhoneCall, User, MessageSquare, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { EscalationData } from '../../types/chat';
import { cn } from '../../utils/cn';

interface EscalationCardProps {
  escalation: EscalationData;
  onSubmit: (data: EscalationData) => Promise<void>;
}

export const EscalationCard: React.FC<EscalationCardProps> = ({
  escalation,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState(escalation.contactPhone || '');
  const [reason, setReason] = useState(escalation.reason || 'Discuss student attendance & progress');
  const [isCancelled, setIsCancelled] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({
      ...escalation,
      contactPhone: phone,
      reason,
    });
    setIsSubmitting(false);
  };

  if (isCancelled) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
        <X className="w-4 h-4 text-slate-400" />
        <span>Escalation request cancelled.</span>
      </div>
    );
  }

  if (escalation.status === 'submitted') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Call Request Submitted</p>
          <p className="opacity-90">{escalation.reason || 'Your call request has been submitted to the teacher.'}</p>
        </div>
      </div>
    );
  }

  if (escalation.status === 'failed') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-3">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Submission Failed</p>
          <p className="opacity-90">{escalation.reason || "I couldn't submit the request right now."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-blue-200 text-slate-800 shadow-xs space-y-3">
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/80">
        <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
          Human Teacher Escalation Request
        </h4>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Would you like me to request a callback from your child&apos;s class teacher or school administration?
      </p>

      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-[11px] text-slate-500 font-medium mb-1">
            Contact Number for Callback
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-500 font-medium mb-1">
            Reason for Inquiry
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for meeting..."
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Request Call</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
