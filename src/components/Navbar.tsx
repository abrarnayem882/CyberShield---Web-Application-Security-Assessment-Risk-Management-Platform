import React, { useState } from 'react';
import {
  Shield, ShieldCheck, History, UserCheck, Info, ChevronDown,
  ClipboardList, Search, TrendingUp, KeyRound, FileText
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
  activeTab, setActiveTab, currentUser, setCurrentUser,
  onOpenTeamInfo, onOpenLoginModal
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const isCustomer = currentUser.role === 'customer';

  const module1Tabs = [
    { id: 'scanner',    label: 'Security Scanner',  icon: ShieldCheck },
    { id: 'history',    label: 'Scan History',       icon: History },
    { id: 'profile',    label: 'Profile & RBAC',     icon: UserCheck },
  ];

  // Module 2 tabs differ by role
  const module2TabsStaff = [
    { id: 'assessment', label: 'Assessment Setup',  icon: ClipboardList },
    { id: 'findings',   label: 'Findings Search',   icon: Search },
    { id: 'progress',   label: 'Progress Monitor',  icon: TrendingUp },
  ];
  const module2TabsCustomer = [
    { id: 'my-requests', label: 'My Requests',      icon: FileText },
    { id: 'progress',    label: 'My Progress',      icon: TrendingUp },
  ];
  const module2Tabs = isCustomer ? module2TabsCustomer : module2TabsStaff;

  const getRoleBadge = (role: UserRole) => {
    const map: Record<string, string> = {
      manager: 'badge-critical', assessor: 'badge-high',
      developer: 'badge-medium', admin: 'badge-info', customer: 'badge-success'
    };
    return map[role] || 'badge-success';
  };

  const getRoleTitle = (role: UserRole) => {
    const map: Record<string, string> = {
      manager: 'Security Manager', assessor: 'Security Assessor',
      developer: 'Remediation Developer', admin: 'Security Admin', customer: 'Customer / Org'
    };
    return map[role] || 'Customer / Org';
  };

  const dotColor = (role: UserRole) => {
    const map: Record<string, string> = {
      admin: '#06b6d4', customer: '#10b981', developer: '#f59e0b',
      assessor: '#8b5cf6', manager: '#ef4444'
    };
    return map[role] || '#6b7280';
  };

  const tabBtn = (isActive: boolean, isM2 = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.42rem 0.8rem', borderRadius: '8px', border: 'none',
    background: isActive
      ? (isM2 ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #06b6d4, #0284c7)')
      : 'transparent',
    color: isActive ? '#ffffff' : 'var(--text-muted)',
    fontWeight: isActive ? 600 : 500, fontSize: '0.8rem',
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
    boxShadow: isActive ? (isM2 ? '0 4px 12px rgba(124,58,237,0.3)' : '0 4px 12px rgba(6,182,212,0.3)') : 'none',
  });

  return (
    <header className="no-print" style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.97)',
      backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100
    }}>
      {/* Top Row */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => setActiveTab('scanner')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CyberShield</span>
              <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>Module 1 & 2</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 500 }}>SE331 | Group 02 | Fall 2026</p>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={onOpenTeamInfo} className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem', gap: '0.4rem', border: '1px solid rgba(6,182,212,0.3)' }}>
            <Info size={13} color="#06b6d4" /><span>Group 02 | SE331</span>
          </button>
          <button onClick={onOpenLoginModal} className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem', gap: '0.4rem', background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.35)', color: 'var(--cyan-primary)' }}>
            <UserCheck size={13} color="var(--cyan-primary)" /><span>Switch Role</span>
          </button>

          {/* Role Badge Dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowRoleDropdown(!showRoleDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(30,41,59,0.85)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.75rem', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor(currentUser.role) }} />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{getRoleTitle(currentUser.role)}</div>
              </div>
              <ChevronDown size={13} color="var(--text-muted)" />
            </button>

            {showRoleDropdown && (
              <div style={{ position: 'absolute', right: 0, top: '115%', width: '270px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.6)', padding: '0.5rem', zIndex: 200 }}>
                <div style={{ padding: '0.4rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Persona (RBAC)</span>
                  <span className={`badge ${getRoleBadge(currentUser.role)}`} style={{ fontSize: '0.62rem' }}>{currentUser.role}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.25rem 0 0.4rem' }} />
                {SYSTEM_USERS.map(user => (
                  <div key={user.id} onClick={() => { setCurrentUser(user); setShowRoleDropdown(false); setActiveTab('scanner'); }}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.1rem', background: currentUser.id === user.id ? 'rgba(6,182,212,0.15)' : 'transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{user.name}</span>
                      <span className={`badge ${getRoleBadge(user.role)}`} style={{ fontSize: '0.6rem' }}>{user.role}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{user.organization}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.4rem 0 0.2rem', paddingTop: '0.3rem' }}>
                  <button onClick={() => { setShowRoleDropdown(false); onOpenLoginModal(); }} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: '0.73rem' }}>
                    <KeyRound size={12} /><span>Open Full RBAC Login Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Tabs */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 1.5rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

        {/* Module 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(15,23,42,0.6)', padding: '0.22rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.6rem', color: '#06b6d4', fontWeight: 700, padding: '0 0.45rem', letterSpacing: '0.05em' }}>M1</span>
          {module1Tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={tabBtn(activeTab === id, false)}>
              <Icon size={14} /><span>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />

        {/* Module 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(15,23,42,0.6)', padding: '0.22rem', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.35)' }}>
          <span style={{ fontSize: '0.6rem', color: '#8b5cf6', fontWeight: 700, padding: '0 0.45rem', letterSpacing: '0.05em' }}>M2</span>
          {module2Tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={tabBtn(activeTab === id, true)}>
              <Icon size={14} /><span>{label}</span>
            </button>
          ))}
        </div>

        {/* Role indicator pill */}
        <div style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor(currentUser.role) }} />
          {isCustomer ? 'Customer View — Limited Module 2 Access' : `${getRoleTitle(currentUser.role)} — Full Access`}
        </div>
      </div>
    </header>
  );
};
