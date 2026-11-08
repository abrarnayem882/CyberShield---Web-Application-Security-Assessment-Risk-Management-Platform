import React from 'react';
import { Shield, Server, Layout, Database, X } from 'lucide-react';

interface TeamModalProps {
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '720px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>CyberShield Platform</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--cyan-primary)', fontWeight: 600 }}>
                Course: SE331 | Lab Section: 41_B2 | Semester: Fall 2026
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Project Overview */}
        <div style={{ marginBottom: '1.75rem', background: 'rgba(9, 13, 22, 0.7)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Module 1 Scope: Website Submission, Basic Security Report & User Management
          </div>
          <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            CyberShield provides organizations with safe automated security audits covering HTTPS transport encryption, SSL/TLS certificate chains, 6 core security headers (HSTS, CSP, XFO, XCTO, RP, PP), cookie security flags, and server banner masking. Built with React, TypeScript, and Django REST Framework.
          </p>
        </div>

        {/* Student & Engineering Role */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Module 1 Architecture & Engineering Lead
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.35)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Server size={22} color="var(--cyan-primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem' }}>MD. ABU NAYEM</div>
                <span className="font-mono badge badge-info" style={{ fontSize: '0.75rem' }}>ID: 232-35-332</span>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--cyan-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                Security Architecture & Backend Lead — Module 1
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.5 }}>
                Engineered the Django REST Framework API, HMAC-SHA256 JWT authentication, RFC 3986 URL validation, SSRF private IP filters, concurrent safe security checks engine, scoring formulas, activity diagrams (Mermaid & PlantUML), and tailored remediation configuration generators for Nginx, Apache, and Django.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack badges */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>TECHNOLOGY STACK:</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Python 3</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Django REST Framework</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>TypeScript / React</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Vite</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>PostgreSQL / SQLite</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>JWT Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
