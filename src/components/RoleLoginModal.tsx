import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Server, 
  Layout, 
  Database, 
  Code2, 
  Building,
  KeyRound,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { SYSTEM_USERS } from '../data/mockData';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile, token?: string) => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'personas' | 'credentials'>('personas');
  const [username, setUsername] = useState('nayem_lead');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleMeta: Record<UserRole, {
    title: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    badgeClass: string;
    responsibilities: string;
    keyFeatures: string[];
  }> = {
    customer: {
      title: 'Customer / Organization',
      icon: Building,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      badgeClass: 'badge-success',
      responsibilities: 'Submit company websites for automated security audits & request penetration test engagements.',
      keyFeatures: ['Submit Website Scans', 'View Grade & Score', 'Request Full Assessment CTA', 'View Own Scan History']
    },
    admin: {
      title: 'Security Administrator',
      icon: Server,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.12)',
      badgeClass: 'badge-info',
      responsibilities: 'Complete system governance, RBAC role management, tamper-evident audit logs & platform health.',
      keyFeatures: ['Unrestricted Scans', 'Manage All User Roles', 'Full Audit Trail Access', 'API Diagnostics & Health']
    },
    assessor: {
      title: 'Security Assessor / Analyst',
      icon: Layout,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.12)',
      badgeClass: 'badge-high',
      responsibilities: 'Analyze transport encryption, security headers, review inbound requests & sign off on audits.',
      keyFeatures: ['SSL & Cipher Analysis', 'Review Audit Trails', 'Inspect Inbound Inquiries', 'Compliance Sign-off']
    },
    manager: {
      title: 'Security Manager / Lead',
      icon: Database,
      color: '#f43f5e',
      bgColor: 'rgba(244, 63, 94, 0.12)',
      badgeClass: 'badge-critical',
      responsibilities: 'Oversee organizational risk posture, review assessments pipeline, and monitor governance logs.',
      keyFeatures: ['Asset Risk Governance', 'Inbound Request Pipeline', 'Audit Trail Monitoring', 'Executive Posture Metrics']
    },
    developer: {
      title: 'Remediation Developer',
      icon: Code2,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      badgeClass: 'badge-medium',
      responsibilities: 'Review misconfigurations, copy tailored server configuration fixes & verify fixes with 1-click re-scans.',
      keyFeatures: ['Developer Patch Hub', 'Nginx/Apache/Django Fixes', '1-Click Re-Scan Test', 'Restricted from Audit Logs']
    }
  };

  const handlePersonaLogin = async (user: UserProfile) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Connect to Django REST Framework backend
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: user.role, username: user.email })
      });

      if (response.ok) {
        const data = await response.json();
        const loggedInUser: UserProfile = {
          id: data.user.id || user.id,
          username: data.user.username || user.username,
          name: data.user.name || user.name,
          email: data.user.email || user.email,
          role: data.user.role as UserRole,
          organization: data.user.organization_name || user.organization,
          studentId: user.studentId,
          token: data.token
        };
        onLoginSuccess(loggedInUser, data.token);
        onClose();
      } else {
        // Fallback to local user
        onLoginSuccess(user);
        onClose();
      }
    } catch {
      // Offline fallback
      onLoginSuccess(user);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(),
          role: selectedRole,
          password: password 
        })
      });

      if (response.ok) {
        const data = await response.json();
        const matched = SYSTEM_USERS.find(u => u.role === (data.user.role || selectedRole));
        const loggedInUser: UserProfile = {
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role as UserRole,
          organization: data.user.organization_name || 'GlobalMart Retail Ltd',
          studentId: matched?.studentId,
          token: data.token
        };
        onLoginSuccess(loggedInUser, data.token);
        onClose();
      } else {
        const err = await response.json();
        setErrorMessage(err.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      // Fallback: match by selectedRole
      const fallback = SYSTEM_USERS.find(u => u.role === selectedRole) || SYSTEM_USERS[0];
      onLoginSuccess(fallback);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '780px', 
          padding: '2rem', 
          maxHeight: '92vh', 
          overflowY: 'auto' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}>
              <KeyRound size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Role-Based Access Control (RBAC) Login</h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                FR-1.1 User Login & FR-1.2 Role-Based Permissions Authentication
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('personas')}
            className="btn"
            style={{
              background: activeTab === 'personas' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              border: activeTab === 'personas' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
              color: activeTab === 'personas' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.825rem',
              fontWeight: 600
            }}
          >
            <UserCheck size={16} color={activeTab === 'personas' ? 'var(--cyan-primary)' : 'var(--text-muted)'} />
            <span>1-Click Stakeholder Persona Login</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className="btn"
            style={{
              background: activeTab === 'credentials' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              border: activeTab === 'credentials' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
              color: activeTab === 'credentials' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.825rem',
              fontWeight: 600
            }}
          >
            <Lock size={16} color={activeTab === 'credentials' ? 'var(--cyan-primary)' : 'var(--text-muted)'} />
            <span>Credentials / JWT Sign-in</span>
          </button>
        </div>

        {errorMessage && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#fca5a5', 
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Persona Login Cards */}
        {activeTab === 'personas' && (
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select a stakeholder role below to immediately authenticate and preview role-specific permissions, dashboards, and features:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {SYSTEM_USERS.map((user) => {
                const meta = roleMeta[user.role];
                const IconComponent = meta.icon;
                const isCurrent = currentUser.id === user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => handlePersonaLogin(user)}
                    style={{
                      padding: '1.15rem',
                      borderRadius: '12px',
                      background: isCurrent ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.75)',
                      border: isCurrent ? '1.5px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '10px', 
                        background: meta.bgColor, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent size={20} color={meta.color} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                            {user.name}
                          </span>
                          <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.675rem' }}>
                            {meta.title}
                          </span>
                          {user.studentId && (
                            <span className="font-mono badge badge-secondary" style={{ fontSize: '0.675rem' }}>
                              ID: {user.studentId}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan-primary)', fontSize: '0.65rem' }}>
                              ACTIVE SESSION
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {user.email} • {user.organization}
                        </div>

                        <p style={{ fontSize: '0.785rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.4 }}>
                          {meta.responsibilities}
                        </p>

                        {/* Features pill tags */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          {meta.keyFeatures.map((feat, idx) => (
                            <span 
                              key={idx} 
                              style={{ 
                                fontSize: '0.68rem', 
                                padding: '0.15rem 0.5rem', 
                                borderRadius: '4px', 
                                background: 'rgba(30, 41, 59, 0.8)', 
                                color: '#94a3b8',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                              }}
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={isLoading}
                      className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      style={{ flexShrink: 0, minWidth: '130px', justifyContent: 'center' }}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 size={14} color="var(--cyan-primary)" />
                          <span>Logged In</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Credentials Form */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Sign in with credentials. The platform will issue an HMAC-SHA256 signed JWT token with assigned role privileges.
            </p>

            {/* Quick Fill Helpers */}
            <div style={{ marginBottom: '1.25rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                QUICK-FILL TEST ACCOUNTS:
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {SYSTEM_USERS.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => {
                      setUsername(u.email);
                      setSelectedRole(u.role);
                    }}
                    style={{
                      background: username === u.email ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.8)',
                      border: username === u.email ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                      color: username === u.email ? '#ffffff' : '#94a3b8',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.725rem',
                      cursor: 'pointer'
                    }}
                  >
                    {u.name} ({u.role})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dim)' }}>
                  Username or Email Address:
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', width: '100%', fontSize: '0.85rem' }}
                    placeholder="e.g. nayem@cybershield.sec"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dim)' }}>
                  Password:
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', width: '100%', fontSize: '0.85rem' }}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dim)' }}>
                  Stakeholder Role Selection:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="customer">Customer / Organization (Sarah Jenkins)</option>
                  <option value="admin">Security Administrator (MD. Abu Nayem - 232-35-332)</option>
                  <option value="assessor">Security Assessor / Analyst (Ovijeet Saha - 232-35-457)</option>
                  <option value="manager">Security Manager (Atiya Khanm Lucky - 232-35-422)</option>
                  <option value="developer">Remediation Developer (Alex Rivera)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <UserCheck size={16} />
                  <span>{isLoading ? 'Authenticating...' : 'Sign In with JWT'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

