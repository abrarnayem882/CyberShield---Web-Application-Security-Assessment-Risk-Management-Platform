import React, { useEffect, useState } from 'react';
import { BarChart2, CheckCircle, Clock, AlertTriangle, Archive, TrendingUp } from 'lucide-react';

interface AssessmentProgress {
  assessment_id: string;
  title: string;
  status: string;
  overall_completion_percentage: number;
  checklist_progress_percentage: number;
  findings: {
    total: number;
    resolved: number;
    open: number;
    in_remediation: number;
    critical: number;
    high: number;
  };
  milestones: {
    checklist_complete: boolean;
    findings_logged: boolean;
    all_resolved: boolean;
  };
}

interface RemediationTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  is_overdue: boolean;
  target_deadline: string;
  finding_title: string;
  assigned_to: string | null;
}

interface AssessmentProgressProps {
  assessmentId: string;
  userRole: string;
}

const AssessmentProgressMonitor: React.FC<AssessmentProgressProps> = ({ assessmentId, userRole }) => {
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [tasks, setTasks] = useState<RemediationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveNote, setArchiveNote] = useState('');
  const [archiveResult, setArchiveResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost:8000/api';

  const fetchProgress = async () => {
    if (!assessmentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/assessment-progress?assessment_id=${assessmentId}`);
      if (!res.ok) throw new Error('Failed to fetch progress');
      const data = await res.json();
      setProgress(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/remediation-tasks`);
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    if (assessmentId) {
      fetchProgress();
      fetchTasks();
    }
  }, [assessmentId]);

  const handleArchive = async () => {
    if (!assessmentId) return;
    setArchiving(true);
    try {
      const res = await fetch(`${API_BASE}/assessment-archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          sign_off_notes: archiveNote,
          manager_name: 'Security Manager',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setArchiveResult(data.message);
        fetchProgress();
      } else {
        setError(data.error || 'Archive failed');
      }
    } catch {
      setError('Archive request failed');
    } finally {
      setArchiving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      Critical: '#ef4444',
      High: '#f97316',
      Medium: '#eab308',
      Low: '#22c55e',
    };
    return map[priority] || '#6b7280';
  };

  const getStatusColor = (s: string) => {
    const map: Record<string, string> = {
      Overdue: '#ef4444',
      'In Progress': '#3b82f6',
      Assigned: '#8b5cf6',
      Completed: '#22c55e',
    };
    return map[s] || '#6b7280';
  };

  if (!assessmentId) {
    return (
      <div style={{ color: '#9ca3af', padding: '24px', textAlign: 'center' }}>
        Select an assessment to view progress monitoring.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <TrendingUp size={22} color="#3b82f6" />
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>
          Assessment Progress Monitor
        </h2>
        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>FR-2.13</span>
      </div>

      {error && (
        <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {loading && <div style={{ color: '#9ca3af' }}>Loading progress data...</div>}

      {progress && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard icon={<BarChart2 size={18} />} label="Overall Completion" value={`${progress.overall_completion_percentage}%`} color="#3b82f6" />
            <StatCard icon={<CheckCircle size={18} />} label="Checklist Progress" value={`${progress.checklist_progress_percentage}%`} color="#22c55e" />
            <StatCard icon={<AlertTriangle size={18} />} label="Open Findings" value={String(progress.findings.open)} color="#ef4444" />
            <StatCard icon={<Clock size={18} />} label="In Remediation" value={String(progress.findings.in_remediation)} color="#f97316" />
          </div>

          <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#9ca3af' }}>Findings Breakdown</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total', val: progress.findings.total, color: '#6b7280' },
                { label: 'Resolved', val: progress.findings.resolved, color: '#22c55e' },
                { label: 'Critical', val: progress.findings.critical, color: '#ef4444' },
                { label: 'High', val: progress.findings.high, color: '#f97316' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#9ca3af' }}>Milestones</h3>
            {Object.entries(progress.milestones).map(([key, done]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle size={16} color={done ? '#22c55e' : '#374151'} />
                <span style={{ fontSize: '14px', color: done ? '#e5e7eb' : '#6b7280' }}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tasks.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f9fafb', marginBottom: '12px' }}>
            Remediation Tasks (FR-2.14)
          </h3>
          {tasks.filter(t => t.is_overdue).length > 0 && (
            <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '6px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#ef4444" />
              <span style={{ color: '#fca5a5', fontSize: '14px' }}>
                {tasks.filter(t => t.is_overdue).length} overdue task(s) require immediate attention
              </span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.slice(0, 8).map(task => (
              <div key={task.id} style={{
                background: '#1f2937',
                borderRadius: '6px',
                padding: '12px',
                borderLeft: `3px solid ${task.is_overdue ? '#ef4444' : getPriorityColor(task.priority)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#f9fafb' }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{task.finding_title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                    background: getStatusColor(task.status) + '22',
                    color: getStatusColor(task.status),
                    display: 'block', marginBottom: '4px',
                  }}>
                    {task.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>Due: {task.target_deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(userRole === 'manager' || userRole === 'admin') && progress && progress.status !== 'Archived' && (
        <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Archive size={16} color="#8b5cf6" />
            <h3 style={{ margin: 0, fontSize: '14px', color: '#f9fafb', fontWeight: 600 }}>
              Assessment Archival (FR-2.18)
            </h3>
          </div>
          {archiveResult ? (
            <div style={{ color: '#86efac', fontSize: '14px' }}>{archiveResult}</div>
          ) : (
            <>
              <textarea
                value={archiveNote}
                onChange={e => setArchiveNote(e.target.value)}
                placeholder="Sign-off notes..."
                rows={3}
                style={{
                  width: '100%', background: '#111827', border: '1px solid #374151',
                  color: '#e5e7eb', borderRadius: '6px', padding: '8px',
                  fontSize: '14px', resize: 'vertical', marginBottom: '10px', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleArchive}
                disabled={archiving}
                style={{
                  background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '8px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {archiving ? 'Archiving...' : 'Finalize & Archive Assessment'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px', borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color, marginBottom: '8px' }}>
      {icon}
      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
    </div>
    <div style={{ fontSize: '28px', fontWeight: 700, color: '#f9fafb' }}>{value}</div>
  </div>
);

export default AssessmentProgressMonitor;

