import React, { useEffect, useState } from 'react';
import {
  Kanban, CheckCircle2, Clock, PlayCircle, ArrowRight,
  Globe, Mail, Calendar, RefreshCw, X, Shield, PlusCircle
} from 'lucide-react';

interface InquiryItem {
  id: string;
  organization: string;
  contact_name: string;
  contact_email: string;
  target_url: string;
  compliance_target: string;
  priority: string;
  status: string;
  scope_notes: string;
  submitted_at: string;
  linked_assessment_id: string | null;
  completion_percentage: number;
}

interface KanbanData {
  total_inquiries: number;
  stage_counts: Record<string, number>;
  pipeline: Record<string, InquiryItem[]>;
}

export const AssessmentKanbanPipeline: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kanbanData, setKanbanData] = useState<KanbanData | null>(null);
  const [reviewingInquiry, setReviewingInquiry] = useState<InquiryItem | null>(null);

  // Approval Form State (FR-3.10)
  const [assessorName, setAssessorName] = useState<string>('Security Assessor');
  const [scheduledStart, setScheduledStart] = useState<string>('');
  const [scheduledEnd, setScheduledEnd] = useState<string>('');
  const [kickoffNotes, setKickoffNotes] = useState<string>('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const API_BASE = 'http://localhost:8000/api';
  const STAGES = ['Pending Review', 'Approved & Scheduled', 'In Progress', 'Completed'];

  const stageIcons: Record<string, typeof Clock> = {
    'Pending Review': Clock,
    'Approved & Scheduled': CheckCircle2,
    'In Progress': PlayCircle,
    'Completed': Shield,
  };

  const stageColors: Record<string, string> = {
    'Pending Review': '#f59e0b',
    'Approved & Scheduled': '#3b82f6',
    'In Progress': '#8b5cf6',
    'Completed': '#10b981',
  };

  const fetchKanban = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/inquiries/kanban`);
      if (!res.ok) throw new Error('Failed to load assessment inquiries pipeline.');
      const data = await res.json();
      setKanbanData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching kanban data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  const handleTransitionStage = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/kanban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setSuccessToast(`Inquiry moved to "${newStatus}"!`);
        setTimeout(() => setSuccessToast(null), 3000);
        fetchKanban();
      }
    } catch {
      // Ignore
    }
  };

  const handleApproveAndKickoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingInquiry) return;

    setIsSubmittingApproval(true);
    try {
      const res = await fetch(`${API_BASE}/inquiries/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_id: reviewingInquiry.id,
          assessor_name: assessorName,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          kickoff_notes: kickoffNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessToast(`Inquiry for ${reviewingInquiry.organization} approved! Pentest project created.`);
        setTimeout(() => setSuccessToast(null), 4000);
        setReviewingInquiry(null);
        fetchKanban();
      } else {
        alert(data.error || 'Failed to approve inquiry');
      }
    } catch {
      alert('Error approving inquiry');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Kanban size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Customer Inquiry Kanban Pipeline
              </h1>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                FR-3.9 &amp; FR-3.10 • Track Inbound Assessment Inquiries &amp; Schedule Kickoff Testing
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchKanban}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
        >
          <RefreshCw size={13} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {successToast && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
          {successToast}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading customer inquiry kanban workflow...
        </div>
      )}

      {!loading && kanbanData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
          {STAGES.map(stage => {
            const Icon = stageIcons[stage] || Clock;
            const items = kanbanData.pipeline[stage] || [];
            const color = stageColors[stage];

            return (
              <div
                key={stage}
                style={{
                  background: 'rgba(15,23,42,0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  minHeight: '480px'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: `2px solid ${color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Icon size={16} color={color} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                      {stage}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                    {items.length}
                  </span>
                </div>

                {/* Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                      No inquiries in this stage.
                    </div>
                  ) : (
                    items.map(item => (
                      <div
                        key={item.id}
                        className="card"
                        style={{
                          padding: '0.9rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          borderLeft: `3px solid ${color}`,
                          background: 'rgba(30,41,59,0.5)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                            {item.organization}
                          </span>
                          <span className={`badge ${item.priority === 'Emergency' ? 'badge-critical' : (item.priority === 'Urgent' ? 'badge-high' : 'badge-info')}`} style={{ fontSize: '0.58rem' }}>
                            {item.priority}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--cyan-primary)' }}>
                          <Globe size={12} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.target_url}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          <Mail size={12} />
                          <span>{item.contact_name} ({item.contact_email})</span>
                        </div>

                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: 'rgba(15,23,42,0.4)', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                          Standard: <strong>{item.compliance_target}</strong>
                        </div>

                        {item.linked_assessment_id && (
                          <div style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Active Pentest Linked</span>
                            <span>{item.completion_percentage}% done</span>
                          </div>
                        )}

                        {/* Stage Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          {stage === 'Pending Review' ? (
                            <button
                              onClick={() => {
                                setReviewingInquiry(item);
                                setScheduledStart(new Date().toISOString().split('T')[0]);
                                const nextWeek = new Date();
                                nextWeek.setDate(nextWeek.getDate() + 14);
                                setScheduledEnd(nextWeek.toISOString().split('T')[0]);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', fontSize: '0.68rem', justifyContent: 'center', padding: '0.3rem 0.5rem' }}
                            >
                              <PlusCircle size={12} />
                              <span>Review &amp; Schedule Kickoff</span>
                            </button>
                          ) : (
                            <>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                                {new Date(item.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>

                              {stage === 'Approved & Scheduled' && (
                                <button
                                  onClick={() => handleTransitionStage(item.id, 'In Progress')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.65rem', padding: '0.2rem 0.45rem' }}
                                >
                                  <span>Start Testing</span>
                                  <ArrowRight size={10} />
                                </button>
                              )}

                              {stage === 'In Progress' && (
                                <button
                                  onClick={() => handleTransitionStage(item.id, 'Completed')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.65rem', padding: '0.2rem 0.45rem', borderColor: '#10b981', color: '#10b981' }}
                                >
                                  <span>Mark Completed</span>
                                  <CheckCircle2 size={10} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FR-3.10: Customer Inquiry Review & Approval Modal */}
      {reviewingInquiry && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
            borderRadius: '14px', width: '100%', maxWidth: '580px', padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  Review &amp; Approve Inquiry (FR-3.10)
                </h3>
              </div>
              <button
                onClick={() => setReviewingInquiry(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Organization:</span>
                <strong style={{ color: '#f1f5f9' }}>{reviewingInquiry.organization}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Target URL:</span>
                <span style={{ color: 'var(--cyan-primary)', fontFamily: 'monospace' }}>{reviewingInquiry.target_url}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Contact:</span>
                <span>{reviewingInquiry.contact_name} ({reviewingInquiry.contact_email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Compliance Standard:</span>
                <span>{reviewingInquiry.compliance_target}</span>
              </div>
              {reviewingInquiry.scope_notes && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  Notes: {reviewingInquiry.scope_notes}
                </div>
              )}
            </div>

            <form onSubmit={handleApproveAndKickoff}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Assigned Lead Assessor
                  </label>
                  <input
                    type="text"
                    value={assessorName}
                    onChange={e => setAssessorName(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '0.5rem 0.75rem', background: '#0f172a',
                      border: '1px solid var(--border-subtle)', borderRadius: '8px',
                      color: '#f8fafc', fontSize: '0.8rem', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Scheduled Start Date
                    </label>
                    <input
                      type="date"
                      value={scheduledStart}
                      onChange={e => setScheduledStart(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.5rem 0.75rem', background: '#0f172a',
                        border: '1px solid var(--border-subtle)', borderRadius: '8px',
                        color: '#f8fafc', fontSize: '0.8rem', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Scheduled Kickoff Deadline
                    </label>
                    <input
                      type="date"
                      value={scheduledEnd}
                      onChange={e => setScheduledEnd(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.5rem 0.75rem', background: '#0f172a',
                        border: '1px solid var(--border-subtle)', borderRadius: '8px',
                        color: '#f8fafc', fontSize: '0.8rem', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Kickoff Guidance Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={kickoffNotes}
                    onChange={e => setKickoffNotes(e.target.value)}
                    placeholder="Enter special testing constraints, auth credentials, or authorized windows..."
                    style={{
                      width: '100%', padding: '0.5rem 0.75rem', background: '#0f172a',
                      border: '1px solid var(--border-subtle)', borderRadius: '8px',
                      color: '#f8fafc', fontSize: '0.8rem', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewingInquiry(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApproval}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                >
                  {isSubmittingApproval ? 'Provisioning Assessment...' : 'Approve & Provision Pentest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssessmentKanbanPipeline;
