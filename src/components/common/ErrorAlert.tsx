import React from 'react';
import { AlertCircle, RefreshCw, ServerOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'API Communication Notice',
  message,
  onRetry,
  isRetrying = false,
  className
}) => {
  return (
    <div className={cn('p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-slate-200 text-sm space-y-2', className)}>
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-lg bg-rose-900/50 text-rose-300 shrink-0 mt-0.5">
          <ServerOff className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h5 className="font-semibold text-rose-300 text-sm">{title}</h5>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700/50">
              API Error
            </span>
          </div>
          <p className="text-xs text-rose-200/80 mt-1 leading-relaxed break-words">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-medium text-rose-200 bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/60 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn('w-3 h-3', isRetrying && 'animate-spin')} />
            <span>{isRetrying ? 'Retrying...' : 'Retry Endpoint'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
