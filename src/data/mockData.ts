/**
 * CyberShield - Data Presets & Initial State (Module 1 Scope)
 * SE331 - Group 02 | Fall 2026
 */

import { 
  UserProfile, 
  BasicScanResult, 
  AssessmentRequest, 
  AuditLog 
} from '../types';

export const SYSTEM_USERS: UserProfile[] = [
  {
    id: 'user-nayem',
    name: 'MD. Abu Nayem',
    email: 'nayem.se@cybershield.internal',
    role: 'admin',
    organization: 'CyberShield Security Architecture',
    studentId: '232-35-332'
  },
  {
    id: 'user-ovijeet',
    name: 'Ovijeet Saha',
    email: 'ovijeet.sec@cybershield.internal',
    role: 'assessor',
    organization: 'CyberShield Security Operations',
    studentId: '232-35-457'
  },
  {
    id: 'user-lucky',
    name: 'Atiya Khanm Lucky',
    email: 'lucky.dev@cybershield.internal',
    role: 'manager',
    organization: 'CyberShield QA & Data Engineering',
    studentId: '232-35-422'
  },
  {
    id: 'user-customer',
    name: 'Sarah Jenkins',
    email: 'sarah.j@globalmart-retail.com',
    role: 'customer',
    organization: 'GlobalMart Retail Ltd'
  },
  {
    id: 'user-developer',
    name: 'Alex Rivera',
    email: 'alex.dev@globalmart-retail.com',
    role: 'developer',
    organization: 'GlobalMart Retail Ltd'
  }
];

export const PRESET_SCANS: Record<string, BasicScanResult> = {
  'https://apexbank-secure.io': {
    id: 'scan-apex-bank',
    url: 'https://apexbank-secure.io',
    hostname: 'apexbank-secure.io',
    scanTimestamp: '2026-11-08T09:30:00Z',
    score: 95,
    grade: 'A+',
    gradeLabel: 'Hardened Security Posture',
    sslInfo: {
      issuer: "Let's Encrypt Authority E6",
      subject: 'apexbank-secure.io',
      expires: '2027-01-15',
      cipher: 'TLS_AES_256_GCM_SHA384',
      tls_version: 'TLSv1.3'
    },
    severityCounts: {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 1,
      Informational: 6
    },
    checks: [
      {
        id: 'ssl_tls',
        title: 'SSL/TLS Certificate & Modern Cipher',
        status: 'PASS',
        severity: 'Informational',
        details: 'Valid TLSv1.3 certificate with AES-256-GCM cipher suite and active OCSP stapling.',
        recommendation: 'Maintain automatic certificate renewal cycle.',
        category: 'Transport Security'
      },
      {
        id: 'hsts',
        title: 'HTTP Strict Transport Security (HSTS)',
        status: 'PASS',
        severity: 'Informational',
        details: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.',
        recommendation: 'HSTS is fully configured and compliant with modern browser preload lists.',
        category: 'HTTP Headers'
      },
      {
        id: 'csp',
        title: 'Content Security Policy (CSP)',
        status: 'PASS',
        severity: 'Informational',
        details: "Robust CSP active: default-src 'self'; script-src 'self' 'nonce-...'; object-src 'none'.",
        recommendation: 'Regularly audit script hashes and third-party origins.',
        category: 'HTTP Headers'
      },
      {
        id: 'xfo',
        title: 'Clickjacking Protection (X-Frame-Options)',
        status: 'PASS',
        severity: 'Informational',
        details: 'X-Frame-Options: DENY enforced globally.',
        recommendation: 'Maintains strict protection against UI redress and framing attacks.',
        category: 'HTTP Headers'
      },
      {
        id: 'xcto',
        title: 'MIME Type Sniffing Prevention',
        status: 'PASS',
        severity: 'Informational',
        details: 'X-Content-Type-Options: nosniff present on all endpoints.',
        recommendation: 'Maintains browser MIME sniffing mitigation.',
        category: 'HTTP Headers'
      },
      {
        id: 'referrer_policy',
        title: 'Referrer-Policy Header',
        status: 'PASS',
        severity: 'Informational',
        details: 'Referrer-Policy: strict-origin-when-cross-origin is active.',
        recommendation: 'Prevents referrer path leakage to external origins.',
        category: 'HTTP Headers'
      },
      {
        id: 'permissions_policy',
        title: 'Browser Permissions-Policy',
        status: 'WARN',
        severity: 'Low',
        details: 'Permissions-Policy is partially declared; camera and microphone are locked.',
        recommendation: 'Add explicit restrictions for geolocation and payment APIs.',
        category: 'HTTP Headers',
        remediationSnippet: {
          nginx: 'add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()" always;',
          apache: 'Header always set Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()"',
          django: '# In response middleware:\nresponse["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"'
        }
      }
    ],
    findings: []
  },

  'https://globalmart-retail.com': {
    id: 'scan-globalmart',
    url: 'https://globalmart-retail.com',
    hostname: 'globalmart-retail.com',
    scanTimestamp: '2026-11-08T09:15:00Z',
    score: 62,
    grade: 'C',
    gradeLabel: 'Moderate Exposure Risk',
    sslInfo: {
      issuer: "GTS CA 1C3 (Google Trust Services)",
      subject: 'globalmart-retail.com',
      expires: '2026-12-10',
      cipher: 'ECDHE-RSA-AES128-GCM-SHA256',
      tls_version: 'TLSv1.2'
    },
    severityCounts: {
      Critical: 0,
      High: 2,
      Medium: 2,
      Low: 1,
      Informational: 2
    },
    checks: [
      {
        id: 'ssl_tls',
        title: 'SSL/TLS Certificate Validity',
        status: 'PASS',
        severity: 'Informational',
        details: 'Valid certificate issued by Google Trust Services. TLS 1.2 in use.',
        recommendation: 'Enable TLS 1.3 protocol support for improved cipher security.',
        category: 'Transport Security'
      },
      {
        id: 'hsts',
        title: 'HTTP Strict Transport Security (HSTS)',
        status: 'WARN',
        severity: 'Medium',
        details: 'HSTS max-age is set to 86400 (1 day), which is below the recommended 1 year (31536000).',
        recommendation: 'Set max-age=31536000 and enable includeSubDomains.',
        category: 'HTTP Headers',
        remediationSnippet: {
          nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
          apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"',
          django: 'SECURE_HSTS_SECONDS = 31536000\nSECURE_HSTS_INCLUDE_SUBDOMAINS = True'
        }
      },
      {
        id: 'csp',
        title: 'Content Security Policy (CSP)',
        status: 'FAIL',
        severity: 'High',
        details: 'Content-Security-Policy header is missing on HTTP responses.',
        recommendation: "Implement CSP restricting script execution to authorized domains.",
        category: 'HTTP Headers',
        remediationSnippet: {
          nginx: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';\" always;",
          apache: "Header always set Content-Security-Policy \"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';\"",
          django: "# In settings.py (using django-csp):\nCSP_DEFAULT_SRC = (\"'self'\",)\nCSP_SCRIPT_SRC = (\"'self'\",)"
        }
      },
      {
        id: 'xfo',
        title: 'Clickjacking Protection (X-Frame-Options)',
        status: 'PASS',
        severity: 'Informational',
        details: "X-Frame-Options set to 'SAMEORIGIN'.",
        recommendation: 'Prevents external third-party sites from framing web pages.',
        category: 'HTTP Headers'
      },
      {
        id: 'xcto',
        title: 'MIME Sniffing (X-Content-Type-Options)',
        status: 'FAIL',
        severity: 'Low',
        details: "Missing 'X-Content-Type-Options: nosniff' header.",
        recommendation: "Declare 'X-Content-Type-Options: nosniff'.",
        category: 'HTTP Headers',
        remediationSnippet: {
          nginx: 'add_header X-Content-Type-Options "nosniff" always;',
          apache: 'Header always set X-Content-Type-Options "nosniff"',
          django: 'SECURE_CONTENT_TYPE_NOSNIFF = True'
        }
      },
      {
        id: 'info_exposure',
        title: 'Server Banner & Technology Leak',
        status: 'FAIL',
        severity: 'High',
        details: 'Server header exposes: "Apache/2.4.41 (Ubuntu)".',
        recommendation: 'Suppress server tokens in Apache configuration.',
        category: 'Information Disclosure',
        remediationSnippet: {
          nginx: 'server_tokens off;',
          apache: 'ServerTokens Prod\nServerSignature Off',
          django: '# Strip headers at reverse proxy level.'
        }
      }
    ],
    findings: [
      {
        id: 'FIND-CSP-01',
        title: 'Missing Content Security Policy (CSP)',
        severity: 'High',
        category: 'A03:2021 - Injection',
        impact: 'Increases susceptibility to Cross-Site Scripting (XSS) and client-side data exfiltration.',
        remediation: 'Configure a restrictive Content Security Policy.'
      },
      {
        id: 'FIND-INFO-01',
        title: 'Server Version Signature Leakage',
        severity: 'High',
        category: 'A05:2021 - Security Misconfiguration',
        impact: 'Exposes exact Apache version and OS release to malicious vulnerability scanners.',
        remediation: 'Disable ServerTokens and ServerSignature in web server settings.'
      }
    ]
  },

  'https://vulnerable-demo-app.lab': {
    id: 'scan-vulnerable-lab',
    url: 'https://vulnerable-demo-app.lab',
    hostname: 'vulnerable-demo-app.lab',
    scanTimestamp: '2026-11-08T09:00:00Z',
    score: 23,
    grade: 'F',
    gradeLabel: 'Critical Security Deficiencies',
    sslInfo: {
      issuer: 'Untrusted / Self-Signed Authority',
      subject: 'vulnerable-demo-app.lab',
      expires: 'Expired (2024-03-01)',
      cipher: 'RC4-MD5 (Insecure Legacy)',
      tls_version: 'TLSv1.0'
    },
    severityCounts: {
      Critical: 2,
      High: 2,
      Medium: 2,
      Low: 0,
      Informational: 0
    },
    checks: [
      {
        id: 'ssl_tls',
        title: 'SSL/TLS Certificate Validity',
        status: 'FAIL',
        severity: 'Critical',
        details: 'Certificate expired and uses obsolete RC4-MD5 cipher with deprecated TLS 1.0 protocol.',
        recommendation: 'Replace with a valid CA-signed certificate and disable TLS 1.0/1.1.',
        category: 'Transport Security',
        remediationSnippet: {
          nginx: 'ssl_protocols TLSv1.2 TLSv1.3;\nssl_ciphers HIGH:!aNULL:!MD5;',
          apache: 'SSLProtocol -all +TLSv1.2 +TLSv1.3\nSSLCipherSuite HIGH:!aNULL:!MD5',
          django: 'SECURE_SSL_REDIRECT = True'
        }
      },
      {
        id: 'hsts',
        title: 'HTTP Strict Transport Security (HSTS)',
        status: 'FAIL',
        severity: 'High',
        details: 'Strict-Transport-Security header is completely absent.',
        recommendation: 'Configure HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains.',
        category: 'HTTP Headers',
        remediationSnippet: {
          nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
          apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"',
          django: 'SECURE_HSTS_SECONDS = 31536000\nSECURE_HSTS_INCLUDE_SUBDOMAINS = True'
        }
      },
      {
        id: 'csp',
        title: 'Content Security Policy (CSP)',
        status: 'FAIL',
        severity: 'High',
        details: 'No Content Security Policy detected.',
        recommendation: 'Enforce default-src restrictive policy.',
        category: 'HTTP Headers',
        remediationSnippet: {
          nginx: "add_header Content-Security-Policy \"default-src 'self';\" always;",
          apache: "Header always set Content-Security-Policy \"default-src 'self';\"",
          django: "CSP_DEFAULT_SRC = (\"'self'\",)"
        }
      },
      {
        id: 'xfo',
        title: 'Clickjacking Protection (X-Frame-Options)',
        status: 'FAIL',
        severity: 'Medium',
        details: 'X-Frame-Options is missing. Site can be framed inside external websites.',
        recommendation: 'Add X-Frame-Options: SAMEORIGIN.',
        category: 'HTTP Headers',
        remediationSnippet: {
          nginx: 'add_header X-Frame-Options "SAMEORIGIN" always;',
          apache: 'Header always set X-Frame-Options "SAMEORIGIN"',
          django: 'X_FRAME_OPTIONS = "SAMEORIGIN"'
        }
      },
      {
        id: 'info_exposure',
        title: 'Server Banner & Technology Leak',
        status: 'FAIL',
        severity: 'Medium',
        details: 'Exposes: Server: nginx/1.14.0 and X-Powered-By: PHP/7.2.24.',
        recommendation: 'Suppress server tokens and remove X-Powered-By header.',
        category: 'Information Disclosure',
        remediationSnippet: {
          nginx: 'server_tokens off;\nproxy_hide_header X-Powered-By;',
          apache: 'ServerTokens Prod\nHeader unset X-Powered-By',
          django: '# Configure reverse proxy headers.'
        }
      }
    ],
    findings: [
      {
        id: 'FIND-SSL-01',
        title: 'Expired and Deprecated SSL/TLS Configuration',
        severity: 'Critical',
        category: 'A02:2021 - Cryptographic Failures',
        impact: 'Allows man-in-the-middle attackers to decrypt traffic in transit.',
        remediation: 'Renew TLS certificate and enforce modern cipher suites.'
      },
      {
        id: 'FIND-CSP-01',
        title: 'Missing Content Security Policy (CSP)',
        severity: 'High',
        category: 'A03:2021 - Injection',
        impact: 'Application is unprotected from cross-site script injections.',
        remediation: 'Define a strict Content Security Policy.'
      }
    ]
  }
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-1001',
    timestamp: '2026-11-08 09:30:14',
    user: 'MD. Abu Nayem',
    role: 'admin',
    action: 'BASIC_SCAN_EXECUTED',
    target: 'https://apexbank-secure.io',
    details: 'Automated security scan completed. Overall score: 95 (Grade A+). Safe checks verified.',
    ipAddress: '192.168.10.45'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-11-08 09:15:32',
    user: 'Sarah Jenkins',
    role: 'customer',
    action: 'BASIC_SCAN_EXECUTED',
    target: 'https://globalmart-retail.com',
    details: 'Automated security scan completed. Overall score: 62 (Grade C). 2 High severity misconfigurations flagged.',
    ipAddress: '198.51.100.12'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-11-08 09:05:10',
    user: 'Sarah Jenkins',
    role: 'customer',
    action: 'FULL_ASSESSMENT_REQUESTED',
    target: 'https://globalmart-retail.com',
    details: 'Inbound assessment request submitted for OWASP Top 10 & NIST CSF scope.',
    ipAddress: '198.51.100.12'
  },
  {
    id: 'LOG-1004',
    timestamp: '2026-11-08 09:00:08',
    user: 'Ovijeet Saha',
    role: 'assessor',
    action: 'BASIC_SCAN_EXECUTED',
    target: 'https://vulnerable-demo-app.lab',
    details: 'Automated scan executed against lab testbed. Score: 23 (Grade F). Cryptographic failures logged.',
    ipAddress: '192.168.10.60'
  }
];

export const INITIAL_REQUESTS: AssessmentRequest[] = [
  {
    id: 'REQ-01',
    organization: 'GlobalMart Retail Ltd',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sarah.j@globalmart-retail.com',
    targetUrl: 'https://globalmart-retail.com',
    scopeNotes: 'Web storefront, payment gateway integration, and customer portal.',
    complianceTarget: 'OWASP Top 10:2021 & NIST CSF 2.0',
    priority: 'Urgent',
    status: 'Pending Review',
    submittedAt: '2026-11-08T09:05:00Z'
  }
];
