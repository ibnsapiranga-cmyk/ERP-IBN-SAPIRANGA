import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { FinanceModule } from './components/finance/FinanceModule';
import { MembersModule } from './components/members/MembersModule';
import { EducationModule } from './components/education/EducationModule';
import { SocialModule } from './components/social/SocialModule';
import { MissionsModule } from './components/missions/MissionsModule';
import { EventsModule } from './components/events/EventsModule';
import { AgendaModule } from './components/agenda/AgendaModule';
import { AssetsModule } from './components/assets/AssetsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { LoginPortal } from './components/auth/LoginPortal';
import { TransactionFormModal } from './components/finance/TransactionFormModal';
import { AccountingExportModal } from './components/finance/AccountingExportModal';
import { ModuleType, TransactionType, UserSession } from './types';
import { db } from './services/db';

export default function App() {
  const [session, setSession] = useState<UserSession>(db.getSession());
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hideSensitiveData, setHideSensitiveData] = useState(false);

  // Global modals
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [quickTxType, setQuickTxType] = useState<TransactionType>('entrada');
  const [isAccountingZipOpen, setIsAccountingZipOpen] = useState(false);

  useEffect(() => {
    return db.subscribe(() => {
      setSession(db.getSession());
    });
  }, []);

  const handleOpenNewTransaction = (type: TransactionType) => {
    setQuickTxType(type);
    setIsQuickTxOpen(true);
  };

  const handleNavigate = (module: ModuleType) => {
    setActiveModule(module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not authenticated with institutional credentials, render secure login portal
  if (!session.isAuthenticated) {
    return (
      <LoginPortal
        onLoginSuccess={(newSession) => {
          setSession(newSession);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        activeModule={activeModule}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        hideSensitiveData={hideSensitiveData}
        onTogglePrivacy={() => setHideSensitiveData(prev => !prev)}
        onOpenAccountingExportModal={() => setIsAccountingZipOpen(true)}
        onOpenNewTransaction={handleOpenNewTransaction}
        onNavigate={handleNavigate}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeModule === 'dashboard' && (
            <DashboardModule
              onNavigate={handleNavigate}
              hideSensitiveData={hideSensitiveData}
              onOpenAccountingExportModal={() => setIsAccountingZipOpen(true)}
            />
          )}

          {activeModule === 'finance' && (
            <FinanceModule
              hideSensitiveData={hideSensitiveData}
              onOpenAccountingExportModal={() => setIsAccountingZipOpen(true)}
            />
          )}

          {activeModule === 'members' && (
            <MembersModule
              hideSensitiveData={hideSensitiveData}
            />
          )}

          {activeModule === 'education' && (
            <EducationModule />
          )}

          {activeModule === 'social' && (
            <SocialModule />
          )}

          {(activeModule === 'evangelism' || (activeModule as string) === 'missions') && (
            <MissionsModule
              hideSensitiveData={hideSensitiveData}
            />
          )}

          {activeModule === 'events' && (
            <EventsModule />
          )}

          {activeModule === 'agenda' && (
            <AgendaModule
              hideSensitiveData={hideSensitiveData}
            />
          )}

          {activeModule === 'assets' && (
            <AssetsModule
              hideSensitiveData={hideSensitiveData}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsModule
              hideSensitiveData={hideSensitiveData}
              onOpenAccountingExportModal={() => setIsAccountingZipOpen(true)}
            />
          )}

          {activeModule === 'settings' && (
            <SettingsModule
              hideSensitiveData={hideSensitiveData}
              onTogglePrivacy={() => setHideSensitiveData(prev => !prev)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TransactionFormModal
        isOpen={isQuickTxOpen}
        onClose={() => setIsQuickTxOpen(false)}
        initialType={quickTxType}
      />

      <AccountingExportModal
        isOpen={isAccountingZipOpen}
        onClose={() => setIsAccountingZipOpen(false)}
        hideSensitiveData={hideSensitiveData}
      />

    </div>
  );
}
