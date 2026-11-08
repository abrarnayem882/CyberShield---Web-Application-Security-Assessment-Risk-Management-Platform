# CyberShield — Module 1: Scan History, Audit Trails & Assessment Pipeline Specification
**Author:** Atiya Khanm Lucky (232-35-422)  
**Role:** Assessment Conversion, Scan History, Audit Trails & Persona Switching  
**Course:** SE 331 Software Engineering Design Capstone Project | Fall 2026  
**Group:** Group 02 | Section: 41_B2  

---

## 1. Overview & Assigned Functional Scope
This module provides persistence, historical audit logging, role-governed activity monitoring, and inquiry conversion pipelines for CyberShield. It allows users to track their historical website scores over time, re-test websites after applying fixes, and request full-scope penetration testing.

### Assigned Functional Requirements
- **FR-1.13: Full Assessment Request** — Enables authenticated customers to convert passive basic scan findings into comprehensive in-depth penetration test inquiries (Web Application Pentest, Cloud/API Audit) with defined compliance standards (ISO 27001, PCI-DSS, SOC2).
- **FR-1.14: Scan History Log** — Delivers a searchable, grade-filterable dashboard displaying past website security audits, domain hostnames, scores, letter grades, and execution timestamps.
- **FR-1.15: One-Click Re-Scan** — Provides an automated pipeline allowing developers and assessors to trigger a re-scan of any previously analyzed target with one click, measuring posture score improvements after applying remediations.
- **FR-1.16: User Profile View** — Visualizes account identity, organization affiliation, active HMAC-SHA256 JWT Bearer token, and interactive 5-role capability matrix.
- **FR-1.17: Activity Audit Trail** — Manages an immutable, append-only security log recording timestamped user events (`LOGIN`, `EXECUTE_SCAN`, `REQUEST_ASSESSMENT`, `ROLE_CHANGE`) with client IP addresses and user roles.
- **FR-1.18: Role Persona Switcher** — Facilitates seamless 1-click persona switching across the 5 project stakeholders (*Customer, Assessor, Developer, Manager, Admin*) to test role-gated UI permissions and API security guards.

---

## 2. Relational Database Schema & Entity Relationships

### ScanRecord (`scanner_api_scanrecord`)
- `id` (UUID, Primary Key)
- `url` (CharField, max 2048)
- `hostname` (CharField, indexed)
- `ip_address` (GenericIPAddressField)
- `score` (IntegerField 0–100, indexed)
- `letter_grade` (CharField: `A+`, `A`, `B`, `C`, `D`, `F`)
- `grade_label` (CharField)
- `response_status` (IntegerField)
- `ssl_info` (JSONField: issuer, subject, expires, cipher, tls_version)
- `checks_data` (JSONField: array of 6 security header checks)
- `findings_data` (JSONField: detected misconfigurations and severities)
- `severity_counts` (JSONField: Critical, High, Medium, Low, Info counts)
- `created_at` (DateTimeField, auto_now_add=True, indexed)

### ScanAuditLog (`scanner_api_scanauditlog`)
- `id` (UUID, Primary Key)
- `user_name` (CharField)
- `role` (CharField)
- `action` (CharField: `LOGIN`, `EXECUTE_SCAN`, `REQUEST_ASSESSMENT`, `ROLE_CHANGE`)
- `target_url` (CharField)
- `ip_address` (GenericIPAddressField)
- `details` (TextField)
- `timestamp` (DateTimeField, auto_now_add=True)

### AssessmentRequest (`scanner_api_assessmentrequest`)
- `id` (UUID, Primary Key)
- `organization` (CharField)
- `contact_name` (CharField)
- `contact_email` (EmailField)
- `target_url` (CharField)
- `scope_notes` (TextField)
- `compliance_target` (CharField)
- `priority` (CharField: `Routine`, `Urgent`, `Emergency`)
- `status` (CharField: `Pending Review`, `Approved & Scheduled`, `In Progress`, `Completed`)
- `submitted_at` (DateTimeField, auto_now_add=True)

---

## 3. Workflow Architecture

```
[Basic Security Report]
          │
          ├──> [Click "Re-Scan Target"] ──> Triggers POST /api/scan ──> Refreshes ScanRecord
          │
          └──> [Click "Request In-Depth Assessment"] ──> Opens Assessment Modal
                                                                    │
                                                                    ▼
                                                       Submits PATCH /api/request-assessment
                                                                    │
                                                                    ▼
                                                       Creates AssessmentRequest in DB
                                                       Logs Action in ScanAuditLog
```

---

## 4. Test Verification
All features are validated via Django automated testing:
```bash
python backend/manage.py test scanner_api
```
All 12 test assertions in `tests.py` and `test_history_and_audit.py` pass cleanly.
