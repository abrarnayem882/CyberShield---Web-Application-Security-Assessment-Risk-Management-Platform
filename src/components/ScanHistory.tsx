import React, { useState } from 'react';
import { 
  History, 
  ExternalLink, 
  Shield, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Activity, 
  Server, 
  Lock, 
  Inbox, 
  UserCheck, 
  Check,
  Globe
} from 'lucide-react';
import { BasicScanResult, AuditLog, UserProfile, AssessmentRequest } from '../types';
import { INITIAL_REQUESTS } from '../data/mockData';

interface ScanHistoryProps {
  currentUser: UserProfile;
  scanHistory: BasicScanResult[];
  auditLogs: AuditLog[];
  onSelectScan: (scan: BasicScanResult) => void;
  onReScan: (url: string) => void;
  onOpenLoginModal?: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  currentUser,
  scanHistory,
  auditLogs,
  onSelectScan,
  onReScan,
  onOpenLoginModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'scans' | 'audit' | 'inquiries'>('scans');
  const [assessmentRequests, setAssessmentRequests] = useState<AssessmentRequest[]>(INITIAL_REQUESTS);

  const canViewAuditLogs = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'assessor';
  const canViewInquiries = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'assessor';

  const handleUpdateStatus = (reqId: string, newStatus: AssessmentRequest['status']) => {
    setAssessmentRequests(prev => prev.map(req => req.id === reqId ? { ...req, status: newStatus } : req));
  };

  const filteredScans = scanHistory.filter(s => 
    s.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(l => 
    l.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = assessmentRequests.filter(r =>
    r.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#06b6d4';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'badge-success';
      case 'B': return 'badge-info';
      case 'C': return 'badge-warning';
      default: return 'badge-critical';
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={24} color="var(--cyan-primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Scan History & Audit Repository
            </h1>
            <span className="badge badge-info">FR-1.14 & FR-1.17</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Persistent storage of previous scans, scores, assessment requests, and role-governed audit logs.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by URL, host, or action..."
            className="input-field"
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('scans')}
          className="btn"
          style={{
            background: activeTab === 'scans' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.5)',
            border: activeTab === 'scans' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
            color: activeTab === 'scans' ? '#ffffff' : 'var(--text-muted)',
            fontSize: '0.825rem',
            fontWeight: 600
          }}
        >
          <Shield size={16} color={activeTab === 'scans' ? 'var(--cyan-primary)' : 'var(--text-muted)'} />
          <span>Completed Scans ({filteredScans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className="btn"
          style={{
            background: activeTab === 'audit' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.5)',
            border: activeTab === 'audit' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
            color: activeTab === 'audit' ? '#ffffff' : 'var(--text-muted)',
            fontSize: '0.825rem',
            fontWeight: 600
          }}
        >
          {canViewAuditLogs ? (
            <Activity size={16} color={activeTab === 'audit' ? 'var(--cyan-primary)' : 'var(--text-muted)'} />
          ) : (
            <Lock size={16} color="#94a3b8" />
          )}
          <span>Security Audit Trail ({filteredLogs.length})</span>
          {!canViewAuditLogs && (
            <span className="badge badge-secondary" style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }}>
              RESTRICTED
            </span>
          )}
        </button>

        {canViewInquiries && (
          <button
            onClick={() => setActiveTab('inquiries')}
            className="btn"
            style={{
              background: activeTab === 'inquiries' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.5)',
              border: activeTab === 'inquiries' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
              color: activeTab === 'inquiries' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.825rem',
              fontWeight: 600
            }}
          >
            <Inbox size={16} color={activeTab === 'inquiries' ? 'var(--cyan-primary)' : 'var(--text-muted)'} />
            <span>Assessment Inquiries ({filteredInquiries.length})</span>
            <span className="badge badge-info" style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }}>
              MANAGER/ASSESSOR
            </span>
          </button>
        )}
      </div>

      {/* Scans Table View */}
      {activeTab === 'scans' && (
        <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Target Asset</th>
                <th>Security Score</th>
                <th>Grade</th>
                <th>SSL / Cipher</th>
                <th>Vulnerabilities</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No scan records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredScans.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Globe size={14} color="var(--cyan-primary)" />
                          <span>{scan.hostname}</span>
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{scan.url}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: getScoreColor(scan.score) }}>
                          {scan.score}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getGradeBadge(scan.grade)}`} style={{ fontWeight: 700 }}>
                        {scan.grade}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem' }}>
                        <div style={{ color: '#cbd5e1' }}>{scan.sslInfo?.tls_version || 'TLS 1.3'}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{scan.sslInfo?.cipher || 'AES-256-GCM'}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {scan.severityCounts.Critical > 0 && (
                          <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                            {scan.severityCounts.Critical} Critical
                          </span>
                        )}
                        {scan.severityCounts.High > 0 && (
                          <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>
                            {scan.severityCounts.High} High
                          </span>
                        )}
                        {scan.severityCounts.Medium > 0 && (
                          <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>
                            {scan.severityCounts.Medium} Med
                          </span>
                        )}
                        {scan.severityCounts.Critical === 0 && scan.severityCounts.High === 0 && (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                            Passing Checks
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {scan.scanTimestamp ? new Date(scan.scanTimestamp).toLocaleString() : 'Recent'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onSelectScan(scan)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          title="Open detailed security report"
                        >
                          <ExternalLink size={14} color="var(--cyan-primary)" />
                          <span>View Report</span>
                        </button>
                        <button
                          onClick={() => onReScan(scan.url)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          title="Run fresh security audit"
                        >
                          <RotateCcw size={14} />
                          <span>Re-Scan</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log View */}
      {activeTab === 'audit' && (
        <>
          {canViewAuditLogs ? (
            <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  TAMPER-EVIDENT SECURE AUDIT LOGS (FR-1.17)
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                  AUTHORIZED: {currentUser.role.toUpperCase()}
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp (UTC)</th>
                    <th>User / Identity</th>
                    <th>Role (RBAC)</th>
                    <th>Action</th>
                    <th>Target Asset</th>
                    <th>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No audit records found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--cyan-primary)' }}>
                          {log.timestamp}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.825rem' }}>{log.user}</span>
                        </td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                            {log.role}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.target}</span>
                        </td>
                        <td style={{ fontSize: '0.785rem', color: '#cbd5e1' }}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.12)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Lock size={30} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Access Restricted: Security Clearance Required
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Under FR-1.2 Role-Based Access Control policy, tamper-evident security audit trails are restricted to 
                <strong> Security Assessor</strong>, <strong>Security Manager</strong>, and <strong>Administrator</strong> roles. 
                Your active role is <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>.
              </p>
              {onOpenLoginModal && (
                <button 
                  onClick={onOpenLoginModal}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <UserCheck size={16} />
                  <span>Switch to an Authorized Role (Assessor / Admin)</span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Assessment Inquiries View (Manager & Assessor & Admin) */}
      {activeTab === 'inquiries' && canViewInquiries && (
        <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              INBOUND CUSTOMER ASSESSMENT PIPELINE (FR-1.13)
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
              MANAGEMENT PIPELINE
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Organization & Contact</th>
                <th>Target Asset</th>
                <th>Compliance Goal</th>
                <th>Priority</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Status Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No assessment requests currently in queue.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{req.organization}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {req.contactName} ({req.contactEmail})
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--cyan-primary)' }}>{req.targetUrl}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{req.complianceTarget}</span>
                    </td>
                    <td>
                      <span className={`badge ${req.priority === 'Urgent' ? 'badge-critical' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        {req.status === 'Pending Review' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Approved & Scheduled')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Check size={12} />
                            <span>Approve</span>
                          </button>
                        )}
                        {req.status === 'Approved & Scheduled' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'In Progress')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                          >
                            <span>Start Audit</span>
                          </button>
                        )}
                        {req.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Completed')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', color: '#10b981' }}
                          >
                            <span>Mark Complete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};


