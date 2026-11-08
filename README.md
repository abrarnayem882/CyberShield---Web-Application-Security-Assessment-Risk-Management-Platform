

# CyberShield - Web Application Security Assessment & Risk Management Platform

**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Group No**: Group 02  
**Active Project Scope**: Full Module 1 Implementation (Website Submission, Basic Security Report & User Management)

---

## Group Members & Project Roles

| Student ID | Member Name | Role & Engineering Contribution |
| :--- | :--- | :--- |
| **232-35-332** | **MD. ABU NAYEM** | Security Architecture & Access Control (Authentication, URL Validation, TLS & Redirect Audits) |
| **232-35-457** | **OVIJEET SAHA** | Web Configuration Auditing & Remediation (Header Analysis, Cookie Audits, Scoring & Fix Snippets) |
| **232-35-422** | **ATIYA KHANM LUCKY** | Engagement Conversion, History & Audit (Assessment Requests, Scan History, Audit Trails, RBAC Switching) |

---

## Full Module 1 User-End Functional Requirements

All functional requirements describe direct user-end capabilities ("what users can do with the system") and are circulated evenly across the group members:

### 1. MD. ABU NAYEM (232-35-332) — Security Architecture & Access Control
- **FR-1.1: User Login** - Users can securely log into their accounts using their credentials and receive role-authorized sessions.
- **FR-1.2: Role-Based Access Control** - Users can access features, scan actions, and data restricted according to their assigned role (*Customer, Assessor, Developer, Manager, Admin*).
- **FR-1.3: Target Website Submission** - Users can submit any website URL for automated security auditing with immediate syntax validation.
- **FR-1.4: Prohibited Target & SSRF Protection** - Users receive immediate rejections if attempting to scan private, internal, or loopback network addresses (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `::1`).
- **FR-1.5: SSL/TLS Certificate Inspection** - Users can view certificate chain validity, issuer details, protocol version (TLS 1.2/1.3), cipher strength, and expiration date.
- **FR-1.6: HTTPS Redirection Verification** - Users can verify whether unencrypted HTTP traffic (port 80) automatically redirects to secure HTTPS via permanent 301/308 redirects.

### 2. OVIJEET SAHA (232-35-457) — Web Configuration Auditing & Remediation
- **FR-1.7: Security Headers Analysis** - Users can inspect whether the target website enforces core security headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- **FR-1.8: Cookie Security Verification** - Users can examine whether session cookies implement `Secure`, `HttpOnly`, and `SameSite` protection flags.
- **FR-1.9: Information Exposure Detection** - Users can detect exposed server technology banners (`Server`) and framework version leaks (`X-Powered-By`) in HTTP response headers.
- **FR-1.10: Security Scoring & Grading** - Users receive an overall numeric score (0–100) and letter grade (*A+, A, B, C, D, F*) based on severity-weighted vulnerability deductions.
- **FR-1.11: Severity-Categorized Findings View** - Users can filter and review detected security issues categorized by Critical, High, Medium, Low, and Informational severity levels.
- **FR-1.12: Tailored Remediation Snippets** - Users can view and copy ready-to-deploy configuration fix snippets tailored for **Nginx**, **Apache**, and **Django** to remediate failed checks.

### 3. ATIYA KHANM LUCKY (232-35-422) — Engagement Conversion, History & Audit Operations
- **FR-1.13: Full Assessment Request** - Customers can submit a formal full security assessment request directly from their scan results with target scope and compliance standards.
- **FR-1.14: Scan History Tracking** - Users can browse a comprehensive historical log of all previous website scans, including scores, letter grades, timestamps, and status summaries.
- **FR-1.15: Target Re-Scanning** - Users can trigger a one-click re-scan of any previously analyzed website to verify remediation progress and score improvements.
- **FR-1.16: User Profile & Session Inspection** - Users can view their profile information, organization association, active session validity, and assigned permissions.
- **FR-1.17: Security Audit Log Review** - Authorized managers and administrators can search, filter, and inspect tamper-evident audit logs of all scan operations and system events.
- **FR-1.18: Stakeholder Role Switching** - Users can switch between system stakeholder personas (*Customer, Assessor, Developer, Manager, Admin*) to experience role-specific platform capabilities and views.

---

## Technology Stack

- **Backend Framework**: Python 3 / Django REST Framework (DRF) 3.18
- **Frontend Framework**: React 19 / TypeScript / Vite
- **Iconography**: Lucide React (Clean vector SVG icons, zero emojis)
- **Authentication**: JWT (JSON Web Tokens) with HMAC-SHA256
- **Database & ORM**: Django ORM with SQLite (Development) / PostgreSQL (Production)
- **CORS Support**: `django-cors-headers`
- **Architecture Diagrams**: PlantUML (`plantuml_diagrams.puml`) & Interactive HTML Mermaid Diagrams (`activity_diagrams.html`)

---

## Running the Platform Locally

### 1. Backend Service (Django REST Framework)
```bash
# Initialize database migrations and seed benchmark data
python backend/seed_data.py

# Launch DRF API Server on port 8000
python backend/manage.py runserver 8000
```
- API Root: **http://localhost:8000/api/**
- Health Check: **GET http://localhost:8000/api/health**
- Security Scan Endpoint: **POST http://localhost:8000/api/scan**
- Scan History Endpoint: **GET http://localhost:8000/api/scans**
- Auth Endpoint: **POST http://localhost:8000/api/auth/login**

### 2. Frontend Application (React + TypeScript + Vite)
```bash
# Install frontend dependencies (if not already installed)
npm install

# Start Vite Development Server
npm run dev
```
The web dashboard will be accessible at: **http://localhost:5173/**
