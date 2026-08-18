import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { ChatContainer } from '../components/chat/ChatContainer';
import { AvatarStudio } from '../components/avatar/AvatarStudio';
import { ApiDocsViewer } from '../components/docs/ApiDocsViewer';
import { RightPanelWrapper } from '../components/role-panels/RightPanelWrapper';

interface DashboardPageProps {
  onNavigateHome: () => void;
  onOpenAuth: () => void;
  onOpenDiagnostics: () => void;
  onOpenVoice: () => void;
  currentView: 'chat' | 'avatar' | 'docs';
  onChangeView: (view: 'chat' | 'avatar' | 'docs') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateHome,
  onOpenAuth,
  onOpenDiagnostics,
  onOpenVoice,
  currentView,
  onChangeView,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigateHome={onNavigateHome}
        currentView={currentView}
        onChangeView={onChangeView}
        onOpenVoice={onOpenVoice}
        onOpenDiagnostics={onOpenDiagnostics}
        onOpenAuth={onOpenAuth}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
          isRightPanelOpen={isRightPanelOpen}
          onOpenAuth={onOpenAuth}
          onOpenDiagnostics={onOpenDiagnostics}
          onOpenVoice={onOpenVoice}
          currentView={currentView}
          onChangeView={onChangeView}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Central Active View */}
          <main className="flex-1 overflow-hidden relative">
            {currentView === 'chat' && <ChatContainer onOpenVoice={onOpenVoice} />}
            {currentView === 'avatar' && (
              <AvatarStudio
                onOpenVoice={onOpenVoice}
                onSwitchToChat={() => onChangeView('chat')}
              />
            )}
            {currentView === 'docs' && <ApiDocsViewer />}
          </main>

          {/* Right ERP Context Panel */}
          {currentView !== 'docs' && (
            <RightPanelWrapper
              isOpen={isRightPanelOpen}
              onToggle={() => setIsRightPanelOpen((prev) => !prev)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
