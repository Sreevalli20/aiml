import React, { useState } from 'react';
import { AuthProvider } from './state/AuthContext';
import { LanguageProvider } from './state/LanguageContext';
import { RoleProvider } from './state/RoleContext';
import { ChatProvider } from './state/ChatContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthModal } from './components/auth/AuthModal';
import { VoiceModal } from './components/voice/VoiceModal';
import { ApiDiagnosticsModal } from './components/common/ApiDiagnosticsModal';

function AppContent() {
  const [page, setPage] = useState<'landing' | 'dashboard'>('dashboard');
  const [dashboardView, setDashboardView] = useState<'chat' | 'avatar' | 'docs'>('chat');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-700">
      {page === 'landing' ? (
        <LandingPage
          onEnterWorkspace={() => {
            setDashboardView('chat');
            setPage('dashboard');
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onViewDocs={() => {
            setDashboardView('docs');
            setPage('dashboard');
          }}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        />
      ) : (
        <DashboardPage
          onNavigateHome={() => setPage('landing')}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          currentView={dashboardView}
          onChangeView={(v) => setDashboardView(v)}
        />
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          setPage('dashboard');
        }}
      />

      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <ApiDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RoleProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </RoleProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
