import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  History, 
  UserCheck, 
  Info, 
  ChevronDown, 
  Layers,
  KeyRound
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { SYSTEM_USERS } from '../data/mockData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  onOpenTeamInfo: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onOpenTeamInfo,
  onOpenLoginModal
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const navItems = [
    { id: 'scanner', label: 'Security Scanner', icon: ShieldCheck, roleDesc: 'Module 1 Core' },
    { id: 'history', label: 'Scan History & Audit', icon: History, roleDesc: 'FR-1.7 & FR-1.12' },
    { id: 'profile', label: 'User Profile & RBAC', icon: UserCheck, roleDesc: 'FR-1.1 & FR-1.2' },
  ];

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'manager': return 'badge-critical';
      case 'assessor': return 'badge-high';
      case 'developer': return 'badge-medium';
      case 'admin': return 'badge-info';
      default: return 'badge-success';
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'manager': return 'Security Manager';
      case 'assessor': return 'Security Assessor';
      case 'developer': return 'Remediation Developer';
      case 'admin': return 'Security Admin';
      default: return 'Customer / Org';
    }
  };

  return (
    <header className="no-print" style={{ 
      borderBottom: '1px solid var(--border-subtle)', 
      background: 'rgba(9, 13, 22, 0.95)', 
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={() => setActiveTab('scanner')}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #06b6d4, #0284c7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Shield size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CyberShield
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Module 1 Platform</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              Website Submission, Basic Security Report & RBAC
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Module 1 Scope Only) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side: Academic credit button & Role Switcher (FR-1.13) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* SE331 Course Badge */}
          <button
            onClick={onOpenTeamInfo}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', gap: '0.4rem', border: '1px solid rgba(6, 182, 212, 0.3)' }}
            title="View SE331 Project Team & Architecture"
          >
            <Info size={14} color="#06b6d4" />
            <span>Group 02 | SE331</span>
          </button>

          {/* Role Login / Switcher Button (FR-1.1 & FR-1.2) */}
          <button
            onClick={onOpenLoginModal}
            className="btn btn-secondary btn-sm"
            style={{ 
              fontSize: '0.75rem', 
              gap: '0.45rem', 
              background: 'rgba(6, 182, 212, 0.1)', 
              borderColor: 'rgba(6, 182, 212, 0.35)',
              color: 'var(--cyan-primary)'
            }}
            title="Open Role-Based Login & Switch Persona"
          >
            <UserCheck size={14} color="var(--cyan-primary)" />
            <span>Switch Role</span>
          </button>

          {/* Interactive Role Badge Display */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid var(--border-subtle)',
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.825rem'
              }}
            >
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: currentUser.role === 'admin' ? '#06b6d4' : (currentUser.role === 'customer' ? '#10b981' : (currentUser.role === 'developer' ? '#f59e0b' : '#8b5cf6')) 
              }} />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {getRoleTitle(currentUser.role)}
                </div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {/* Dropdown menu */}
            {showRoleDropdown && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '270px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  padding: '0.5rem',
                  zIndex: 200,
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Persona (RBAC)
                  </span>
                  <span className={`badge ${getRoleBadgeClass(currentUser.role)}`} style={{ fontSize: '0.65rem' }}>
                    {currentUser.role}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.25rem 0 0.5rem 0' }} />

                {SYSTEM_USERS.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.15rem',
                      background: currentUser.id === user.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{user.name}</span>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ fontSize: '0.625rem' }}>
                        {user.role}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.organization}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0 0.25rem 0', paddingTop: '0.25rem' }}>
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onOpenLoginModal();
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
                  >
                    <KeyRound size={12} />
                    <span>Open Full RBAC Login Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
