# CyberShield---Web-Application-Security-Assessment-Risk-Management-Platform

# CyberShield - Web Application Security Assessment & Risk Management Platform

**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Student Name**: **MD. ABU NAYEM** | **Student ID**: **232-35-332**  
**Role**: Security Architecture & Backend Lead  
**Assigned Module**: Module 1 (Website Submission, Basic Security Report & User Management)

---

## Module 1 Architecture & Functional Requirements

This repository contains the Module 1 implementation for **CyberShield**, developed by **MD. ABU NAYEM (232-35-332)**. The module provides automated, safe, non-destructive web security auditing, cryptographic verification, security scoring, tailored remediation snippet generation, and user management with Role-Based Access Control (RBAC).

### Functional Requirements Specification (MD. Abu Nayem)

- **FR-1.1: User Login** - Authenticate users securely via bcrypt/PBKDF2 and issue HMAC-SHA256 signed JWT tokens with 60-minute expiry and embedded role claims.
- **FR-1.2: Role-Based Access Control (RBAC)** - Intercept protected routes via middleware, validate Bearer tokens, and enforce permissions for 5 system roles (*Customer, Assessor, Developer, Manager, Admin*).
- **FR-1.3: Target URL Validation & SSRF Guard** - Validate submitted URL syntax (RFC 3986), resolve DNS, and block private or loopback IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `::1`) with `HTTP 403 Forbidden`.
- **FR-1.4: Automated Security Checks Engine** - Execute safe concurrent checks:
  - SSL/TLS certificate validity, protocol version (TLS 1.2/1.3), cipher strength, and expiration date.
  - HTTP to HTTPS redirection (Port 80 to 301/308 redirect).
  - 6 Core Security Headers: `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
  - Cookie security attributes: `Secure`, `HttpOnly`, `SameSite`.
  - Information Exposure: Detection of server technology banners and `X-Powered-By` leaks.
- **FR-1.5: Security Scoring & Grading** - Calculate an overall security score (0–100) using weighted severity deductions (*Critical: -25, High: -15, Medium: -8, Low: -3*) and map to letter grades (*A+, A, B, C, D, F*).
- **FR-1.6: Remediation Snippet Generation** - Generate tailored configuration fix snippets for **Nginx**, **Apache**, and **Django** based on failed checks.
- **FR-1.7: Scan & Audit Data Persistence** - Store scan metadata, vulnerability findings JSON, and system audit events securely in the database.

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
