import React, { useEffect, useState } from 'react';
import {
  FileText, Download, Printer, Share2, Building2,
  CheckCircle2, Copy, ExternalLink, RefreshCw
} from 'lucide-react';

interface ReportData {
  report_id: string;
  generated_at: string;
  assessment_title: string;
  target_organization: string;
  target_url: string;
  compliance_framework: string;
  status: string;
  lead_assessor: string;
  executive_summary: string;
  metrics: {
    overall_score: number;
    letter_grade: string;
    total_findings: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    resolved_count: number;
    remediation_rate: number;
  };
  top_findings: {
    id: string;
    title: string;
    severity: string;
    risk_score: number;
    endpoint: string;
    status: string;
    description: string;
  }[];
  recommendations: string[];
}

interface OrgPortfolio {
  id: string;
  name: string;
  domain: string;
  industry: string;
  assessments_count: number;
  active_assessments: number;
  total_findings: number;
  critical_findings: number;
  average_score: number;
  compliance_rating: string;
}

interface StakeholderAlert {
  id: string;
  title: string;
  message: string;
  created_at: string;
  assessment_title: string | null;
}

export const ExecutiveReportExportCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [report, setReport] = useState<ReportData | null>(null);
  const [orgs, setOrgs] = useState<OrgPortfolio[]>([]);
  const [selectedOrgName, setSelectedOrgName] = useState<string>('All');
  const [stakeholderAlerts, setStakeholderAlerts] = useState<StakeholderAlert[]>([]);

  // FR-3.18: Share Link
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const API_BASE = 'http://localhost:8000/api';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resReport, resOrgs, resAlerts] = await Promise.all([
        fetch(`${API_BASE}/reports/executive-summary`),
        fetch(`${API_BASE}/dashboard/organizations`),
        fetch(`${API_BASE}/notifications/stakeholder`)
      ]);

      if (!resReport.ok || !resOrgs.ok) {
        throw new Error('Failed to load report export center data.');
      }

      const [dataReport, dataOrgs, dataAlerts] = await Promise.all([
        resReport.json(),
        resOrgs.json(),
        resAlerts.json()
      ]);

      setReport(dataReport);
      setOrgs(dataOrgs.organizations || []);
      setStakeholderAlerts(dataAlerts.notifications || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadTechnicalExport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/technical-export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybershield_technical_findings_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download technical findings export');
    }
  };

  const handleDownloadAuditCsv = () => {
    window.open(`${API_BASE}/audit/export?export=csv`, '_blank');
  };

  const handleGenerateShareLink = async () => {
    setIsGeneratingShare(true);
    try {
      const res = await fetch(`${API_BASE}/reports/share-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Executive Pentest Summary Briefing' })
      });
      const data = await res.json();
      if (res.ok) {
        setShareLink(data.share_url);
      }
    } catch {
      alert('Failed to generate share link');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', color: '#e2e8f0' }}>

      {/* Header Controls (Hidden during print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Executive Reporting &amp; Compliance Center
              </h1>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                FR-3.13 to FR-3.18 • Print-ready Executive PDF, Technical Remediation Export &amp; Audit Logs
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDownloadAuditCsv}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
          >
            <Download size={13} />
            <span>Export Audit CSV (FR-3.15)</span>
          </button>

          <button
            onClick={handleDownloadTechnicalExport}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
          >
            <Download size={13} />
            <span>Technical JSON (FR-3.14)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Printer size={13} />
            <span>Print Executive PDF (FR-3.13)</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Compiling executive report dossier and compliance artifacts...
        </div>
      )}

      {!loading && report && (
        <>
          {/* FR-3.17: Multi-Organization Selector Banner (Hidden in print) */}
          <div className="no-print card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Building2 size={18} color="#06b6d4" />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  Multi-Organization Security Portfolio (FR-3.17)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                  Switch between monitored client portfolios to review specific risk postures
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedOrgName('All')}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.72rem',
                  background: selectedOrgName === 'All' ? 'rgba(6,182,212,0.2)' : 'transparent',
                  borderColor: selectedOrgName === 'All' ? 'var(--cyan-primary)' : 'var(--border-subtle)',
                  color: selectedOrgName === 'All' ? 'var(--cyan-primary)' : 'var(--text-muted)'
                }}
              >
                All Organizations ({orgs.length})
              </button>
              {orgs.map(org => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrgName(org.name)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.72rem',
                    background: selectedOrgName === org.name ? 'rgba(6,182,212,0.2)' : 'transparent',
                    borderColor: selectedOrgName === org.name ? 'var(--cyan-primary)' : 'var(--border-subtle)',
                    color: selectedOrgName === org.name ? 'var(--cyan-primary)' : 'var(--text-muted)'
                  }}
                >
                  {org.name} ({org.active_assessments} active)
                </button>
              ))}
            </div>
          </div>

          {/* FR-3.18: Assessment Summary Sharing Bar (Hidden in print) */}
          <div className="no-print card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(139,92,246,0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Share2 size={18} color="#8b5cf6" />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  Assessment Summary Sharing (FR-3.18)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                  Generate secure, view-only executive summary links with automatic expiration
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {!shareLink ? (
                <button
                  onClick={handleGenerateShareLink}
                  disabled={isGeneratingShare}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#8b5cf6', color: '#c4b5fd' }}
                >
                  <Share2 size={13} />
                  <span>{isGeneratingShare ? 'Generating...' : 'Create Secure Share Link'}</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid #8b5cf6' }}>
                  <span style={{ fontSize: '0.72rem', color: '#c4b5fd', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shareLink}
                  </span>
                  <button
                    onClick={handleCopyShareLink}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
                  >
                    {copiedLink ? <CheckCircle2 size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PRINTABLE EXECUTIVE REPORT DOCUMENT CONTAINER */}
          <div
            id="executive-report-document"
            style={{
              background: '#0d131f',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '2.5rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              color: '#e2e8f0'
            }}
          >
            {/* Report Letterhead */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(6,182,212,0.4)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#fff" />
                  </div>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                    CyberShield
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                    Executive Audit Dossier
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  SE331 Security Operations Center • Daffodil International University
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#06b6d4', fontFamily: 'monospace' }}>
                  {report.report_id}
                </div>
                <div style={{ color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Generated: {report.generated_at}
                </div>
                <div style={{ color: '#10b981', fontWeight: 600, marginTop: '0.2rem' }}>
                  Classification: CONFIDENTIAL
                </div>
              </div>
            </div>

            {/* Assessment Meta Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(15,23,42,0.7)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Organization</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>{report.target_organization}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Endpoint</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--cyan-primary)', fontFamily: 'monospace', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{report.target_url}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compliance Framework</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginTop: '0.2rem' }}>{report.compliance_framework}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Project Lead</div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '0.2rem' }}>{report.lead_assessor}</div>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.6rem' }}>
                1. Executive Summary &amp; Assessment Scope
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                {report.executive_summary}
              </p>
            </div>

            {/* Score & Key Findings Metrics Callout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(320px, 2fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {/* Score Box */}
              <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Security Health Rating</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: report.metrics.overall_score >= 80 ? '#10b981' : '#f59e0b', margin: '0.4rem 0 0.1rem' }}>
                  {report.metrics.overall_score}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Grade <strong style={{ color: '#f8fafc' }}>{report.metrics.letter_grade}</strong> • Standard Evaluation
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#10b981' }}>
                  Remediation Rate: {report.metrics.remediation_rate}%
                </div>
              </div>

              {/* Findings Severity Table */}
              <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
                  Vulnerability Severity Distribution
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(239,68,68,0.15)', padding: '0.6rem 0.3rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{report.metrics.critical_count}</div>
                    <div style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 600 }}>Critical</div>
                  </div>
                  <div style={{ background: 'rgba(249,115,22,0.15)', padding: '0.6rem 0.3rem', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.3)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>{report.metrics.high_count}</div>
                    <div style={{ fontSize: '0.65rem', color: '#fdba74', fontWeight: 600 }}>High</div>
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.15)', padding: '0.6rem 0.3rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{report.metrics.medium_count}</div>
                    <div style={{ fontSize: '0.65rem', color: '#fde047', fontWeight: 600 }}>Medium</div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.15)', padding: '0.6rem 0.3rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{report.metrics.low_count}</div>
                    <div style={{ fontSize: '0.65rem', color: '#86efac', fontWeight: 600 }}>Low</div>
                  </div>
                  <div style={{ background: 'rgba(6,182,212,0.15)', padding: '0.6rem 0.3rem', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06b6d4' }}>{report.metrics.resolved_count}</div>
                    <div style={{ fontSize: '0.65rem', color: '#a5f3fc', fontWeight: 600 }}>Resolved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Findings Table */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.6rem' }}>
                2. Prioritized Vulnerability Findings (FR-3.13 / FR-3.14)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Vulnerability Description</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Severity</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Risk Score</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Affected Resource</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.top_findings.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{f.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{f.description}</div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span className={`badge ${f.severity === 'Critical' ? 'badge-critical' : (f.severity === 'High' ? 'badge-high' : 'badge-medium')}`} style={{ fontSize: '0.62rem' }}>
                          {f.severity}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>
                        {f.risk_score} / 25
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--cyan-primary)', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        {f.endpoint}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', color: f.status === 'Resolved' ? '#10b981' : '#f59e0b' }}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Strategic Recommendations */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.6rem' }}>
                3. Strategic Security Remediation Guidance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: 'rgba(15,23,42,0.6)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formal Attestation Footer */}
            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              <div>
                CyberShield Platform • Independent Web Application Security Assessment
              </div>
              <div style={{ fontStyle: 'italic' }}>
                Attested &amp; Signed Off by: {report.lead_assessor}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default ExecutiveReportExportCenter;
