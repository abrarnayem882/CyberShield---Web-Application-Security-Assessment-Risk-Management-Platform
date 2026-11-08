# CyberShield - Web Application Security Assessment & Risk Management Platform

**Course**: SE331 | **Lab Section**: 41_B2 | **Semester**: Fall 2026  
**Group No**: Group 02  
**Active Project Scope**: Comprehensive 3-Module Specification (Active Laboratory Implementation: Module 1)

---

## Group Members & Project Roles

| Student ID | Member Name | Role & Functional Responsibility |
| :--- | :--- | :--- |
| **232-35-332** | **MD. ABU NAYEM** | User Access, URL Submission & Transport Encryption Verification |
| **232-35-457** | **OVIJEET SAHA** | Security Headers Audit, Vulnerability Scoring & Remediation Guides |
| **232-35-422** | **ATIYA KHANM LUCKY** | Assessment Conversion, Scan History, Audit Trails & Persona Switching |

---

## Functional Requirements Specification (User-End Capabilities)

All functional requirements describe direct user-end capabilities ("what users can do with the system") and are evenly distributed across the 3 group members:

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

### Module 2: Full Security Assessment, Findings, Risk & Remediation Management

#### MD. ABU NAYEM (232-35-332)
- **FR-2.1: Assessment Setup** - Assessors can create, configure, and schedule in-depth web application security assessment projects with custom scope.
- **FR-2.2: Standard Security Checklist** - Assessors can evaluate applications against comprehensive industry security checklists covering the top web vulnerability categories.
- **FR-2.3: Finding Creation** - Assessors can log identified vulnerabilities with detailed titles, descriptions, affected endpoints, and evidence steps.
- **FR-2.4: Risk Level Calculation** - Users can assign likelihood and impact ratings to automatically determine the overall risk score and severity level of a vulnerability.
- **FR-2.5: Finding Status Tracking** - Users can track and update the lifecycle state of each vulnerability from open discovery through fix verification and closure.
- **FR-2.6: Assessment Scope Definition** - Managers and assessors can define specific testing boundaries, excluded paths, and authorized domain assets for an assessment.

#### OVIJEET SAHA (232-35-457)
- **FR-2.7: Interactive Audit Checklist Console** - Assessors can navigate an interactive checklist interface to record pass, fail, or not-applicable verdicts with real-time audit progress.
- **FR-2.8: Vulnerability Search & Filter** - Users can quickly search, filter, and sort detected issues by severity, status, affected module, and discovery date.
- **FR-2.9: Remediation Evidence Submission** - Developers can submit fix explanations, patch notes, configuration changes, and code pull request links for resolved issues.
- **FR-2.10: Retest Verification Request** - Developers can request formal re-testing from security assessors once remediation fixes have been applied.
- **FR-2.11: Assessor Verification Verdict** - Assessors can review submitted evidence, perform verification re-tests, and mark vulnerabilities as resolved or reopened.
- **FR-2.12: Vulnerability Impact Details View** - Users can view detailed business impact analyses and technical exploitation explanations for each reported issue.

#### ATIYA KHANM LUCKY (232-35-422)
- **FR-2.13: Assessment Progress Monitoring** - Managers and customers can monitor overall assessment completion percentage, pending checks, and milestone progress.
- **FR-2.14: Remediation Task Assignment** - Managers can assign specific vulnerability remediation tasks to responsible developer team members with target deadlines.
- **FR-2.15: Retest History & Notes Log** - Users can view a complete chronological record of all retest attempts, assessor feedback notes, and verification outcomes.
- **FR-2.16: Finding Discussion & Collaboration** - Assessors and developers can exchange comments and clarification questions directly within individual vulnerability records.
- **FR-2.17: Overdue Remediation Alerts** - Managers and developers receive visual indicators and reminders for unresolved critical and high-severity issues past their target resolution window.
- **FR-2.18: Assessment Archival & Closure** - Authorized managers can formally finalize, sign off, and archive completed assessment projects once all verification checks conclude.

---

### Module 3: Dashboard, Reporting, Audit & Customer Conversion

#### MD. ABU NAYEM (232-35-332)
- **FR-3.1: Executive Security Dashboard** - Managers and executives can view an aggregated high-level overview of organization security posture, average scores, and open risks.
- **FR-3.2: Resolution Time Metrics** - Users can track Mean Time to Remediate (MTTR) metrics showing how quickly teams resolve Critical, High, and Medium vulnerabilities.
- **FR-3.3: Risk Heatmap Matrix** - Users can explore an interactive risk matrix displaying the distribution of vulnerabilities across likelihood and impact levels.
- **FR-3.4: Asset Security Comparison** - Managers can compare security health grades and vulnerability counts across multiple company websites and web applications.
- **FR-3.5: System Activity Audit Trail** - Administrators can search, filter, and inspect a complete activity log recording user logins, scan triggers, and configuration changes.
- **FR-3.6: Inbound Request Notification** - Assessors and managers receive notifications whenever a customer submits a new full assessment inquiry.

#### OVIJEET SAHA (232-35-457)
- **FR-3.7: Vulnerability Category Charts** - Users can view visual bar and donut charts illustrating vulnerability distributions across security categories and severity rankings.
- **FR-3.8: Interactive Heatmap Filtering** - Users can click any cell within the risk heatmap to instantly filter and view all vulnerabilities matching that specific risk level.
- **FR-3.9: Assessment Inquiries Kanban Pipeline** - Assessors and managers can track and move incoming customer assessment inquiries through visual workflow stages (Pending, Approved, In Progress, Completed).
- **FR-3.10: Customer Inquiry Review & Approval** - Assessors can review customer inquiry scopes, accept requests, and schedule security testing kickoff dates.
- **FR-3.11: Remediation Progress Dashboard** - Developers and managers can monitor the proportion of resolved versus outstanding security findings in real time.
- **FR-3.12: Security Posture Trends** - Users can view historical security posture trend charts showing score improvements over weeks and months.

#### ATIYA KHANM LUCKY (232-35-422)
- **FR-3.13: Executive PDF Report Download** - Users can generate and download a comprehensive, print-ready executive security report summarizing findings, scores, and risk distributions.
- **FR-3.14: Technical Findings Report Export** - Developers and assessors can export detailed technical vulnerability reports containing remediation steps and verification records.
- **FR-3.15: Audit Log Export** - Administrators can export searchable activity audit trail logs for external compliance reviews and security governance audits.
- **FR-3.16: Stakeholder Notification Alerts** - Customers receive notifications when assessment milestones are completed, and reports become available for download.
- **FR-3.17: Multi-Organization Dashboard View** - Security consultants can switch views between different client organizations to review their respective security portfolios.
- **FR-3.18: Assessment Summary Sharing** - Managers can generate secure, view-only summary links or presentation-ready summaries to share with executive leadership.

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
