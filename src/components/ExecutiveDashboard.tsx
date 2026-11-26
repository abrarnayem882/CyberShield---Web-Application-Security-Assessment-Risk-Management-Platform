import React, { useEffect, useState } from 'react';
import {
  Shield, AlertTriangle, Clock, Layers, ArrowUpRight,
  TrendingDown, Search, CheckCircle2,
  RefreshCw, Globe, ChevronRight, Lock
} from 'lucide-react';

interface ExecutiveDashboardProps {
  onSelectFindingCoordinate?: (likelihood: number, impact: number) => void;
  onNavigateTab?: (tab: string) => void;
}

interface ExecutiveData {
  overall_posture: {
    average_score: number;
    average_grade: string;
    grade_color: string;
    total_scans: number;
    total_assessments: number;
    active_assessments: number;
    pending_inquiries: number;
    compliance_framework: string;
  };
  findings_summary: {
    total: number;
    active: number;
    open: number;
    in_remediation: number;
    retest_requested: number;
    resolved: number;
    closed: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  mttr_metrics: {
    overall_hours: number;
    overall_days: number;
    critical_mttr_hours: number;
    high_mttr_hours: number;
    medium_mttr_hours: number;
    low_mttr_hours: number;
    remediation_rate_percent: number;
    target_sla_compliance_percent: number;
  };
  timestamp: string;
}

interface HeatmapCell {
  likelihood: number;
  impact: number;
  risk_score: number;
  severity: string;
  count: number;
  finding_ids: string[];
}

interface HeatmapRow {
  likelihood_level: number;
  likelihood_label: string;
  cells: HeatmapCell[];
}

interface AssetComparison {
  id: string;
  hostname: string;
  url: string;
  score: number;
  grade: string;
  grade_label: string;
  assessment_status: string;
  assessment_id: string | null;
  open_findings: number;
  critical_findings: number;
  last_scanned: string;
  ssl_valid: boolean;
}

interface AuditLogItem {
  id: string;
  user_name: string;
  role: string;
  action: string;
  target_url: string;
  ip_address: string;
  details: string;
  timestamp: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  target_role: string;
  is_read: boolean;
  created_at: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onSelectFindingCoordinate,
  onNavigateTab
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [execData, setExecData] = useState<ExecutiveData | null>(null);
  const [matrixRows, setMatrixRows] = useState<HeatmapRow[]>([]);
  const [assets, setAssets] = useState<AssetComparison[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);

  const API_BASE = 'http://localhost:8000/api';

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resExec, resMatrix, resAssets, resAudit, resNotifs] = await Promise.all([
        fetch(`${API_BASE}/dashboard/executive`),
        fetch(`${API_BASE}/dashboard/risk-matrix`),
        fetch(`${API_BASE}/dashboard/asset-comparison`),
        fetch(`${API_BASE}/audit/trail`),
        fetch(`${API_BASE}/notifications/inbound?role=assessor`)
      ]);

      if (!resExec.ok || !resMatrix.ok) {
        throw new Error('Failed to load executive metrics.');
      }

      const [dataExec, dataMatrix, dataAssets, dataAudit, dataNotifs] = await Promise.all([
        resExec.json(),
        resMatrix.json(),
        resAssets.json(),
        resAudit.json(),
        resNotifs.json()
      ]);

      setExecData(dataExec);
      setMatrixRows(dataMatrix.matrix_rows || []);
      setAssets(dataAssets.assets || []);
      setAuditLogs(dataAudit.logs || []);
      setNotifications(dataNotifs.notifications || []);
      setUnreadNotifications(dataNotifs.unread_count || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error connecting to dashboard API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/notifications/inbound`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/inbound`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all_read: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadNotifications(0);
    } catch {
      // Ignore
    }
  };

  const getHeatmapColor = (score: number, count: number): string => {
    if (count === 0) {
      return 'rgba(30, 41, 59, 0.4)';
    }
    if (score >= 20) {
      return 'rgba(239, 68, 68, 0.85)'; // Critical
    }
    if (score >= 12) {
      return 'rgba(249, 115, 22, 0.85)'; // High
    }
    if (score >= 6) {
      return 'rgba(234, 179, 8, 0.8)'; // Medium
    }
    if (score >= 3) {
      return 'rgba(34, 197, 94, 0.75)'; // Low
    }
    return 'rgba(6, 182, 212, 0.75)'; // Informational
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!auditSearchQuery) return true;
    const q = auditSearchQuery.toLowerCase();
    return (
      log.user_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.target_url.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', color: '#e2e8f0' }}>

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Executive Security Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                FR-3.1 to FR-3.6 • Aggregated Risk Governance, MTTR Metrics &amp; 5x5 Threat Matrix
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} />
            <span>Refresh Metrics</span>
          </button>

          {unreadNotifications > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fca5a5' }}>
                {unreadNotifications} Inbound Alert{unreadNotifications > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading security posture telemetry and matrices...
        </div>
      )}

      {!loading && execData && (
        <>
          {/* FR-3.1: Executive Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

            {/* Overall Security Score */}
            <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Security Health Score
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '2.1rem', fontWeight: 900, color: execData.overall_posture.grade_color }}>
                      {execData.overall_posture.average_score}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `${execData.overall_posture.grade_color}22`, border: `2px solid ${execData.overall_posture.grade_color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 900, color: execData.overall_posture.grade_color }}>
                  {execData.overall_posture.average_grade}
                </div>
              </div>
              <div style={{ marginTop: '0.8rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={13} color="#10b981" />
                <span>Standard: {execData.overall_posture.compliance_framework}</span>
              </div>
            </div>

            {/* Active Vulnerabilities */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Active Vulnerabilities
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.4rem' }}>
                    {execData.findings_summary.active}
                  </div>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.15)', borderRadius: '10px' }}>
                  <AlertTriangle size={20} color="#ef4444" />
                </div>
              </div>
              <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.6rem', fontSize: '0.72rem' }}>
                <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                  {execData.findings_summary.critical} Critical
                </span>
                <span className="badge badge-high" style={{ fontSize: '0.68rem' }}>
                  {execData.findings_summary.high} High
                </span>
                <span className="badge badge-medium" style={{ fontSize: '0.68rem' }}>
                  {execData.findings_summary.medium} Med
                </span>
              </div>
            </div>

            {/* FR-3.2: Resolution Time (MTTR) */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Mean Time To Remediate (MTTR)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#06b6d4' }}>
                      {execData.mttr_metrics.overall_hours}h
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      ({execData.mttr_metrics.overall_days} days)
                    </span>
                  </div>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(6,182,212,0.15)', borderRadius: '10px' }}>
                  <Clock size={20} color="#06b6d4" />
                </div>
              </div>
              <div style={{ marginTop: '0.8rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Critical MTTR: <strong style={{ color: '#ef4444' }}>{execData.mttr_metrics.critical_mttr_hours}h</strong></span>
                <span>SLA: <strong style={{ color: '#10b981' }}>{execData.mttr_metrics.target_sla_compliance_percent}%</strong></span>
              </div>
            </div>

            {/* Assessments Pipeline */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Assessments Pipeline
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#8b5cf6', marginTop: '0.4rem' }}>
                    {execData.overall_posture.active_assessments}
                  </div>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(139,92,246,0.15)', borderRadius: '10px' }}>
                  <Layers size={20} color="#8b5cf6" />
                </div>
              </div>
              <div style={{ marginTop: '0.8rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total: {execData.overall_posture.total_assessments} audits</span>
                <span>Inquiries: <strong style={{ color: '#f59e0b' }}>{execData.overall_posture.pending_inquiries} pending</strong></span>
              </div>
            </div>

          </div>

          {/* Grid: FR-3.3 5x5 Heatmap & FR-3.6 Inbound Notifications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.4fr) minmax(300px, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>

            {/* FR-3.3: Risk Heatmap Matrix */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                    5x5 Risk Heatmap Matrix (FR-3.3)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Likelihood (Rows) x Impact (Cols) • Click cell to filter findings
                  </p>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  Total Findings: <strong>{execData.findings_summary.total}</strong>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', textAlign: 'center' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '85px', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'left', padding: '4px' }}>
                        Likelihood \ Impact
                      </th>
                      {['1 Negligible', '2 Minor', '3 Moderate', '4 Major', '5 Critical'].map((label, idx) => (
                        <th key={idx} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, padding: '4px' }}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map(row => (
                      <tr key={row.likelihood_level}>
                        <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'left', padding: '4px' }}>
                          {row.likelihood_level} {row.likelihood_label}
                        </td>
                        {row.cells.map(cell => {
                          const isSelected = selectedCell?.l === cell.likelihood && selectedCell?.i === cell.impact;
                          return (
                            <td
                              key={cell.impact}
                              onClick={() => {
                                setSelectedCell({ l: cell.likelihood, i: cell.impact });
                                if (onSelectFindingCoordinate) {
                                  onSelectFindingCoordinate(cell.likelihood, cell.impact);
                                }
                              }}
                              style={{
                                height: '48px',
                                background: getHeatmapColor(cell.risk_score, cell.count),
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.06)',
                                transform: isSelected ? 'scale(1.04)' : 'none',
                                boxShadow: isSelected ? '0 0 14px rgba(255,255,255,0.3)' : 'none',
                                position: 'relative'
                              }}
                              title={`Likelihood: ${cell.likelihood}, Impact: ${cell.impact} (Risk Score: ${cell.risk_score}) - ${cell.count} finding(s)`}
                            >
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                                {cell.count}
                              </div>
                              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
                                Score {cell.risk_score}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Heatmap Legend */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.68rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Risk Tiers:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(239,68,68,0.85)' }} /> Critical (20-25)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(249,115,22,0.85)' }} /> High (12-19)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(234,179,8,0.8)' }} /> Medium (6-11)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(34,197,94,0.75)' }} /> Low (3-5)
                </span>
              </div>
            </div>

            {/* FR-3.6: Inbound Notifications & Alert Feed */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                    Inbound Alerts (FR-3.6)
                  </h3>
                  {unreadNotifications > 0 && (
                    <span className="badge badge-critical" style={{ fontSize: '0.62rem' }}>
                      {unreadNotifications} new
                    </span>
                  )}
                </div>
                {unreadNotifications > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{ background: 'transparent', border: 'none', color: 'var(--cyan-primary)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '330px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    No inbound notification alerts at this time.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markNotificationRead(n.id)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: n.is_read ? 'rgba(30,41,59,0.3)' : 'rgba(6,182,212,0.08)',
                        border: n.is_read ? '1px solid var(--border-subtle)' : '1px solid rgba(6,182,212,0.35)',
                        cursor: n.is_read ? 'default' : 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: n.is_read ? 'var(--text-muted)' : '#f8fafc' }}>
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06b6d4', flexShrink: 0, marginTop: '5px' }} />
                        )}
                      </div>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.73rem', color: 'var(--text-dim)', lineHeight: 1.35 }}>
                        {n.message}
                      </p>
                      <div style={{ marginTop: '0.4rem', fontSize: '0.65rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Target: {n.target_role}</span>
                        <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* FR-3.4: Asset Security Comparison Table */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                  Asset Security Comparison (FR-3.4)
                </h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Compare security scores, grades, and vulnerability densities across organization domains
                </p>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Audited Targets: <strong>{assets.length}</strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Target Asset / Hostname</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Score</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Health Grade</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Open Findings</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Critical Risks</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Assessment Status</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>SSL TLS</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => (
                    <tr
                      key={asset.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Globe size={15} color="#06b6d4" />
                          <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{asset.hostname}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{asset.url}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${asset.score}%`, height: '100%', background: asset.score >= 80 ? '#10b981' : (asset.score >= 60 ? '#f59e0b' : '#ef4444') }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{asset.score}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${asset.grade === 'A' ? 'badge-success' : (asset.grade === 'B' ? 'badge-info' : 'badge-high')}`} style={{ fontSize: '0.68rem' }}>
                          Grade {asset.grade}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                        {asset.open_findings} finding{asset.open_findings !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {asset.critical_findings > 0 ? (
                          <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                            {asset.critical_findings} Critical
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {asset.assessment_status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: asset.ssl_valid ? '#10b981' : '#ef4444' }}>
                          <Lock size={12} /> {asset.ssl_valid ? 'Valid TLS' : 'Expiring'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('assessment')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                          >
                            <span>Inspect</span>
                            <ArrowUpRight size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FR-3.5: System Activity Audit Trail */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                  System Activity Audit Trail (FR-3.5)
                </h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Search and inspect tamper-evident audit records across scans, assessments &amp; users
                </p>
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter audit logs..."
                  value={auditSearchQuery}
                  onChange={e => setAuditSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem 0.4rem 2rem',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '340px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Timestamp</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>User / Role</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Action Code</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Target Resource</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>IP Address</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 20).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{log.user_name}</span>
                        <span style={{ marginLeft: '0.4rem', fontSize: '0.62rem', color: 'var(--text-dim)' }}>({log.role})</span>
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.62rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--cyan-primary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.target_url}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {log.ip_address}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

    </div>
  );
};

export default ExecutiveDashboard;
