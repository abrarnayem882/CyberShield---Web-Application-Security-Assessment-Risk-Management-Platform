# CyberShield — Module 1: Security Headers & Scoring Specification
**Author:** Ovijeet Saha (232-35-457)  
**Role:** Security Headers Audit, Vulnerability Scoring & Remediation Guides  
**Course:** SE 331 Software Engineering Design Capstone Project | Fall 2026  
**Group:** Group 02 | Section: 41_B2  

---

## 1. Overview & Assigned Functional Scope
This module provides automated HTTP response header inspection, cookie flag verification, server technology banner disclosure detection, and a 0–100 weighted security scoring algorithm for submitted web applications.

### Assigned Functional Requirements
- **FR-1.7: Security Headers Audit** — Probes and verifies 6 core defensive HTTP headers:
  - `Content-Security-Policy (CSP)` (Mitigates Cross-Site Scripting and data injection)
  - `Strict-Transport-Security (HSTS)` (Enforces HTTPS connection persistence)
  - `X-Frame-Options (XFO)` (Prevents Clickjacking frame hijacking)
  - `X-Content-Type-Options (XCTO)` (Prevents MIME-sniffing execution)
  - `Referrer-Policy` (Controls leakage of sensitive URL path tokens)
  - `Permissions-Policy` (Restricts browser hardware APIs like camera/geolocation)
- **FR-1.8: Cookie Security Check** — Inspects `Set-Cookie` directives for:
  - `HttpOnly` flag (Prevents JavaScript cookie theft via XSS)
  - `Secure` flag (Ensures cookie transmission occurs exclusively over HTTPS)
  - `SameSite` attribute (`Strict` / `Lax`, mitigates Cross-Site Request Forgery)
- **FR-1.9: Information Leak Detection** — Identifies server software banners:
  - `Server` header exposure (e.g., `Apache/2.4.41 (Ubuntu)`)
  - `X-Powered-By` header exposure (e.g., `PHP/7.4`, `Express`)
- **FR-1.10: Security Score & Letter Grade Engine** — Computes weighted security health scores (0–100) and assigns letter grades (`A+`, `A`, `B`, `C`, `D`, `F`).
- **FR-1.11: Vulnerability Findings View** — Categorizes findings by severity (`Critical`, `High`, `Medium`, `Low`, `Informational`).
- **FR-1.12: Remediation Fix Guide** — Generates context-aware, copy-pasteable configuration code snippets for **Nginx**, **Apache**, and **Django**.

---

## 2. Weighted Scoring Methodology
The scoring engine evaluates the platform's posture from a 100-point baseline:

| Security Component | Max Deduction | Severity Classification |
| :--- | :---: | :--- |
| **Missing SSL/TLS or Plaintext HTTP** | -25 pts | **Critical** |
| **Missing Content-Security-Policy (CSP)** | -15 pts | **High** |
| **Missing Strict-Transport-Security (HSTS)** | -15 pts | **High** |
| **Missing X-Frame-Options (Clickjacking)** | -10 pts | **Medium** |
| **Missing X-Content-Type-Options (nosniff)** | -10 pts | **Medium** |
| **Insecure Cookie Flags (Missing HttpOnly/Secure)** | -10 pts | **High** |
| **Missing Referrer-Policy** | -5 pts | **Low** |
| **Missing Permissions-Policy** | -5 pts | **Low** |
| **Server Banner / Technology Exposure** | -5 pts | **Informational / Low** |

### Grade Classification Table
- **90 – 100**: **Grade A+** (Hardened Security Posture)
- **80 – 89**: **Grade A** (Strong Security Baseline)
- **65 – 79**: **Grade B** (Standard Baseline Security)
- **50 – 64**: **Grade C** (Moderate Exposure Risk)
- **35 – 49**: **Grade D** (Elevated Vulnerability Exposure)
- **0 – 34**: **Grade F** (Critical Security Deficiencies)

---

## 3. Automated Remediation Configuration Catalog

### Nginx Configuration
```nginx
# Add to http, server, or location block:
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self';" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;
server_tokens off;
```

### Apache Configuration
```apache
# Add to httpd.conf, virtual host, or .htaccess:
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self';"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"
ServerTokens Prod
ServerSignature Off
```

---

## 4. Test Verification
Automated test coverage is provided via Django's test runner:
```bash
python backend/manage.py test scanner_api
```
All 7 unit and integration test assertions pass with zero failures.
