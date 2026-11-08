

# CyberShield - Web Application Security Assessment & Risk Management Platform

**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Group No**: Group 02  
**Active Project Scope**: Full Module 1 Implementation (Website Submission, Basic Security Report & User Management)

---

## Group Members & Project Roles

| Student ID | Member Name | Role & Engineering Contribution |
| :--- | :--- | :--- |
| **232-35-332** | **MD. ABU NAYEM** | Security Architecture & Backend Lead (Django REST API, JWT RBAC, Safe Scanner Engine) |
| **232-35-457** | **OVIJEET SAHA** | Frontend Engineering & UI Lead (React UI, Score Gauge, Collapsible Cards, Persona Switcher) |
| **232-35-422** | **ATIYA KHANM LUCKY** | Database, QA & Reporting Lead (Relational Models, Constraints, DB Migrations, Test Fixtures) |

---

## Full Module 1 Functional Requirements Specification

### 1. Security Architecture & Backend Services (MD. Abu Nayem)
- **FR-1.1: User Login** - Authenticate users securely via bcrypt/PBKDF2 and issue HMAC-SHA256 signed JWT tokens with 60-minute expiry and embedded role claims.
- **FR-1.2: Role-Based Access Control** - Intercept protected routes via middleware, validate Bearer tokens, and enforce permissions for 5 system roles (*Customer, Assessor, Developer, Manager, Admin*).
- **FR-1.3: Target URL Validation** - Validate submitted URL syntax (RFC 3986), resolve DNS, and block private or loopback IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `::1`) with `HTTP 403 Forbidden` to prevent SSRF attacks.
- **FR-1.4: Automated Security Checks** - Execute safe concurrent checks for TLS 1.2/1.3 validity, port 80 to HTTPS redirect, 6 security headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), cookie flags (`Secure`, `HttpOnly`, `SameSite`), and server banner leaks.
- **FR-1.5: Security Scoring & Grading** - Calculate an overall security score (0–100) using weighted severity deductions (*Critical: -25, High: -15, Medium: -8, Low: -3*) and map to letter grades (*A+, A, B, C, D, F*).
- **FR-1.6: Remediation Snippet Generation** - Generate tailored configuration fix snippets for **Nginx**, **Apache**, and **Django** based on failed checks.
- **FR-1.7: Scan & Audit Data Persistence** - Store scan metadata, vulnerability findings JSON, and system audit events securely in the database.

### 2. Frontend Engineering & User Interface (Ovijeet Saha)
- **FR-1.8: URL Submission Interface** - Provide a target URL submission form with real-time format validation, automatic HTTPS prefixing, and interactive loading states.
- **FR-1.9: Security Score Gauge Display** - Render a circular score gauge (0–100) with dynamic severity color coding and letter grade badges.
- **FR-1.10: Vulnerability Findings Cards** - Render collapsible finding cards categorized by severity with tabbed, copyable remediation snippets (*Nginx, Apache, Django*).
- **FR-1.11: Full Assessment Request CTA** - Provide a one-click CTA converting basic scan results into a full security assessment request.
- **FR-1.12: User Profile & History Management** - Provide user account management and historical scan views with re-scan capabilities and detailed report links.
- **FR-1.13: Responsive Layout & Role Switcher** - Deliver a responsive layout with a top-level persona switcher bar for live RBAC demonstration.

### 3. Database, Integrity & Quality Assurance (Atiya Khanm Lucky)
- **FR-1.14: Relational Database Schema Design** - Design a 3NF normalized relational schema for organizations, users, roles, websites, scans, and findings with UUID primary keys.
- **FR-1.15: Database Integrity Constraints** - Enforce data integrity through domain CHECK constraints (`score BETWEEN 0 AND 100`, `letter_grade`), UNIQUE keys (`email`, `target_url`), and cascading foreign key rules.
- **FR-1.16: Database Migrations & Indexing** - Apply automated database migrations and performance indexes (`idx_scans_user_time`, `idx_scans_status`) to optimize query speeds.
- **FR-1.17: Data Validation Layer** - Validate URL length, active user and organization relationships, and scan report JSON schema integrity before commit.
- **FR-1.18: Automated Test Suites & Fixtures** - Construct target test fixtures and execute automated test suites validating scoring formulas and constraint enforcement.

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
