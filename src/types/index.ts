/**
 * CyberShield - TypeScript Type Definitions
 * Module 1: Website Submission, Basic Security Report & User Management
 * SE331 - Group 02 | Fall 2026
 */

export type UserRole = 
  | 'customer'     // Customer / Organization
  | 'assessor'     // Security Assessor / Analyst
  | 'developer'    // Developer / Remediation Team
  | 'manager'      // Security Manager / Management
  | 'admin';       // Security Administrator

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  studentId?: string;
  token?: string;
}

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type CheckStatus = 'PASS' | 'WARN' | 'FAIL';

export interface SecurityCheck {
  id: string;
  title: string;
  status: CheckStatus;
  severity: SeverityLevel;
  details: string;
  recommendation: string;
  category: string;
  remediationSnippet?: {
    nginx?: string;
    apache?: string;
    django?: string;
    express?: string;
  };
}

export interface BasicScanResult {
  id: string;
  url: string;
  hostname: string;
  scanTimestamp: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  gradeLabel: string;
  sslInfo?: {
    issuer: string;
    subject: string;
    expires: string;
    cipher: string;
    tls_version: string;
  };
  checks: SecurityCheck[];
  findings: {
    id: string;
    title: string;
    severity: SeverityLevel;
    category: string;
    impact: string;
    remediation: string;
  }[];
  severityCounts: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    Informational: number;
  };
  responseStatus?: number;
}

export interface AssessmentRequest {
  id: string;
  organization: string;
  contactName: string;
  contactEmail: string;
  targetUrl: string;
  scopeNotes: string;
  complianceTarget: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Pending Review' | 'Approved & Scheduled' | 'In Progress' | 'Completed';
  submittedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
}
