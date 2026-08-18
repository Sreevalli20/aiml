import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';
import { cn } from '../../utils/cn';

interface BackendStatusBadgeProps {
  onOpenDiagnostics?: () => void;
}

export const BackendStatusBadge: React.FC<BackendStatusBadgeProps> = ({ onOpenDiagnostics }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastCheck, setLastCheck] = useState<string>('');

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const res = await apiClient.checkHealth();
      if (res.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('disconnected');
    } finally {
      setLastCheck(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onOpenDiagnostics}
        title={`Backend Status: ${status} (Checked: ${lastCheck}). Click for API diagnostics.`}
        className={cn(
          'inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer shadow-2xs',
          status === 'connected' && 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70',
          status === 'disconnected' && 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70',
          status === 'checking' && 'bg-slate-100 border-slate-200 text-slate-600'
        )}
      >
        {status === 'connected' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        {status === 'disconnected' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
        {status === 'checking' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />}
        
        <span>
          {status === 'connected' && 'API Connected'}
          {status === 'disconnected' && 'API Offline'}
          {status === 'checking' && 'Checking API...'}
        </span>
        <Activity className="w-3 h-3 opacity-60 ml-0.5" />
      </button>
    </div>
  );
};
