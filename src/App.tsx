import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BasicScanner } from './components/BasicScanner';
import { ScanHistory } from './components/ScanHistory';
import { UserProfileView } from './components/UserProfileView';
import { RequestModal } from './components/RequestModal';
import { TeamModal } from './components/TeamModal';
import { Check } from 'lucide-react';

import { 
  UserProfile, 
  AuditLog, 
  BasicScanResult, 
  AssessmentRequest 
} from './types';
import { 
  SYSTEM_USERS, 
  INITIAL_AUDIT_LOGS, 
  PRESET_SCANS 
} from './data/mockData';

export const App: React.FC = () => {
  // Current active user persona (FR-1.1 & FR-1.2 RBAC)
  const [currentUser, setCurrentUser] = useState<UserProfile>(SYSTEM_USERS[0]);
  
  // Navigation tabs: 'scanner' | 'history' | 'profile' (Module 1 Only)
  const [activeTab, setActiveTab] = useState<string>('scanner');

  // Application Data State
  const [scanHistory, setScanHistory] = useState<BasicScanResult[]>([
    PRESET_SCANS['https://apexbank-secure.io'],
    PRESET_SCANS['https://globalmart-retail.com'],
    PRESET_SCANS['https://vulnerable-demo-app.lab']
  ]);
  const [selectedScanForReport, setSelectedScanForReport] = useState<BasicScanResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalInitialUrl, setRequestModalInitialUrl] = useState('');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const logAuditEvent = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentUser.name,
      role: currentUser.role,
      action,
      target,
      details,
      ipAddress: '192.168.10.45'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handler: Scan Completed (FR-1.7 & FR-1.12)
  const handleScanCompleted = (result: BasicScanResult) => {
    setScanHistory(prev => {
      const exists = prev.find(s => s.url === result.url);
      if (exists) {
        return prev.map(s => s.url === result.url ? result : s);
      }
      return [result, ...prev];
    });

    logAuditEvent(
      'BASIC_SCAN_EXECUTED',
      result.url,
      `Safe automated security audit executed. Computed score: ${result.score} (Grade ${result.grade}).`
    );
    showToast(`Security scan completed for ${result.hostname}! Score: ${result.score}`);
  };

  // Handler: Select Scan from History
  const handleSelectScan = (scan: BasicScanResult) => {
    setSelectedScanForReport(scan);
    setActiveTab('scanner');
  };

  // Handler: Re-Scan Target
  const handleReScan = (url: string) => {
    setSelectedScanForReport(null);
    setActiveTab('scanner');
  };

  // Handler: Request Full Assessment CTA (FR-1.11)
  const handleOpenRequestModal = (url: string) => {
    setRequestModalInitialUrl(url);
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = (data: Omit<AssessmentRequest, 'id' | 'status' | 'submittedAt'>) => {
    setIsRequestModalOpen(false);
    logAuditEvent(
      'FULL_ASSESSMENT_REQUESTED',
      data.targetUrl,
      `Organization ${data.organization} submitted scope inquiry for ${data.complianceTarget}.`
    );
    showToast(`Full assessment request submitted for ${data.organization}! Our team will review within 24h.`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification Banner (No Emojis) */}
      {toastMessage && (
        <div 
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(6, 182, 212, 0.4)',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <Check size={16} color="#ffffff" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenTeamInfo={() => setIsTeamModalOpen(true)}
      />

      {/* Active Tab View (Module 1 Scope Only) */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'scanner' && (
          <BasicScanner
            currentUser={currentUser}
            onRequestFullAssessment={handleOpenRequestModal}
            onScanCompleted={handleScanCompleted}
            selectedScan={selectedScanForReport}
          />
        )}

        {activeTab === 'history' && (
          <ScanHistory
            currentUser={currentUser}
            scanHistory={scanHistory}
            auditLogs={auditLogs}
            onSelectScan={handleSelectScan}
            onReScan={handleReScan}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onSwitchUser={setCurrentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(9, 13, 22, 0.95)', padding: '1.25rem 1.5rem', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong style={{ color: '#cbd5e1' }}>CyberShield Platform</strong> • SE331 SecOps Lab Section 41_B2 (Fall 2026)
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>MD. Abu Nayem (232-35-332)</span>
            <span>•</span>
            <span>Ovijeet Saha (232-35-457)</span>
            <span>•</span>
            <span>Atiya Khanm Lucky (232-35-422)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isRequestModalOpen && (
        <RequestModal
          initialUrl={requestModalInitialUrl}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={handleSubmitRequest}
        />
      )}

      {isTeamModalOpen && (
        <TeamModal onClose={() => setIsTeamModalOpen(false)} />
      )}

    </div>
  );
};

export default App;
