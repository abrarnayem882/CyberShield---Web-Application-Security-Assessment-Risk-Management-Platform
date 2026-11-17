import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, MinusCircle, Clock, ClipboardList, ChevronDown } from 'lucide-react';

interface ChecklistEntry {
  checklist_item_id: string;
  control_id: string;
  category: string;
  title: string;
  verdict: string;
  assessor_notes: string;
  recorded_at: string | null;
}

interface ConsoleData {
  total: number;
  progress_percentage: number;
  pass: number;
  fail: number;
  not_applicable: number;
  pending: number;
  items: ChecklistEntry[];
}

const verdictStyle = (v: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    Pass:            { bg: '#14532d', color: '#86efac' },
    Fail:            { bg: '#7f1d1d', color: '#fca5a5' },
    'Not Applicable':{ bg: '#1e3a5f', color: '#93c5fd' },
    Pending:         { bg: '#1f2937', color: '#9ca3af' },
  };
  return { background: (map[v] || map.Pending).bg, color: (map[v] || map.Pending).color, fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '12px', display: 'inline-block' };
};

const VerdictIcon: React.FC<{ verdict: string }> = ({ verdict }) => {
  if (verdict === 'Pass')             return <CheckCircle size={16} color="#22c55e" />;
  if (verdict === 'Fail')             return <XCircle size={16} color="#ef4444" />;
  if (verdict === 'Not Applicable')   return <MinusCircle size={16} color="#3b82f6" />;
  return <Clock size={16} color="#6b7280" />;
};

const VERDICTS = ['Pass', 'Fail', 'Not Applicable', 'Pending'];

const ChecklistAuditConsole: React.FC<{ assessmentId: string }> = ({ assessmentId }) => {
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const API_BASE = 'http://localhost:8000/api';

  const fetchConsole = async () => {
    if (!assessmentId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/checklist-console?assessment_id=${assessmentId}`);
      if (!res.ok) throw new Error('Failed to load checklist');
      setData(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsole(); }, [assessmentId]);

  const handleVerdict = async (itemId: string, verdict: string) => {
    setSavingId(itemId);
    try {
      await fetch(`${API_BASE}/checklist-console`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist_item_id: itemId, verdict, assessor_notes: editNotes[itemId] || '' }),
      });
      fetchConsole();
    } catch { /* non-blocking */ }
    finally { setSavingId(null); }
  };

  if (!assessmentId) return <div style={{ color: '#6b7280', padding: '24px', textAlign: 'center' }}>Select an assessment to open the checklist console.</div>;

  return (
    <div style={{ padding: '24px', color: '#e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <ClipboardList size={22} color="#f97316" />
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>Interactive Audit Checklist Console</h2>
        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: 'auto' }}>FR-2.7 | Ovijeet Saha</span>
      </div>

      {error && <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#fca5a5' }}>{error}</div>}
      {loading && <div style={{ color: '#9ca3af' }}>Loading checklist...</div>}

      {data && (
        <>
          {/* Progress Bar */}
          <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f9fafb' }}>Audit Progress</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>{data.progress_percentage}%</span>
            </div>
            <div style={{ height: '8px', background: '#374151', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', width: `${data.progress_percentage}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: '4px', transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
              {[
                { label: 'Pass', val: data.pass, color: '#22c55e' },
                { label: 'Fail', val: data.fail, color: '#ef4444' },
                { label: 'N/A', val: data.not_applicable, color: '#3b82f6' },
                { label: 'Pending', val: data.pending, color: '#6b7280' },
                { label: 'Total', val: data.total, color: '#9ca3af' },
              ].map(s => (
                <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.val}</span>
                  <span style={{ color: '#6b7280' }}>{s.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Checklist Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.items.map(item => (
              <div key={item.checklist_item_id} style={{ background: '#1f2937', borderRadius: '8px', overflow: 'hidden', border: '1px solid #374151' }}>
                {/* Row */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === item.checklist_item_id ? null : item.checklist_item_id)}>
                  <VerdictIcon verdict={item.verdict} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>{item.control_id}</span>
                      <span style={{ fontSize: '11px', color: '#4b5563' }}>{item.category}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#f9fafb', marginTop: '2px' }}>{item.title}</div>
                  </div>
                  <span style={verdictStyle(item.verdict)}>{item.verdict}</span>
                  <ChevronDown size={14} color="#6b7280" style={{ transform: expandedId === item.checklist_item_id ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
                </div>

                {/* Expanded panel */}
                {expandedId === item.checklist_item_id && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #374151', background: '#111827' }}>
                    {item.assessor_notes && (
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', fontStyle: 'italic' }}>
                        Note: {item.assessor_notes}
                      </div>
                    )}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Assessor Notes</label>
                      <textarea
                        value={editNotes[item.checklist_item_id] ?? item.assessor_notes}
                        onChange={e => setEditNotes(p => ({ ...p, [item.checklist_item_id]: e.target.value }))}
                        rows={2}
                        style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {VERDICTS.map(v => (
                        <button key={v} onClick={() => handleVerdict(item.checklist_item_id, v)} disabled={savingId === item.checklist_item_id}
                          style={{ fontSize: '12px', fontWeight: 600, padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: item.verdict === v ? '#3b82f6' : '#374151', color: item.verdict === v ? '#fff' : '#9ca3af' }}>
                          {savingId === item.checklist_item_id ? '...' : v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChecklistAuditConsole;

