import React, { useEffect, useState } from 'react';
import { FileText, PlusCircle, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface AssessmentRequest {
  id: string;
  organization: string;
  target_url: string;
  priority: string;
  status: string;
  compliance_target: string;
  scope_notes: string;
  submitted_at: string;
}

interface CustomerAssessmentViewProps {
  customerOrg?: string;
}

const statusColors: Record<string, string> = {
  'Pending Review': '#6b7280',
  'Approved & Scheduled': '#3b82f6',
  'In Progress': '#f97316',
  'Completed': '#22c55e',
};

const priorityColors: Record<string, string> = {
  Routine: '#22c55e',
  Urgent: '#f97316',
  Emergency: '#ef4444',
};

const CustomerAssessmentView: React.FC<CustomerAssessmentViewProps> = ({ customerOrg }) => {
  const [requests, setRequests] = useState<AssessmentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    organization: customerOrg || '',
    contact_name: '',
    contact_email: '',
    target_url: '',
    scope_notes: '',
    compliance_target: 'OWASP Top 10:2021 & NIST CSF 2.0',
    priority: 'Urgent',
  });

  const API_BASE = 'http://localhost:8000/api';

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/request-assessment`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRequests(data);
    } catch {
      setError('Could not load assessment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization || !form.target_url || !form.contact_name || !form.contact_email) {
      setError('Organization, Contact Name, Email and Target URL are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/request-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Your full assessment request has been submitted! Our security team will review and contact you within 24 hours.');
        setShowForm(false);
        setForm({ organization: customerOrg || '', contact_name: '', contact_email: '', target_url: '', scope_notes: '', compliance_target: 'OWASP Top 10:2021 & NIST CSF 2.0', priority: 'Urgent' });
        fetchRequests();
        setTimeout(() => setSuccessMsg(null), 6000);
      } else {
        setError(data.error || 'Submission failed.');
      }
    } catch {
      setError('Request failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#111827', border: '1px solid #374151',
    color: '#e5e7eb', borderRadius: '6px', padding: '8px 12px',
    fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending Review').length,
    inProgress: requests.filter(r => r.status === 'In Progress' || r.status === 'Approved & Scheduled').length,
    completed: requests.filter(r => r.status === 'Completed').length,
  };

  return (
    <div style={{ padding: '24px', color: '#e5e7eb', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <FileText size={22} color="#8b5cf6" />
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>My Assessment Requests</h2>
        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: 'auto' }}>FR-1.13 | Customer Portal</span>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>
        Submit and track full security assessment requests. Your security team will review and schedule testing.
      </p>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Requests', val: stats.total, color: '#6b7280', icon: <FileText size={16} /> },
          { label: 'Pending Review', val: stats.pending, color: '#6b7280', icon: <Clock size={16} /> },
          { label: 'In Progress', val: stats.inProgress, color: '#f97316', icon: <TrendingUp size={16} /> },
          { label: 'Completed', val: stats.completed, color: '#22c55e', icon: <CheckCircle size={16} /> },
        ].map(s => (
          <div key={s.label} style={{ background: '#1f2937', borderRadius: '8px', padding: '14px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: s.color, marginBottom: '6px' }}>
              {s.icon}
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f9fafb' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#86efac', fontSize: '14px' }}>
          <CheckCircle size={14} style={{ marginRight: '8px', display: 'inline' }} />{successMsg}
        </div>
      )}
      {error && (
        <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#fca5a5', fontSize: '14px' }}>
          <AlertTriangle size={14} style={{ marginRight: '8px', display: 'inline' }} />{error}
        </div>
      )}

      {/* Submit Button */}
      <button onClick={() => { setShowForm(!showForm); setError(null); }}
        style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', padding: '9px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
        <PlusCircle size={16} />
        {showForm ? 'Cancel Request' : 'Request Full Security Assessment'}
      </button>

      {/* Request Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#1f2937', borderRadius: '8px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#f9fafb', fontWeight: 600 }}>
            New Full Assessment Request
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Organization Name *</label>
              <input value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} placeholder="Your company name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Target Website URL *</label>
              <input value={form.target_url} onChange={e => setForm(p => ({ ...p, target_url: e.target.value }))} placeholder="https://yourwebsite.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contact Name *</label>
              <input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="Your full name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contact Email *</label>
              <input type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="you@company.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Compliance Target</label>
              <select value={form.compliance_target} onChange={e => setForm(p => ({ ...p, compliance_target: e.target.value }))} style={{ ...inputStyle, appearance: 'none' as const }}>
                <option>OWASP Top 10:2021 & NIST CSF 2.0</option>
                <option>OWASP Top 10:2021 & PCI DSS 4.0</option>
                <option>NIST CSF 2.0 & ISO 27001</option>
                <option>PCI DSS 4.0</option>
                <option>ISO 27001</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ ...inputStyle, appearance: 'none' as const }}>
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Scope Notes (optional — describe what should be tested)</label>
            <textarea value={form.scope_notes} onChange={e => setForm(p => ({ ...p, scope_notes: e.target.value }))} placeholder="e.g. Login portal, checkout, admin panel, API endpoints..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={submitting} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit Assessment Request'}
          </button>
        </form>
      )}

      {/* Request List */}
      {loading && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '24px' }}>Loading your requests...</div>}

      {!loading && requests.length > 0 && (
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f9fafb', margin: '0 0 12px' }}>All Assessment Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.map(r => (
              <div key={r.id} style={{ background: '#1f2937', borderRadius: '8px', padding: '16px', borderLeft: `4px solid ${statusColors[r.status] || '#6b7280'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#f9fafb', marginBottom: '4px' }}>{r.organization}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace', marginBottom: '4px' }}>{r.target_url}</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>{r.compliance_target}</div>
                    {r.scope_notes && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px', fontStyle: 'italic' }}>{r.scope_notes.slice(0, 120)}{r.scope_notes.length > 120 ? '...' : ''}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: (statusColors[r.status] || '#6b7280') + '22', color: statusColors[r.status] || '#6b7280' }}>
                      {r.status}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: (priorityColors[r.priority] || '#6b7280') + '22', color: priorityColors[r.priority] || '#6b7280' }}>
                      {r.priority}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {new Date(r.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && requests.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
          <FileText size={36} color="#374151" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '15px' }}>No assessment requests yet.</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Click "Request Full Security Assessment" to get started.</div>
        </div>
      )}
    </div>
  );
};

export default CustomerAssessmentView;
