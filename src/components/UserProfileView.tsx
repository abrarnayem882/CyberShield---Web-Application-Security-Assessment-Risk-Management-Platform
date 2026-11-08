import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Key, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Building, 
  Shield, 
  Clock,
  Layers,
  Activity,
  Server,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { SYSTEM_USERS } from '../data/mockData';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onOpenLoginModal?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onSwitchUser,
  onOpenLoginModal
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [apiHealth, setApiHealth] = useState<{ status: string; service: string; version: string } | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(SYSTEM_USERS);
  const [editingRoles, setEditingRoles] = useState<Record<string, UserRole>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Fetch live health & users if admin
  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => setApiHealth(data))
      .catch(() => setApiHealth(null));

    if (currentUser.role === 'admin') {
      fetch('http://localhost:8000/api/users')
        .then(res => res.json())
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllUsers(data.map(u => ({
              id: u.id,
              username: u.username,
              name: u.name,
              email: u.email,
              role: u.role as UserRole,
              organization: u.organization_name || 'CyberShield SecOps'
            })));
          }
        })
        .catch(() => {});
    }
  }, [currentUser.role]);

  // Simulated or backend JWT Token
  const activeToken = currentUser.token || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
    sub: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    org: currentUser.organization,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  }))}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

  const copyToken = () => {
    navigator.clipboard.writeText(activeToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setEditingRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleSaveRole = async (user: UserProfile) => {
    const updatedRole = editingRoles[user.id] || user.role;
    try {
      await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          role: updatedRole,
          admin_name: currentUser.name
        })
      });
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: updatedRole } : u));
      setSaveSuccessMsg(`Updated role for ${user.name} to ${updatedRole}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch {
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: updatedRole } : u));
      setSaveSuccessMsg(`Saved locally: ${user.name} is now ${updatedRole}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const roleDescriptions: Record<UserRole, string> = {
    customer: 'Submits company websites for safe automated security checks and requests professional assessments.',
    assessor: 'Performs non-destructive audits, analyzes header configurations, and verifies web security compliance.',
    developer: 'Inspects failed checks and implements server configuration patches for Nginx, Apache, and Django.',
    manager: 'Oversees organizational web posture, reviews security scores, and monitors risk levels across assets.',
    admin: 'Governs system parameters, manages role-based access control, inspects audit logs, and monitors APIs.'
  };

  const rbacCapabilities = [
    { title: 'Submit Website Scans (FR-1.3)', customer: true, dev: true, assessor: true, manager: true, admin: true },
    { title: 'View Score & Grade (FR-1.10)', customer: true, dev: true, assessor: true, manager: true, admin: true },
    { title: 'Nginx/Apache/Django Fixes (FR-1.12)', customer: true, dev: true, assessor: true, manager: true, admin: true },
    { title: 'Request Full Assessment (FR-1.13)', customer: true, dev: false, assessor: true, manager: true, admin: true },
    { title: 'Security Audit Trail (FR-1.17)', customer: false, dev: false, assessor: true, manager: true, admin: true },
    { title: 'Inbound Inquiries Pipeline', customer: false, dev: false, assessor: true, manager: true, admin: true },
    { title: 'User Role Management (FR-1.2)', customer: false, dev: false, assessor: false, manager: false, admin: true },
    { title: 'System Engine Health Diagnostics', customer: false, dev: false, assessor: false, manager: false, admin: true }
  ];

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
            JWT authentication verification, role permission policies, and system governance.
          </p>
        </div>

        {onOpenLoginModal && (
          <button 
            onClick={onOpenLoginModal}
            className="btn btn-primary"
            style={{ fontSize: '0.825rem' }}
          >
            <UserCheck size={16} />
            <span>Open Role Sign-in Portal</span>
          </button>
        )}
      </div>

      {saveSuccessMsg && (
        <div style={{ 
          marginBottom: '1.25rem', 
          padding: '0.75rem 1rem', 
          borderRadius: '8px', 
          background: 'rgba(16, 185, 129, 0.15)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          color: '#6ee7b7', 
          fontSize: '0.825rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

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
                Assigned Role Scope
              </div>
              <p style={{ fontSize: '0.785rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {roleDescriptions[currentUser.role]}
              </p>
            </div>
          </div>

          {/* Quick Persona Switcher */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Layers size={18} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Switch Role Persona (FR-1.18)</h3>
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

          {/* API Health Diagnostic */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Server size={18} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Django REST API Health</h3>
            </div>
            {apiHealth ? (
              <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{apiHealth.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Service:</span>
                  <span style={{ color: '#cbd5e1' }}>{apiHealth.service}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Endpoint:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--cyan-primary)' }}>http://localhost:8000/api/health</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                Checking backend health...
              </div>
            )}
          </div>

        </div>

        {/* Right Column: RBAC Permission Matrix & Admin Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Admin User Role Management Panel (Admin Only) */}
          {currentUser.role === 'admin' && (
            <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Server size={20} color="var(--cyan-primary)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Admin RBAC User Governance</h3>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  ADMIN ACCESS GRANTED
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                As Security Administrator, you can modify any user's role and immediately update system access control policies.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User & Organization</th>
                      <th>Email</th>
                      <th>Role Assignment</th>
                      <th style={{ textAlign: 'right' }}>Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => {
                      const activeRoleSelection = editingRoles[u.id] || u.role;
                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{u.organization}</div>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {u.email}
                          </td>
                          <td>
                            <select
                              value={activeRoleSelection}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              className="input-field"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: '130px' }}
                            >
                              <option value="customer">customer</option>
                              <option value="developer">developer</option>
                              <option value="assessor">assessor</option>
                              <option value="manager">manager</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleSaveRole(u)}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.725rem', padding: '0.3rem 0.65rem' }}
                            >
                              <Check size={12} />
                              <span>Update</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Full Stakeholder Capabilities Matrix */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Complete Role-Based Access Matrix</h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Comparison of functional capabilities across all 5 stakeholder roles under Module 1.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Platform Capability</th>
                    <th style={{ textAlign: 'center' }}>Customer</th>
                    <th style={{ textAlign: 'center' }}>Developer</th>
                    <th style={{ textAlign: 'center' }}>Assessor</th>
                    <th style={{ textAlign: 'center' }}>Manager</th>
                    <th style={{ textAlign: 'center' }}>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {rbacCapabilities.map((cap, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '0.8rem', fontWeight: 500, color: '#f1f5f9' }}>
                        {cap.title}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {cap.customer ? <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#64748b" style={{ margin: '0 auto' }} />}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {cap.dev ? <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#64748b" style={{ margin: '0 auto' }} />}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {cap.assessor ? <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#64748b" style={{ margin: '0 auto' }} />}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {cap.manager ? <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#64748b" style={{ margin: '0 auto' }} />}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {cap.admin ? <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#64748b" style={{ margin: '0 auto' }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {activeToken}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
              <span>Header: HMAC-SHA256</span>
              <span>•</span>
              <span>Payload: Role={currentUser.role}, Identity={currentUser.name}</span>
              <span>•</span>
              <span>Expiry: 60m</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
