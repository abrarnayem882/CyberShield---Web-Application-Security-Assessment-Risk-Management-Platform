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
  Server
} from 'lucide-react';
import { BasicScanResult, AuditLog, UserProfile } from '../types';

interface ScanHistoryProps {
  currentUser: UserProfile;
  scanHistory: BasicScanResult[];
  auditLogs: AuditLog[];
  onSelectScan: (scan: BasicScanResult) => void;
  onReScan: (url: string) => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  currentUser,
  scanHistory,
  auditLogs,
  onSelectScan,
  onReScan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'scans' | 'audit'>('scans');

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
            <span className="badge badge-info">FR-1.7 & FR-1.12</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Persistent storage of previous automated scans, security scores, and tamper-evident audit logs.
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
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
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
          <Activity size={16} color={activeTab === 'audit' ? 'var(--cyan-primary)' : 'var(--text-muted)'} />
          <span>Security Audit Trail ({filteredLogs.length})</span>
        </button>
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
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>{scan.hostname}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', wordBreak: 'break-all' }}>{scan.url}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: getScoreColor(scan.score) }}>
                          {scan.score}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>/ 100</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getGradeBadge(scan.grade)}`} style={{ fontWeight: 700 }}>
                        {scan.grade}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem' }}>
                        <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{scan.sslInfo?.tls_version || 'TLS 1.2'}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{scan.sslInfo?.issuer || 'Verified CA'}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.72rem' }}>
                        {scan.severityCounts.Critical > 0 && (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>{scan.severityCounts.Critical} Crit</span>
                        )}
                        {scan.severityCounts.High > 0 && (
                          <span style={{ color: '#f97316', fontWeight: 600 }}>{scan.severityCounts.High} High</span>
                        )}
                        {scan.severityCounts.Medium > 0 && (
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{scan.severityCounts.Medium} Med</span>
                        )}
                        {scan.severityCounts.Critical === 0 && scan.severityCounts.High === 0 && (
                          <span style={{ color: '#10b981', fontWeight: 600 }}>Protected</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={13} />
                        <span>{new Date(scan.scanTimestamp).toLocaleDateString()} {new Date(scan.scanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
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
        <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
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
      )}

    </div>
  );
};

