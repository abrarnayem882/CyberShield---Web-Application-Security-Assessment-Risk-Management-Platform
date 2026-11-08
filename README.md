# CyberShield - Web Application Security Assessment & Risk Management Platform

**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Group No**: Group 02  
**Active Project Scope**: Full Module 1 Implementation (Website Submission, Basic Security Report & User Management)

---

## Group Members & Project Roles

| Student ID | Member Name | Role & Functional Responsibility |
| :--- | :--- | :--- |
| **232-35-332** | **MD. ABU NAYEM** | User Access, URL Submission & Transport Encryption Verification |
| **232-35-457** | **OVIJEET SAHA** | Security Headers Audit, Vulnerability Scoring & Remediation Guides |
| **232-35-422** | **ATIYA KHANM LUCKY** | Assessment Conversion, Scan History, Audit Trails & Persona Switching |

---

## Full Module 1 User-End Functional Requirements

All functional requirements describe direct user-end capabilities ("what users can do with the system") and are circulated evenly across the group members:

### 1. MD. ABU NAYEM (232-35-332)
- **FR-1.1: User Login** - Users can securely log into their accounts using their credentials to access their security workspace.
- **FR-1.2: Role-Based Access Control** - Users access only the specific features, reports, and actions permitted for their assigned role (*Customer, Assessor, Developer, Manager, Admin*).
- **FR-1.3: Website URL Submission** - Users can enter and submit any website address to start an automated security check with real-time format validation.
- **FR-1.4: Internal Network Protection** - Users receive an immediate warning and scan blockage if attempting to submit private, internal, or restricted network addresses.
- **FR-1.5: SSL Certificate Inspection** - Users can inspect their website's SSL/TLS certificate validity, certificate authority issuer, encryption strength, and expiration date.
- **FR-1.6: HTTPS Redirection Check** - Users can verify whether unencrypted website traffic automatically redirects visitors to a secure, encrypted HTTPS connection.

### 2. OVIJEET SAHA (232-35-457)
- **FR-1.7: Security Headers Audit** - Users can inspect whether essential website security headers (such as clickjacking and content protection) are properly configured.
- **FR-1.8: Cookie Security Check** - Users can verify whether website cookies have essential security flags enabled to prevent unauthorized interception and session theft.
- **FR-1.9: Information Leak Detection** - Users can identify exposed server technology versions and system banners that reveal internal infrastructure details.
- **FR-1.10: Security Score & Grade** - Users receive an overall security score from 0 to 100 and a letter grade (*A+, A, B, C, D, F*) summarizing their website's security health.
- **FR-1.11: Vulnerability Findings View** - Users can review and filter detected security vulnerabilities categorized by severity levels (Critical, High, Medium, Low).
- **FR-1.12: Remediation Fix Guide** - Users can view and copy ready-to-use configuration fix snippets for popular web servers to resolve detected security issues.

### 3. ATIYA KHANM LUCKY (232-35-422)
- **FR-1.13: Full Assessment Request** - Customers can submit an in-depth security assessment request directly from their scan results with custom scope and compliance goals.
- **FR-1.14: Scan History Log** - Users can view and search a history of all past website scans, including past scores, grades, dates, and previous results.
- **FR-1.15: One-Click Re-Scan** - Users can quickly re-scan any previously analyzed website with one click to verify if applied fixes improved their score.
- **FR-1.16: User Profile View** - Users can view their personal account details, organization info, active session status, and assigned permissions.
- **FR-1.17: Activity Audit Trail** - Administrators and managers can review a searchable log of all user activities, scan operations, and platform events.
- **FR-1.18: Role Persona Switcher** - Users can switch between different stakeholder roles to preview role-specific dashboards, features, and permissions.

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
The web dashboard is accessible at: **http://localhost:5173/**
