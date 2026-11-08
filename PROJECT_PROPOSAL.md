# CyberShield - Web Application Security Assessment & Risk Management Platform
**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Group No**: Group 02 | **Submission Date**: 05-10-2026  
**Active Project Scope**: Full Module 1 Implementation (Website Submission, Basic Security Report & User Management)

## Group Members & Project Roles
| Student ID | Member Name | Role & Functional Responsibility |
| :--- | :--- | :--- |
| **232-35-332** | **MD. ABU NAYEM** | User Access, URL Submission & Transport Encryption Verification |
| **232-35-457** | **OVIJEET SAHA** | Security Headers Audit, Vulnerability Scoring & Remediation Guides |
| **232-35-422** | **ATIYA KHANM LUCKY** | Assessment Conversion, Scan History, Audit Trails & Persona Switching |

---

## 1. Project Overview
CyberShield is a web-based security assessment and risk management platform designed to help organizations easily evaluate and improve their website security posture. Users can submit any website address and immediately receive a clear, actionable Basic Security Report. The report evaluates HTTPS encryption, SSL certificate health, core web security headers, cookie safety attributes, and information exposure risks. It calculates an intuitive security score (0–100) and letter grade (A+ to F), lists identified vulnerabilities with severity levels, and provides copy-ready configuration fix instructions. Organizations can also track past scans, re-test websites after applying fixes, request in-depth assessments, and monitor platform activity logs.

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

#### MD. ABU NAYEM (232-35-332)
- **FR-1.1: User Login** - Users can securely log into their accounts using their credentials to access their security workspace.
- **FR-1.2: Role-Based Access Control** - Users access only the specific features, reports, and actions permitted for their assigned role (*Customer, Assessor, Developer, Manager, Admin*).
- **FR-1.3: Website URL Submission** - Users can enter and submit any website address to start an automated security check with real-time format validation.
- **FR-1.4: Internal Network Protection** - Users receive an immediate warning and scan blockage if attempting to submit private, internal, or restricted network addresses.
- **FR-1.5: SSL Certificate Inspection** - Users can inspect their website's SSL/TLS certificate validity, certificate authority issuer, encryption strength, and expiration date.
- **FR-1.6: HTTPS Redirection Check** - Users can verify whether unencrypted website traffic automatically redirects visitors to a secure, encrypted HTTPS connection.

#### OVIJEET SAHA (232-35-457)
- **FR-1.7: Security Headers Audit** - Users can inspect whether essential website security headers (such as clickjacking and content protection) are properly configured.
- **FR-1.8: Cookie Security Check** - Users can verify whether website cookies have essential security flags enabled to prevent unauthorized interception and session theft.
- **FR-1.9: Information Leak Detection** - Users can identify exposed server technology versions and system banners that reveal internal infrastructure details.
- **FR-1.10: Security Score & Grade** - Users receive an overall security score from 0 to 100 and a letter grade (*A+, A, B, C, D, F*) summarizing their website's security health.
- **FR-1.11: Vulnerability Findings View** - Users can review and filter detected security vulnerabilities categorized by severity levels (Critical, High, Medium, Low).
- **FR-1.12: Remediation Fix Guide** - Users can view and copy ready-to-use configuration fix snippets for popular web servers to resolve detected security issues.

#### ATIYA KHANM LUCKY (232-35-422)
- **FR-1.13: Full Assessment Request** - Customers can submit an in-depth security assessment request directly from their scan results with custom scope and compliance goals.
- **FR-1.14: Scan History Log** - Users can view and search a history of all past website scans, including past scores, grades, dates, and previous results.
- **FR-1.15: One-Click Re-Scan** - Users can quickly re-scan any previously analyzed website with one click to verify if applied fixes improved their score.
- **FR-1.16: User Profile View** - Users can view their personal account details, organization info, active session status, and assigned permissions.
- **FR-1.17: Activity Audit Trail** - Administrators and managers can review a searchable log of all user activities, scan operations, and platform events.
- **FR-1.18: Role Persona Switcher** - Users can switch between different stakeholder roles to preview role-specific dashboards, features, and permissions.

---

## 6. Non-Functional Requirements
1. **Security**: Secure password hashing, authorization checks, role permissions, and tamper-evident activity logging.
2. **Safety**: Automated scans are strictly passive and non-destructive; private and internal networks are blocked by default.
3. **Performance**: Fast automated checks providing completed security reports within seconds.
4. **Reliability**: Graceful error handling, input validation, and continuous data consistency.
5. **Usability**: Clean, responsive web interface accessible across desktop and mobile browsers.
