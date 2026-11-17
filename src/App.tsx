import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BasicScanner } from './components/BasicScanner';
import { ScanHistory } from './components/ScanHistory';
import { UserProfileView } from './components/UserProfileView';
import { RequestModal } from './components/RequestModal';
import { TeamModal } from './components/TeamModal';
import { RoleLoginModal } from './components/RoleLoginModal';
// Module 2 — MD. ABU NAYEM (FR-2.1 to FR-2.6)
import AssessmentSetup from './components/AssessmentSetup';
// Module 2 — OVIJEET SAHA (FR-2.7 to FR-2.12)
import VulnerabilitySearchFilter from './components/VulnerabilitySearchFilter';
import ChecklistAuditConsole from './components/ChecklistAuditConsole';
// Module 2 — ATIYA KHANM LUCKY (FR-2.13 to FR-2.18)
import AssessmentProgressMonitor from './components/AssessmentProgressMonitor';
import CustomerAssessmentView from './components/CustomerAssessmentView';
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
  const [currentUser, setCurrentUser] = useState<UserProfile>(SYSTEM_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [activeAssessmentId] = useState<string>('');

  const [scanHistory, setScanHistory] = useState<BasicScanResult[]>([
    PRESET_SCANS['https://apexbank-secure.io'],
    PRESET_SCANS['https://globalmart-retail.com'],
    PRESET_SCANS['https://vulnerable-demo-app.lab']
  ]);
  const [selectedScanForReport, setSelectedScanForReport] = useState<BasicScanResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalInitialUrl, setRequestModalInitialUrl] = useState('');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isCustomer = currentUser.role === 'customer';
  const isStaff = ['admin', 'assessor', 'manager', 'developer'].includes(currentUser.role);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // Reset to appropriate default tab for role
    if (user.role === 'customer') {
      setActiveTab('scanner');
    }
    logAuditEvent('USER_LOGIN_SUCCESS', 'http://localhost:8000/api/auth/login',
      `Authenticated as ${user.name} (${user.role.toUpperCase()}) for ${user.organization}.`);
    showToast(`Welcome, ${user.name}! Switched to ${user.role.toUpperCase()} role.`);
  };

  const logAuditEvent = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentUser.name,
      role: currentUser.role,
      action, target, details,
      ipAddress: '192.168.10.45'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleScanCompleted = (result: BasicScanResult) => {
    setScanHistory(prev => {
      const exists = prev.find(s => s.url === result.url);
      return exists ? prev.map(s => s.url === result.url ? result : s) : [result, ...prev];
    });
    logAuditEvent('BASIC_SCAN_EXECUTED', result.url,
      `Automated security audit executed. Score: ${result.score} (Grade ${result.grade}).`);
    showToast(`Scan complete for ${result.hostname}! Score: ${result.score}`);
  };

  const handleSelectScan = (scan: BasicScanResult) => {
    setSelectedScanForReport(scan);
    setActiveTab('scanner');
  };

  const handleReScan = (url: string) => {
    setSelectedScanForReport(null);
    setActiveTab('scanner');
    void url;
  };

  const handleOpenRequestModal = (url: string) => {
    setRequestModalInitialUrl(url);
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = (data: Omit<AssessmentRequest, 'id' | 'status' | 'submittedAt'>) => {
    setIsRequestModalOpen(false);
    logAuditEvent('FULL_ASSESSMENT_REQUESTED', data.targetUrl,
      `${data.organization} submitted scope inquiry for ${data.complianceTarget}.`);
    showToast(`Full assessment request submitted for ${data.organization}!`);
  };

  // RBAC guard: redirect customer away from staff-only tabs
  const handleSetActiveTab = (tab: string) => {
    const staffOnlyTabs = ['assessment', 'findings', 'checklist'];
    if (isCustomer && staffOnlyTabs.includes(tab)) return;
    setActiveTab(tab);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Toast */}
      {toastMessage && (
        <div className="no-print" style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
          color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '10px',
          boxShadow: '0 12px 30px rgba(6,182,212,0.4)', zIndex: 9999,
          fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.65rem'
        }}>
          <Check size={16} color="#ffffff" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenTeamInfo={() => setIsTeamModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>

        {/* ── Module 1 Tabs ── */}
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
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}
        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onSwitchUser={setCurrentUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* ── Module 2: CUSTOMER view ── */}
        {isCustomer && activeTab === 'my-requests' && (
          <CustomerAssessmentView customerOrg={currentUser.organization} />
        )}
        {isCustomer && activeTab === 'progress' && (
          <AssessmentProgressMonitor
            assessmentId={activeAssessmentId}
            userRole={currentUser.role}
          />
        )}

        {/* ── Module 2: STAFF view ── */}
        {isStaff && activeTab === 'assessment' && (
          <AssessmentSetup />
        )}
        {isStaff && activeTab === 'findings' && (
          <VulnerabilitySearchFilter />
        )}
        {isStaff && activeTab === 'progress' && (
          <AssessmentProgressMonitor
            assessmentId={activeAssessmentId}
            userRole={currentUser.role}
          />
        )}
        {isStaff && activeTab === 'checklist' && (
          <ChecklistAuditConsole assessmentId={activeAssessmentId} />
        )}

        {/* RBAC blocked message */}
        {isCustomer && ['assessment', 'findings', 'checklist'].includes(activeTab) && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#f9fafb', marginBottom: '8px' }}>Access Restricted</div>
            <div style={{ fontSize: '14px' }}>This section is only available to Security Assessors, Managers and Administrators.</div>
          </div>
        )}
      </main>

      <footer className="no-print" style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(9,13,22,0.95)', padding: '1.25rem 1.5rem', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div><strong style={{ color: '#cbd5e1' }}>CyberShield Platform</strong> • SE331 SecOps Lab Section 41_B2 (Fall 2026)</div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>MD. Abu Nayem (232-35-332)</span>
            <span>•</span>
            <span>Ovijeet Saha (232-35-457)</span>
            <span>•</span>
            <span>Atiya Khanm Lucky (232-35-422)</span>
          </div>
        </div>
      </footer>

      {isRequestModalOpen && (
        <RequestModal
          initialUrl={requestModalInitialUrl}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={handleSubmitRequest}
        />
      )}
      {isTeamModalOpen && <TeamModal onClose={() => setIsTeamModalOpen(false)} />}
      <RoleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
