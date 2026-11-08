import React, { useState } from 'react';
import { Shield, ArrowRight, X } from 'lucide-react';
import { AssessmentRequest } from '../types';

interface RequestModalProps {
  initialUrl?: string;
  onClose: () => void;
  onSubmit: (request: Omit<AssessmentRequest, 'id' | 'status' | 'submittedAt'>) => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  initialUrl = '',
  onClose,
  onSubmit
}) => {
  const [organization, setOrganization] = useState('GlobalMart Retail Ltd');
  const [contactName, setContactName] = useState('Sarah Jenkins');
  const [contactEmail, setContactEmail] = useState('sarah.j@globalmart-retail.com');
  const [targetUrl, setTargetUrl] = useState(initialUrl || 'https://globalmart-retail.com');
  const [scopeNotes, setScopeNotes] = useState('Production web infrastructure, payment gateways, and authentication endpoints.');
  const [complianceTarget, setComplianceTarget] = useState('OWASP Top 10:2021 & NIST CSF 2.0');
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'Emergency'>('Urgent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      organization,
      contactName,
      contactEmail,
      targetUrl,
      scopeNotes,
      complianceTarget,
      priority
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '580px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Request Full Security Assessment</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FR-1.11: Customer Conversion & Inbound Assessment Pipeline</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.825rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Organization / Company Name
            </label>
            <input 
              type="text" 
              value={organization} 
              onChange={(e) => setOrganization(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Contact Person Name
              </label>
              <input 
                type="text" 
                value={contactName} 
                onChange={(e) => setContactName(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Contact Work Email
              </label>
              <input 
                type="email" 
                value={contactEmail} 
                onChange={(e) => setContactEmail(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Target Website / Domain URL
            </label>
            <input 
              type="text" 
              value={targetUrl} 
              onChange={(e) => setTargetUrl(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Target Compliance Standard
              </label>
              <select 
                value={complianceTarget} 
                onChange={(e) => setComplianceTarget(e.target.value)} 
                className="input-field"
              >
                <option value="OWASP Top 10:2021 & NIST CSF 2.0">OWASP Top 10:2021 & NIST CSF 2.0</option>
                <option value="PCI-DSS v4.0 Web Security">PCI-DSS v4.0 Web Security</option>
                <option value="ISO/IEC 27001 Security Audit">ISO/IEC 27001 Security Audit</option>
                <option value="HIPAA Security Rule Standards">HIPAA Security Rule Standards</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Priority Level
              </label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as any)} 
                className="input-field"
              >
                <option value="Routine">Routine (Within 5 Business Days)</option>
                <option value="Urgent">Urgent (Within 48 Hours)</option>
                <option value="Emergency">Emergency (Active Incident)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Specific Assessment Scope & Architecture Notes
            </label>
            <textarea 
              rows={3} 
              value={scopeNotes} 
              onChange={(e) => setScopeNotes(e.target.value)} 
              className="input-field" 
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <span>Submit Assessment Inquiry</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
