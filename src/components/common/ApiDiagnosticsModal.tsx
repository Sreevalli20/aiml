import React, { useState } from 'react';
import { X, Server, Activity, ShieldCheck, RefreshCw, CheckCircle, XCircle, Terminal, ExternalLink } from 'lucide-react';
import { API_CONFIG } from '../../config/env';
import { apiClient, ApiError } from '../../api/client';
import { useAuth } from '../../state/AuthContext';

interface ApiDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointCheckResult {
  endpoint: string;
  method: string;
  status: 'idle' | 'testing' | 'success' | 'failed';
  httpStatus?: number;
  message?: string;
  durationMs?: number;
}

export const ApiDiagnosticsModal: React.FC<ApiDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const { token, user, logout } = useAuth();
  const [customBaseUrl, setCustomBaseUrl] = useState(API_CONFIG.baseUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, EndpointCheckResult>>({
    health: { endpoint: '/api/v1/health', method: 'GET', status: 'idle' },
    auth: { endpoint: '/api/v1/auth/me', method: 'GET', status: 'idle' },
    conversations: { endpoint: '/api/v1/chat/conversations', method: 'GET', status: 'idle' },
    attendance: { endpoint: '/api/v1/attendance/me', method: 'GET', status: 'idle' },
  });

  if (!isOpen) return null;

  const handleSaveBaseUrl = (e: React.FormEvent) => {
    e.preventDefault();
    API_CONFIG.setBaseUrl(customBaseUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const runEndpointTest = async (key: string, endpoint: string, method: string) => {
    setTestResults((prev) => ({
      ...prev,
      [key]: { ...prev[key], status: 'testing' },
    }));

    const startTime = performance.now();
    try {
      if (method === 'GET') {
        await apiClient.get(endpoint);
      }
      const durationMs = Math.round(performance.now() - startTime);
      setTestResults((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: 'success',
          httpStatus: 200,
          message: 'Endpoint reachable and responded with success',
          durationMs,
        },
      }));
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      let httpStatus = 0;
      let message = 'Connection failed';
      if (err instanceof ApiError) {
        httpStatus = err.status;
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setTestResults((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: 'failed',
          httpStatus,
          message,
          durationMs,
        },
      }));
    }
  };

  const runAllTests = () => {
    (Object.entries(testResults) as [string, EndpointCheckResult][]).forEach(([key, item]) => {
      runEndpointTest(key, item.endpoint, item.method);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              X
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Backend Integration Diagnostics</h3>
              <p className="text-xs text-slate-500">Manage Python backend target URL, credentials & connectivity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Base URL Configuration */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Backend Target (VITE_API_BASE_URL)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono font-semibold">
                {customBaseUrl ? 'Configured' : 'Relative Origin'}
              </span>
            </div>
            <form onSubmit={handleSaveBaseUrl} className="flex gap-2">
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="e.g. http://localhost:8000 or https://your-backend.onrender.com"
                className="flex-1 px-3.5 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Save Target
              </button>
            </form>
            {saveSuccess && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Backend URL updated successfully for this session.</span>
              </p>
            )}
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When deployed to production (e.g. Vercel), this defaults to <code className="text-blue-700 font-mono font-semibold">VITE_API_BASE_URL</code>.
            </p>
          </div>

          {/* Authentication & Security State */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Authentication Token & Verified Role</span>
            </h4>
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="space-y-1">
                <p className="text-slate-600">
                  Status:{' '}
                  <span className={user ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {user ? `Authenticated (${user.name} - ${user.role})` : 'Unauthenticated (Guest Mode)'}
                  </span>
                </p>
                {token && (
                  <p className="text-slate-400 font-mono text-[11px]">
                    Token: {token.substring(0, 16)}...
                  </p>
                )}
              </div>
              {token && (
                <button
                  onClick={() => logout()}
                  className="px-3 py-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer font-semibold"
                >
                  Clear Session
                </button>
              )}
            </div>
          </div>

          {/* Live Endpoint Connectivity Tester */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Live Endpoint Verification</span>
              </h4>
              <button
                onClick={runAllTests}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test All Endpoints</span>
              </button>
            </div>

            <div className="space-y-2">
              {(Object.entries(testResults) as [string, EndpointCheckResult][]).map(([key, item]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="px-2 py-0.5 font-mono text-[10px] rounded-md bg-white border border-slate-200 text-slate-700 font-bold">
                      {item.method}
                    </span>
                    <span className="font-mono text-slate-800 font-medium">{item.endpoint}</span>
                    {item.durationMs !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono">{item.durationMs}ms</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {item.status === 'idle' && (
                      <span className="text-slate-400 text-[11px]">Not pinged</span>
                    )}
                    {item.status === 'testing' && (
                      <span className="text-blue-600 text-[11px] flex items-center space-x-1 font-semibold">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Pinging...</span>
                      </span>
                    )}
                    {item.status === 'success' && (
                      <span className="text-emerald-600 text-[11px] flex items-center space-x-1 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>HTTP {item.httpStatus}</span>
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-rose-600 text-[11px] flex items-center space-x-1 font-bold" title={item.message}>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{item.httpStatus ? `HTTP ${item.httpStatus}` : 'Offline'}</span>
                      </span>
                    )}

                    <button
                      onClick={() => runEndpointTest(key, item.endpoint, item.method)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      Ping
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <a
            href="https://github.com/Sreevalli20/aiml"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <span>GitHub Repository: Sreevalli20/aiml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
