import React, { useState } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { EventBusProvider } from './context/EventBusContext';
import { Navbar } from './components/layout/Navbar';
import { PeachyMascot } from './components/peachy/PeachyMascot';

// Page Components
import { MasterProfilePage } from './components/profile/MasterProfilePage';
import { JobFeedPage } from './components/jobs/JobFeedPage';
import { TailoredResumesPage } from './components/resume/TailoredResumesPage';
import { ResumeCheckerPage } from './components/checker/ResumeCheckerPage';
import { ApplicationsKanbanPage } from './components/applications/ApplicationsKanbanPage';
import { ColdEmailPage } from './components/outreach/ColdEmailPage';
import { InterviewPrepPage } from './components/interview/InterviewPrepPage';
import { AuditLogPage } from './components/audit/AuditLogPage';
import { SettingsPage } from './components/settings/SettingsPage';

export const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('profile');
  const [selectedJobIdForTailor, setSelectedJobIdForTailor] = useState<number | null>(null);

  const handleSelectJobForTailoring = (jobId: number) => {
    setSelectedJobIdForTailor(jobId);
    setActivePage('resumes');
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'profile':
        return <MasterProfilePage />;
      case 'jobs':
        return <JobFeedPage onSelectJobForTailoring={handleSelectJobForTailoring} />;
      case 'resumes':
        return <TailoredResumesPage selectedJobId={selectedJobIdForTailor} />;
      case 'checker':
        return <ResumeCheckerPage onNavigateToTailor={() => setActivePage('resumes')} />;
      case 'applications':
        return <ApplicationsKanbanPage />;
      case 'outreach':
        return <ColdEmailPage />;
      case 'interview':
        return <InterviewPrepPage />;
      case 'audit':
        return <AuditLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MasterProfilePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-espresso-900 transition-colors">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {renderActivePage()}
      </main>

      {/* Persistent Animated Peachy Mascot Component */}
      <PeachyMascot currentPage={activePage} onNavigate={(page) => setActivePage(page)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <EventBusProvider>
        <AppContent />
      </EventBusProvider>
    </ThemeProvider>
  );
};

export default App;
