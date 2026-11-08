# CyberShield - Web Application Security Assessment & Risk Management Platform
**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Group No**: Group 02 | **Submission Date**: 05-10-2026  
**Active Project Scope**: Full Module 1 Implementation (Website Submission, Basic Security Report & User Management)

## Group Members & Project Roles
| Student ID | Member Name | Role & Architecture Contribution |
| :--- | :--- | :--- |
| **232-35-332** | **MD. ABU NAYEM** | Security Architecture & Backend Lead (Django REST API, JWT RBAC, Safe Scanner Engine) |
| **232-35-457** | **OVIJEET SAHA** | Frontend Engineering & UI Lead (React UI, Score Gauge, Collapsible Cards, Persona Switcher) |
| **232-35-422** | **ATIYA KHANM LUCKY** | Database, QA & Reporting Lead (Relational Models, Constraints, DB Migrations, Test Fixtures) |

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

#### MD. ABU NAYEM (232-35-332) — Security Architecture & Backend Lead
- **FR-1.1: User Login** - Authenticate users securely via bcrypt/PBKDF2 and issue HMAC-SHA256 signed JWT tokens with 60-minute expiry and embedded role claims.
- **FR-1.2: Role-Based Access Control** - Intercept protected routes via middleware, validate Bearer tokens, and enforce permissions for 5 system roles (*Customer, Assessor, Developer, Manager, Admin*).
- **FR-1.3: Target URL Validation** - Validate submitted URL syntax (RFC 3986), resolve DNS, and block private or loopback IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `::1`) with `HTTP 403 Forbidden` to prevent SSRF attacks.
- **FR-1.4: Automated Security Checks** - Execute safe concurrent checks for TLS 1.2/1.3 validity, port 80 to HTTPS redirect, 6 security headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), cookie flags (`Secure`, `HttpOnly`, `SameSite`), and server banner leaks.
- **FR-1.5: Security Scoring & Grading** - Calculate an overall security score (0–100) using weighted severity deductions (*Critical: -25, High: -15, Medium: -8, Low: -3*) and map to letter grades (*A+, A, B, C, D, F*).
- **FR-1.6: Remediation Snippet Generation** - Generate tailored configuration fix snippets for **Nginx**, **Apache**, and **Django** based on failed checks.
- **FR-1.7: Scan & Audit Data Persistence** - Store scan metadata, vulnerability findings JSON, and system audit events securely in the database.

#### OVIJEET SAHA (232-35-457) — Frontend Engineering & UI Lead
- **FR-1.8: URL Submission Interface** - Provide a target URL submission form with real-time format validation, automatic HTTPS prefixing, and interactive loading states.
- **FR-1.9: Security Score Gauge Display** - Render a circular score gauge (0–100) with dynamic severity color coding and letter grade badges.
- **FR-1.10: Vulnerability Findings Cards** - Render collapsible finding cards categorized by severity with tabbed, copyable remediation snippets (*Nginx, Apache, Django*).
- **FR-1.11: Full Assessment Request CTA** - Provide a one-click CTA converting basic scan results into a full security assessment request.
- **FR-1.12: User Profile & History Management** - Provide user account management and historical scan views with re-scan capabilities and detailed report links.
- **FR-1.13: Responsive Layout & Role Switcher** - Deliver a responsive layout with a top-level persona switcher bar for live RBAC demonstration.

#### ATIYA KHANM LUCKY (232-35-422) — Database, QA & Reporting Lead
- **FR-1.14: Relational Database Schema Design** - Design a 3NF normalized relational schema for organizations, users, roles, websites, scans, and findings with UUID primary keys.
- **FR-1.15: Database Integrity Constraints** - Enforce data integrity through domain CHECK constraints (`score BETWEEN 0 AND 100`, `letter_grade`), UNIQUE keys (`email`, `target_url`), and cascading foreign key rules.
- **FR-1.16: Database Migrations & Indexing** - Apply automated database migrations and performance indexes (`idx_scans_user_time`, `idx_scans_status`) to optimize query speeds.
- **FR-1.17: Data Validation Layer** - Validate URL length, active user and organization relationships, and scan report JSON schema integrity before commit.
- **FR-1.18: Automated Test Suites & Fixtures** - Construct target test fixtures and execute automated test suites validating scoring formulas and constraint enforcement.

---

## 6. Non-Functional Requirements
1. **Security**: Secure password hashing (bcrypt/PBKDF2), authorization checks, RBAC, access-controlled endpoints, and tamper-evident audit logging.
2. **Safety & Ethics**: Automated scans are strictly passive and non-destructive; private/internal IP ranges are blocked by default.
3. **Performance**: Concurrent asynchronous HTTP check probes returning complete reports in under 3 seconds.
4. **Reliability**: Robust error handling, DNS validation, schema enforcement, and zero data corruption.
5. **Maintainability**: Modular architecture, clear REST API contracts, clean TypeScript types, and Git version control.
