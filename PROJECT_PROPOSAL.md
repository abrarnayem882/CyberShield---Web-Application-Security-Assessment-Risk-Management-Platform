# CyberShield - Web Application Security Assessment & Risk Management Platform
**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Group No**: Group 02 | **Submission Date**: 05-10-2026  
**Active Project Scope**: Full Module 1 Implementation (Website Submission, Basic Security Report & User Management)

## Group Members & Project Roles
| Student ID | Member Name | Role & Engineering Contribution |
| :--- | :--- | :--- |
| **232-35-332** | **MD. ABU NAYEM** | Security Architecture & Access Control (Authentication, URL Validation, TLS & Redirect Audits) |
| **232-35-457** | **OVIJEET SAHA** | Web Configuration Auditing & Remediation (Header Analysis, Cookie Audits, Scoring & Fix Snippets) |
| **232-35-422** | **ATIYA KHANM LUCKY** | Engagement Conversion, History & Audit (Assessment Requests, Scan History, Audit Trails, RBAC Switching) |

---

## 1. Project Overview
CyberShield is a web-based security assessment and risk management platform that provides organizations with an initial automated security check and a structured process for web application security analysis. Authorized users can submit a website URL and receive a Basic Security Report covering HTTPS transport encryption, SSL/TLS certificate chain verification, 6 core security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), cookie security attributes, and server technology exposure, along with a deterministic security score (0–100), letter grade badge (A+ to F), findings, severity levels, and tailored remediation snippets for Nginx, Apache, and Django.

## 2. Project Stakeholders
- **Customer / Organization**: Submits website URLs for automated security auditing and reviews the Basic Security Report.
- **Security Administrator**: Governs role-based access control, configures security check thresholds, and inspects tamper-evident audit logs.
- **Security Assessor / Analyst**: Analyzes header configurations, verifies cryptographic standards, and monitors audit records.
- **Remediation Developer**: Reviews detected misconfigurations and applies tailored server configuration patches for Nginx, Apache, and Django.
- **Security Manager**: Reviews organization-wide security scores, letter grades, and posture trends across digital assets.

## 3. Business Need
Organizations frequently lack immediate visibility into common web security vulnerabilities and configuration weaknesses. CyberShield provides a safe, passive, non-destructive automated security check that rapidly surfaces misconfigurations, missing transport encryptions, and information leaks without impacting server availability. All checks align with OWASP Top 10:2021 and NIST CSF 2.0 security principles.

## 4. Technology Stack
- **Language**: Python 3, TypeScript / JavaScript
- **Backend Framework**: Django REST Framework (DRF) 3.18
- **Frontend Framework**: React 19 / Vite
- **Styling**: Vanilla CSS & Modern Dark-Mode Palette
- **Database & ORM**: PostgreSQL / Django ORM (SQLite in local dev)
- **API & Authentication**: RESTful API with HMAC-SHA256 Signed JWT Tokens
- **Iconography**: Lucide React Vector Icons (Zero Emojis, Zero AI Pictures)
- **Version Control**: Git & GitHub

---

## 5. Functional Requirements Specification

### Module 1: Website Submission, Basic Security Report & User Management

#### MD. ABU NAYEM (232-35-332) — Security Architecture & Access Control
- **FR-1.1: User Login** - Users can securely log into their accounts using their credentials and receive role-authorized sessions.
- **FR-1.2: Role-Based Access Control** - Users can access features, scan actions, and data restricted according to their assigned role (*Customer, Assessor, Developer, Manager, Admin*).
- **FR-1.3: Target Website Submission** - Users can submit any website URL for automated security auditing with immediate syntax validation.
- **FR-1.4: Prohibited Target & SSRF Protection** - Users receive immediate rejections if attempting to scan private, internal, or loopback network addresses (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `::1`).
- **FR-1.5: SSL/TLS Certificate Inspection** - Users can view certificate chain validity, issuer details, protocol version (TLS 1.2/1.3), cipher strength, and expiration date.
- **FR-1.6: HTTPS Redirection Verification** - Users can verify whether unencrypted HTTP traffic (port 80) automatically redirects to secure HTTPS via permanent 301/308 redirects.

#### OVIJEET SAHA (232-35-457) — Web Configuration Auditing & Remediation
- **FR-1.7: Security Headers Analysis** - Users can inspect whether the target website enforces core security headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- **FR-1.8: Cookie Security Verification** - Users can examine whether session cookies implement `Secure`, `HttpOnly`, and `SameSite` protection flags.
- **FR-1.9: Information Exposure Detection** - Users can detect exposed server technology banners (`Server`) and framework version leaks (`X-Powered-By`) in HTTP response headers.
- **FR-1.10: Security Scoring & Grading** - Users receive an overall numeric score (0–100) and letter grade (*A+, A, B, C, D, F*) based on severity-weighted vulnerability deductions.
- **FR-1.11: Severity-Categorized Findings View** - Users can filter and review detected security issues categorized by Critical, High, Medium, Low, and Informational severity levels.
- **FR-1.12: Tailored Remediation Snippets** - Users can view and copy ready-to-deploy configuration fix snippets tailored for **Nginx**, **Apache**, and **Django** to remediate failed checks.

#### ATIYA KHANM LUCKY (232-35-422) — Engagement Conversion, History & Audit Operations
- **FR-1.13: Full Assessment Request** - Customers can submit a formal full security assessment request directly from their scan results with target scope and compliance standards.
- **FR-1.14: Scan History Tracking** - Users can browse a comprehensive historical log of all previous website scans, including scores, letter grades, timestamps, and status summaries.
- **FR-1.15: Target Re-Scanning** - Users can trigger a one-click re-scan of any previously analyzed website to verify remediation progress and score improvements.
- **FR-1.16: User Profile & Session Inspection** - Users can view their profile information, organization association, active session validity, and assigned permissions.
- **FR-1.17: Security Audit Log Review** - Authorized managers and administrators can search, filter, and inspect tamper-evident audit logs of all scan operations and system events.
- **FR-1.18: Stakeholder Role Switching** - Users can switch between system stakeholder personas (*Customer, Assessor, Developer, Manager, Admin*) to experience role-specific platform capabilities and views.

---

## 6. Non-Functional Requirements
1. **Security**: Secure password hashing (bcrypt/PBKDF2), authorization checks, RBAC, access-controlled endpoints, and tamper-evident audit logging.
2. **Safety & Ethics**: Automated scans are strictly passive and non-destructive; private/internal IP ranges are blocked by default.
3. **Performance**: Concurrent asynchronous HTTP check probes returning complete reports in under 3 seconds.
4. **Reliability**: Robust error handling, DNS validation, schema enforcement, and zero data corruption.
5. **Maintainability**: Modular architecture, clear REST API contracts, clean TypeScript types, and Git version control.
