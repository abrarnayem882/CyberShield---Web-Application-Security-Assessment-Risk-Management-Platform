import React, { useState } from 'react';
import { 
  UserCheck, 
  Key, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  User, 
  Building, 
  Shield, 
  Clock,
  Layers
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { SYSTEM_USERS } from '../data/mockData';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onSwitchUser
}) => {
  const [copiedToken, setCopiedToken] = useState(false);

  // Simulated JWT Token for the current user
  const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
    sub: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    org: currentUser.organization,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  }))}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

  const copyToken = () => {
    navigator.clipboard.writeText(mockJwtToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const rolePermissions: Record<UserRole, { label: string; desc: string; canSubmitScan: boolean; canViewFullReport: boolean; canRequestAssessment: boolean; canViewAuditLogs: boolean; canManageUsers: boolean }> = {
    customer: {
      label: 'Customer / Organization',
      desc: 'Submits company websites for safe automated security checks and requests professional assessments.',
      canSubmitScan: true,
      canViewFullReport: true,
      canRequestAssessment: true,
      canViewAuditLogs: false,
      canManageUsers: false
    },
    assessor: {
      label: 'Security Assessor / Analyst',
      desc: 'Performs non-destructive audits, analyzes header configurations, and verifies web security compliance.',
      canSubmitScan: true,
      canViewFullReport: true,
      canRequestAssessment: true,
      canViewAuditLogs: true,
      canManageUsers: false
    },
    developer: {
      label: 'Remediation Developer',
      desc: 'Inspects failed checks and implements server configuration patches for Nginx, Apache, and Django.',
      canSubmitScan: true,
      canViewFullReport: true,
      canRequestAssessment: false,
      canViewAuditLogs: false,
      canManageUsers: false
    },
    manager: {
      label: 'Security Manager / Lead',
      desc: 'Oversees organizational web posture, reviews security scores, and monitors risk levels across assets.',
      canSubmitScan: true,
      canViewFullReport: true,
      canRequestAssessment: true,
      canViewAuditLogs: true,
      canManageUsers: false
    },
    admin: {
      label: 'Security Administrator',
      desc: 'Governs system parameters, manages role-based access control, inspects audit logs, and monitors APIs.',
      canSubmitScan: true,
      canViewFullReport: true,
      canRequestAssessment: true,
      canViewAuditLogs: true,
      canManageUsers: true
    }
  };

  const currentPerms = rolePermissions[currentUser.role];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={24} color="var(--cyan-primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              User Profile & Role-Based Access Control (RBAC)
            </h1>
            <span className="badge badge-info">FR-1.1 & FR-1.2</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            JWT authentication verification, bcrypt/PBKDF2 security credentials, and role permission policies.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Active User Identity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)'
              }}>
                <User size={28} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{currentUser.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>
                  {currentUser.studentId && (
                    <span className="badge badge-secondary" style={{ fontFamily: 'monospace' }}>
                      ID: {currentUser.studentId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{currentUser.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{currentUser.organization}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Authentication Protocol:</span>
                <span style={{ fontWeight: 600, color: 'var(--cyan-primary)' }}>JWT (HMAC-SHA256)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Session Expiry:</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>60 Minutes Active</span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Assigned Stakeholder Description
              </div>
              <p style={{ fontSize: '0.785rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {currentPerms.desc}
              </p>
            </div>
          </div>

          {/* Switch Persona Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Layers size={18} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Switch Stakeholder Persona (Live Demo)</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {SYSTEM_USERS.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => onSwitchUser(user)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                        {user.name}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                        {user.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      {user.organization}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: RBAC Permission Matrix & JWT Bearer Token */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Permission Matrix */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ShieldCheck size={20} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Role-Based Access Control (RBAC) Matrix</h3>
            </div>
            
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Access enforcement verified via server-side Django REST Framework permission classes and client-side guards.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Submit Target URL & Run Automated Checks</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Access to POST /api/scan endpoint with RFC 3986 validation</div>
                </div>
                {currentPerms.canSubmitScan ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600, fontSize: '0.785rem' }}>
                    <CheckCircle2 size={16} /> Granted
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 600, fontSize: '0.785rem' }}>
                    <XCircle size={16} /> Prohibited
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>View Security Score & Remediation Snippets</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Access to score gauge, header findings, and Nginx/Apache/Django tabs</div>
                </div>
                {currentPerms.canViewFullReport ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600, fontSize: '0.785rem' }}>
                    <CheckCircle2 size={16} /> Granted
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 600, fontSize: '0.785rem' }}>
                    <XCircle size={16} /> Prohibited
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Request Full Assessment Escalation (CTA)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Ability to queue formal scope inquiries to assessor pool</div>
                </div>
                {currentPerms.canRequestAssessment ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600, fontSize: '0.785rem' }}>
                    <CheckCircle2 size={16} /> Granted
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 600, fontSize: '0.785rem' }}>
                    <XCircle size={16} /> Prohibited
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Inspect Immutable Audit Log Events</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Ability to query audit trail records and system logs</div>
                </div>
                {currentPerms.canViewAuditLogs ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600, fontSize: '0.785rem' }}>
                    <CheckCircle2 size={16} /> Granted
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 600, fontSize: '0.785rem' }}>
                    <XCircle size={16} /> Restricted
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>System Administration & Role Management</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Full platform configuration and user management rights</div>
                </div>
                {currentPerms.canManageUsers ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600, fontSize: '0.785rem' }}>
                    <CheckCircle2 size={16} /> Granted
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 600, fontSize: '0.785rem' }}>
                    <XCircle size={16} /> Restricted
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* JWT Token Inspector */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} color="var(--cyan-primary)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Signed JWT Bearer Token (FR-1.1)</h3>
              </div>
              <button
                onClick={copyToken}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                {copiedToken ? 'Copied Token!' : 'Copy Bearer Token'}
              </button>
            </div>

            <div style={{ background: '#090d16', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '0.75rem', color: '#93c5fd', wordBreak: 'break-all' }}>
              {mockJwtToken}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              <span>Header: HMAC-SHA256</span>
              <span>•</span>
              <span>Payload: Role={currentUser.role}, Org={currentUser.organization}</span>
              <span>•</span>
              <span>Expiry: 60m</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

