import React, { useEffect, useState } from 'react';
import { ClipboardList, PlusCircle, Globe, Calendar, ChevronDown } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  target_url: string;
  target_organization: string;
  status: string;
  compliance_framework: string;
  completion_percentage: number;
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  Draft: '#6b7280',
  Scheduled: '#3b82f6',
  'In Progress': '#f97316',
  'Under Review': '#8b5cf6',
  Completed: '#22c55e',
  Archived: '#374151',
};

const AssessmentSetup: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    target_url: '',
    target_organization: '',
    scope_in_urls: '',
    scope_out_urls: '',
    authorized_domains: '',
    compliance_framework: 'OWASP Top 10:2021 & NIST CSF 2.0',
    scheduled_start: '',
    scheduled_end: '',
  });

  const API_BASE = 'http://localhost:8000/api';

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/assessments`);
      if (!res.ok) throw new Error('Failed to fetch assessments');
      const data = await res.json();
      setAssessments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssessments(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.target_url) {
      setError('Title and Target URL are required.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, assessor_name: 'Security Assessor' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        setShowForm(false);
        setForm({
          title: '', target_url: '', target_organization: '',
          scope_in_urls: '', scope_out_urls: '', authorized_domains: '',
          compliance_framework: 'OWASP Top 10:2021 & NIST CSF 2.0',
          scheduled_start: '', scheduled_end: '',
        });
        fetchAssessments();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || 'Failed to create assessment');
      }
    } catch {
      setError('Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#111827', border: '1px solid #374151',
    color: '#e5e7eb', borderRadius: '6px', padding: '8px 12px',
    fontSize: '14px', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px',
  };

  return (
    <div style={{ padding: '24px', color: '#e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <ClipboardList size={22} color="#3b82f6" />
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>
          Assessment Setup & Scope Definition
        </h2>
        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>FR-2.1, FR-2.6</span>
      </div>

      {successMsg && (
        <div style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#86efac' }}>
          {successMsg}
        </div>
      )}
      {error && (
        <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <button
        onClick={() => { setShowForm(!showForm); setError(null); }}
        style={{
          background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px',
          padding: '8px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px',
        }}
      >
        <PlusCircle size={16} />
        {showForm ? 'Cancel' : 'Create New Assessment'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#1f2937', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#f9fafb' }}>New Assessment Project</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Assessment Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Q4 2026 Web Application Pentest" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Target URL *</label>
              <input value={form.target_url} onChange={e => setForm(p => ({ ...p, target_url: e.target.value }))} placeholder="https://example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Target Organization</label>
              <input value={form.target_organization} onChange={e => setForm(p => ({ ...p, target_organization: e.target.value }))} placeholder="Organization name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Compliance Framework</label>
              <input value={form.compliance_framework} onChange={e => setForm(p => ({ ...p, compliance_framework: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Scheduled Start</label>
              <input type="date" value={form.scheduled_start} onChange={e => setForm(p => ({ ...p, scheduled_start: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Scheduled End</label>
              <input type="date" value={form.scheduled_end} onChange={e => setForm(p => ({ ...p, scheduled_end: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Scope: In-Scope URLs</label>
              <textarea value={form.scope_in_urls} onChange={e => setForm(p => ({ ...p, scope_in_urls: e.target.value }))} placeholder="One URL per line" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Scope: Out-of-Scope URLs</label>
              <textarea value={form.scope_out_urls} onChange={e => setForm(p => ({ ...p, scope_out_urls: e.target.value }))} placeholder="One URL per line" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Authorized Domains</label>
              <textarea value={form.authorized_domains} onChange={e => setForm(p => ({ ...p, authorized_domains: e.target.value }))} placeholder="One domain per line" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px',
              padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {submitting ? 'Creating...' : 'Create Assessment'}
          </button>
        </form>
      )}

      {loading && <div style={{ color: '#9ca3af' }}>Loading assessments...</div>}

      {assessments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f9fafb', margin: '0 0 8px' }}>
            Active Assessments ({assessments.length})
          </h3>
          {assessments.map(a => (
            <div key={a.id} style={{
              background: '#1f2937', borderRadius: '8px', padding: '16px',
              borderLeft: `4px solid ${statusColors[a.status] || '#6b7280'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#f9fafb', marginBottom: '4px' }}>{a.title}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Globe size={12} /> {a.target_organization || a.target_url}
                    </span>
                    {a.scheduled_start && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {a.scheduled_start.split('T')[0]}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px' }}>{a.compliance_framework}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px',
                    background: (statusColors[a.status] || '#6b7280') + '22',
                    color: statusColors[a.status] || '#6b7280',
                  }}>
                    {a.status}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '80px', height: '6px', background: '#374151', borderRadius: '3px' }}>
                      <div style={{ width: `${a.completion_percentage}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{a.completion_percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && assessments.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>
          No assessments found. Create your first assessment project above.
        </div>
      )}
    </div>
  );
};

export default AssessmentSetup;
