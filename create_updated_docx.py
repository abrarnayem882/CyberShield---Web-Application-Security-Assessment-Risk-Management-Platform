import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_document():
    doc = docx.Document()

    # Set 0.8 inch margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Helper styling function
    def set_font(run, name='Times New Roman', size_pt=11.5, bold=False, italic=False, color=None):
        run.font.name = name
        run.font.size = Pt(size_pt)
        run.bold = bold
        run.italic = italic
        if color:
            run.font.color.rgb = color

    # Document Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("CyberShield - Web Application Security Assessment & Risk Management Platform")
    set_font(r_title, size_pt=16, bold=True, color=RGBColor(15, 23, 42))

    # Academic metadata subtitle
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(4)
    r_meta1 = p_meta.add_run("Course: ")
    set_font(r_meta1, size_pt=11, bold=True)
    r_meta2 = p_meta.add_run("SE331  |  ")
    set_font(r_meta2, size_pt=11)
    r_meta3 = p_meta.add_run("Lab Section: ")
    set_font(r_meta3, size_pt=11, bold=True)
    r_meta4 = p_meta.add_run("41_B2  |  ")
    set_font(r_meta4, size_pt=11)
    r_meta5 = p_meta.add_run("Semester: ")
    set_font(r_meta5, size_pt=11, bold=True)
    r_meta6 = p_meta.add_run("Fall 2026  |  ")
    set_font(r_meta6, size_pt=11)
    r_meta7 = p_meta.add_run("Group No: ")
    set_font(r_meta7, size_pt=11, bold=True)
    r_meta8 = p_meta.add_run("Group 02")
    set_font(r_meta8, size_pt=11)

    # Submission Date & Scope
    p_scope = doc.add_paragraph()
    p_scope.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_scope.paragraph_format.space_before = Pt(0)
    p_scope.paragraph_format.space_after = Pt(14)
    r_date1 = p_scope.add_run("Submission Date: ")
    set_font(r_date1, size_pt=10.5, bold=True)
    r_date2 = p_scope.add_run("05-10-2026  |  ")
    set_font(r_date2, size_pt=10.5)
    r_scope1 = p_scope.add_run("Active Scope: ")
    set_font(r_scope1, size_pt=10.5, bold=True)
    r_scope2 = p_scope.add_run("Comprehensive 3-Module Specification (Active Laboratory Implementation: Module 1)")
    set_font(r_scope2, size_pt=10.5, italic=True)

    # Group Members Heading
    p_gm = doc.add_paragraph()
    p_gm.paragraph_format.space_before = Pt(8)
    p_gm.paragraph_format.space_after = Pt(4)
    r_gm = p_gm.add_run("Group Members & Project Roles")
    set_font(r_gm, size_pt=13, bold=True, color=RGBColor(30, 58, 138))

    # Table of Group Members
    table = doc.add_table(rows=4, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(1.3), Inches(2.1), Inches(3.4)]
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = w

    headers = ["Student ID", "Member Name", "Role & Functional Responsibility"]
    data = [
        ["232-35-332", "MD. ABU NAYEM", "User Access, URL Submission & Transport Encryption Verification"],
        ["232-35-457", "OVIJEET SAHA", "Security Headers Audit, Vulnerability Scoring & Remediation Guides"],
        ["232-35-422", "ATIYA KHANM LUCKY", "Assessment Conversion, Scan History, Audit Trails & Persona Switching"]
    ]

    # Format Table Header
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        for r in p.runs:
            set_font(r, size_pt=10.5, bold=True, color=RGBColor(255, 255, 255))
        shading = parse_xml(r'<w:shd {} w:fill="1E293B"/>'.format(nsdecls('w')))
        hdr_cells[i]._tc.get_or_add_tcPr().append(shading)

    # Format Table Body
    for r_idx, row_data in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = val
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            for r in p.runs:
                set_font(r, size_pt=10, bold=(c_idx < 2))
            if r_idx % 2 == 1:
                shading = parse_xml(r'<w:shd {} w:fill="F1F5F9"/>'.format(nsdecls('w')))
                row_cells[c_idx]._tc.get_or_add_tcPr().append(shading)

    tblPr = table._tbl.tblPr
    borders = parse_xml(r'''
        <w:tblBorders {} >
            <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
        </w:tblBorders>
    '''.format(nsdecls('w')))
    tblPr.append(borders)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Section 1: Project Overview
    p_s1 = doc.add_paragraph()
    p_s1.paragraph_format.space_before = Pt(10)
    p_s1.paragraph_format.space_after = Pt(3)
    r_s1 = p_s1.add_run("1. Project Overview")
    set_font(r_s1, size_pt=13, bold=True, color=RGBColor(30, 58, 138))

    p_p1 = doc.add_paragraph()
    p_p1.paragraph_format.space_before = Pt(0)
    p_p1.paragraph_format.space_after = Pt(6)
    p_p1.paragraph_format.line_spacing = 1.15
    r_p1 = p_p1.add_run(
        "CyberShield is a comprehensive web-based security assessment and risk management platform designed to help organizations "
        "easily evaluate, manage, and improve their web application security posture. The platform delivers a structured three-module workflow: "
        "Module 1 provides an automated Basic Security Report covering HTTPS encryption, SSL certificate health, security headers, cookie safety, and technology exposure; "
        "Module 2 enables in-depth security assessments with standardized checklists, vulnerability tracking, 5×5 risk scoring, developer remediation evidence submission, and assessor retesting verification; "
        "Module 3 provides executive KPI dashboards, visual risk heatmaps, vulnerability distribution charts, immutable activity audit trails, and exportable executive PDF reports."
    )
    set_font(r_p1, size_pt=11.5)

    # Section 2: Project Stakeholders
    p_s2 = doc.add_paragraph()
    p_s2.paragraph_format.space_before = Pt(8)
    p_s2.paragraph_format.space_after = Pt(3)
    r_s2 = p_s2.add_run("2. Project Stakeholders")
    set_font(r_s2, size_pt=13, bold=True, color=RGBColor(30, 58, 138))

    stakeholders = [
        ("Customer / Organization", "Submits website URLs for automated security auditing, reviews reports, and requests in-depth assessments."),
        ("Security Administrator", "Governs role-based access control, user accounts, system configuration, and inspects tamper-evident audit logs."),
        ("Security Assessor / Analyst", "Performs comprehensive assessments using standard checklists, logs vulnerabilities, calculates risk, and verifies developer fixes."),
        ("Remediation Developer", "Reviews detected misconfigurations and vulnerabilities, applies configuration and code fixes, and submits remediation evidence."),
        ("Security Manager", "Monitors organization-wide security scores, vulnerability distributions, remediation MTTR metrics, and approves assessment pipelines.")
    ]
    for role, desc in stakeholders:
        p_st = doc.add_paragraph(style='List Bullet')
        p_st.paragraph_format.space_before = Pt(1)
        p_st.paragraph_format.space_after = Pt(2)
        r_role = p_st.add_run(f"{role}: ")
        set_font(r_role, size_pt=11, bold=True)
        r_desc = p_st.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Section 3: Business Need
    p_s3 = doc.add_paragraph()
    p_s3.paragraph_format.space_before = Pt(8)
    p_s3.paragraph_format.space_after = Pt(3)
    r_s3 = p_s3.add_run("3. Business Need")
    set_font(r_s3, size_pt=13, bold=True, color=RGBColor(30, 58, 138))

    p_p3 = doc.add_paragraph()
    p_p3.paragraph_format.space_before = Pt(0)
    p_p3.paragraph_format.space_after = Pt(6)
    p_p3.paragraph_format.line_spacing = 1.15
    r_p3 = p_p3.add_run(
        "Organizations frequently lack immediate visibility into common web application vulnerabilities and configuration weaknesses. "
        "CyberShield replaces fragmented spreadsheets, emails, and disconnected tools with a unified platform that combines immediate passive security checks, "
        "structured penetration test tracking, and executive risk governance. The platform aligns with industry-recognized frameworks including OWASP Top 10:2021 and NIST CSF 2.0."
    )
    set_font(r_p3, size_pt=11.5)

    # Section 4: Technology Stack
    p_s4 = doc.add_paragraph()
    p_s4.paragraph_format.space_before = Pt(8)
    p_s4.paragraph_format.space_after = Pt(3)
    r_s4 = p_s4.add_run("4. Technology Stack")
    set_font(r_s4, size_pt=13, bold=True, color=RGBColor(30, 58, 138))

    tech_stack = [
        ("Language", "Python 3, TypeScript / JavaScript"),
        ("Backend Framework", "Django REST Framework (DRF) 3.18"),
        ("Frontend Framework", "React 19 / Vite"),
        ("Styling", "Vanilla CSS & Modern Dark-Mode Palette"),
        ("Database & ORM", "PostgreSQL / Django ORM (SQLite in local development)"),
        ("API & Authentication", "RESTful API with HMAC-SHA256 Signed JWT Tokens"),
        ("Iconography", "Lucide React Vector Icons (Zero Emojis, Zero AI Pictures)"),
        ("Version Control", "Git & GitHub")
    ]
    for cat, val in tech_stack:
        p_t = doc.add_paragraph(style='List Bullet')
        p_t.paragraph_format.space_before = Pt(1)
        p_t.paragraph_format.space_after = Pt(2)
        r_cat = p_t.add_run(f"{cat}: ")
        set_font(r_cat, size_pt=11, bold=True)
        r_val = p_t.add_run(val)
        set_font(r_val, size_pt=11)

    # Section 5: Functional Requirements Specification
    p_s5 = doc.add_paragraph()
    p_s5.paragraph_format.space_before = Pt(10)
    p_s5.paragraph_format.space_after = Pt(2)
    r_s5 = p_s5.add_run("5. Functional Requirements Specification")
    set_font(r_s5, size_pt=13, bold=True, color=RGBColor(30, 58, 138))

    p_note = doc.add_paragraph()
    p_note.paragraph_format.space_before = Pt(0)
    p_note.paragraph_format.space_after = Pt(6)
    r_note = p_note.add_run(
        "All requirements describe direct user-end capabilities (\"what users can do with the system\") and are evenly distributed across the 3 group members (6 requirements per member in each module):"
    )
    set_font(r_note, size_pt=10.5, italic=True)

    # ==========================================
    # MODULE 1
    # ==========================================
    p_m1_hdr = doc.add_paragraph()
    p_m1_hdr.paragraph_format.space_before = Pt(8)
    p_m1_hdr.paragraph_format.space_after = Pt(4)
    r_m1_hdr = p_m1_hdr.add_run("Module 1: Website Submission, Basic Security Report & User Management")
    set_font(r_m1_hdr, size_pt=12, bold=True, color=RGBColor(14, 116, 144))

    # Module 1 - MD. ABU NAYEM
    p_m1_n = doc.add_paragraph()
    p_m1_n.paragraph_format.space_before = Pt(4)
    p_m1_n.paragraph_format.space_after = Pt(2)
    r_m1_n = p_m1_n.add_run("MD. ABU NAYEM (232-35-332)")
    set_font(r_m1_n, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m1_nayem = [
        ("FR-1.1: User Login", "Users can securely log into their accounts using their credentials to access their security workspace."),
        ("FR-1.2: Role-Based Access Control", "Users access only the specific features, reports, and actions permitted for their assigned role (Customer, Assessor, Developer, Manager, Admin)."),
        ("FR-1.3: Website URL Submission", "Users can enter and submit any website address to start an automated security check with real-time format validation."),
        ("FR-1.4: Internal Network Protection", "Users receive an immediate warning and scan blockage if attempting to submit private, internal, or restricted network addresses."),
        ("FR-1.5: SSL Certificate Inspection", "Users can inspect their website's SSL/TLS certificate validity, certificate authority issuer, encryption strength, and expiration date."),
        ("FR-1.6: HTTPS Redirection Check", "Users can verify whether unencrypted website traffic automatically redirects visitors to a secure, encrypted HTTPS connection.")
    ]
    for tag, desc in m1_nayem:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Module 1 - OVIJEET SAHA
    p_m1_o = doc.add_paragraph()
    p_m1_o.paragraph_format.space_before = Pt(4)
    p_m1_o.paragraph_format.space_after = Pt(2)
    r_m1_o = p_m1_o.add_run("OVIJEET SAHA (232-35-457)")
    set_font(r_m1_o, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m1_ovijeet = [
        ("FR-1.7: Security Headers Audit", "Users can inspect whether essential website security headers (such as clickjacking and content protection) are properly configured."),
        ("FR-1.8: Cookie Security Check", "Users can verify whether website cookies have essential security flags enabled to prevent unauthorized interception and session theft."),
        ("FR-1.9: Information Leak Detection", "Users can identify exposed server technology versions and system banners that reveal internal infrastructure details."),
        ("FR-1.10: Security Score & Grade", "Users receive an overall security score from 0 to 100 and a letter grade (A+, A, B, C, D, F) summarizing their website's security health."),
        ("FR-1.11: Vulnerability Findings View", "Users can review and filter detected security vulnerabilities categorized by severity levels (Critical, High, Medium, Low)."),
        ("FR-1.12: Remediation Fix Guide", "Users can view and copy ready-to-use configuration fix snippets for popular web servers to resolve detected security issues.")
    ]
    for tag, desc in m1_ovijeet:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Module 1 - ATIYA KHANM LUCKY
    p_m1_l = doc.add_paragraph()
    p_m1_l.paragraph_format.space_before = Pt(4)
    p_m1_l.paragraph_format.space_after = Pt(2)
    r_m1_l = p_m1_l.add_run("ATIYA KHANM LUCKY (232-35-422)")
    set_font(r_m1_l, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m1_lucky = [
        ("FR-1.13: Full Assessment Request", "Customers can submit an in-depth security assessment request directly from their scan results with custom scope and compliance goals."),
        ("FR-1.14: Scan History Log", "Users can view and search a history of all past website scans, including past scores, grades, dates, and previous results."),
        ("FR-1.15: One-Click Re-Scan", "Users can quickly re-scan any previously analyzed website with one click to verify if applied fixes improved their score."),
        ("FR-1.16: User Profile View", "Users can view their personal account details, organization info, active session status, and assigned permissions."),
        ("FR-1.17: Activity Audit Trail", "Administrators and managers can review a searchable log of all user activities, scan operations, and platform events."),
        ("FR-1.18: Role Persona Switcher", "Users can switch between different stakeholder roles to preview role-specific dashboards, features, and permissions.")
    ]
    for tag, desc in m1_lucky:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # ==========================================
    # MODULE 2
    # ==========================================
    p_m2_hdr = doc.add_paragraph()
    p_m2_hdr.paragraph_format.space_before = Pt(10)
    p_m2_hdr.paragraph_format.space_after = Pt(4)
    r_m2_hdr = p_m2_hdr.add_run("Module 2: Full Security Assessment, Findings, Risk & Remediation Management")
    set_font(r_m2_hdr, size_pt=12, bold=True, color=RGBColor(14, 116, 144))

    # Module 2 - MD. ABU NAYEM
    p_m2_n = doc.add_paragraph()
    p_m2_n.paragraph_format.space_before = Pt(4)
    p_m2_n.paragraph_format.space_after = Pt(2)
    r_m2_n = p_m2_n.add_run("MD. ABU NAYEM (232-35-332)")
    set_font(r_m2_n, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m2_nayem = [
        ("FR-2.1: Assessment Setup", "Assessors can create, configure, and schedule in-depth web application security assessment projects with custom scope."),
        ("FR-2.2: Standard Security Checklist", "Assessors can evaluate applications against comprehensive industry security checklists covering the top web vulnerability categories."),
        ("FR-2.3: Finding Creation", "Assessors can log identified vulnerabilities with detailed titles, descriptions, affected endpoints, and evidence steps."),
        ("FR-2.4: Risk Level Calculation", "Users can assign likelihood and impact ratings to automatically determine the overall risk score and severity level of a vulnerability."),
        ("FR-2.5: Finding Status Tracking", "Users can track and update the lifecycle state of each vulnerability from open discovery through fix verification and closure."),
        ("FR-2.6: Assessment Scope Definition", "Managers and assessors can define specific testing boundaries, excluded paths, and authorized domain assets for an assessment.")
    ]
    for tag, desc in m2_nayem:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Module 2 - OVIJEET SAHA
    p_m2_o = doc.add_paragraph()
    p_m2_o.paragraph_format.space_before = Pt(4)
    p_m2_o.paragraph_format.space_after = Pt(2)
    r_m2_o = p_m2_o.add_run("OVIJEET SAHA (232-35-457)")
    set_font(r_m2_o, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m2_ovijeet = [
        ("FR-2.7: Interactive Audit Checklist Console", "Assessors can navigate an interactive checklist interface to record pass, fail, or not-applicable verdicts with real-time audit progress."),
        ("FR-2.8: Vulnerability Search & Filter", "Users can quickly search, filter, and sort detected issues by severity, status, affected module, and discovery date."),
        ("FR-2.9: Remediation Evidence Submission", "Developers can submit fix explanations, patch notes, configuration changes, and code pull request links for resolved issues."),
        ("FR-2.10: Retest Verification Request", "Developers can request formal re-testing from security assessors once remediation fixes have been applied."),
        ("FR-2.11: Assessor Verification Verdict", "Assessors can review submitted evidence, perform verification re-tests, and mark vulnerabilities as resolved or reopened."),
        ("FR-2.12: Vulnerability Impact Details View", "Users can view detailed business impact analyses and technical exploitation explanations for each reported issue.")
    ]
    for tag, desc in m2_ovijeet:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Module 2 - ATIYA KHANM LUCKY
    p_m2_l = doc.add_paragraph()
    p_m2_l.paragraph_format.space_before = Pt(4)
    p_m2_l.paragraph_format.space_after = Pt(2)
    r_m2_l = p_m2_l.add_run("ATIYA KHANM LUCKY (232-35-422)")
    set_font(r_m2_l, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m2_lucky = [
        ("FR-2.13: Assessment Progress Monitoring", "Managers and customers can monitor overall assessment completion percentage, pending checks, and milestone progress."),
        ("FR-2.14: Remediation Task Assignment", "Managers can assign specific vulnerability remediation tasks to responsible developer team members with target deadlines."),
        ("FR-2.15: Retest History & Notes Log", "Users can view a complete chronological record of all retest attempts, assessor feedback notes, and verification outcomes."),
        ("FR-2.16: Finding Discussion & Collaboration", "Assessors and developers can exchange comments and clarification questions directly within individual vulnerability records."),
        ("FR-2.17: Overdue Remediation Alerts", "Managers and developers receive visual indicators and reminders for unresolved critical and high-severity issues past their target resolution window."),
        ("FR-2.18: Assessment Archival & Closure", "Authorized managers can formally finalize, sign off, and archive completed assessment projects once all verification checks conclude.")
    ]
    for tag, desc in m2_lucky:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # ==========================================
    # MODULE 3
    # ==========================================
    p_m3_hdr = doc.add_paragraph()
    p_m3_hdr.paragraph_format.space_before = Pt(10)
    p_m3_hdr.paragraph_format.space_after = Pt(4)
    r_m3_hdr = p_m3_hdr.add_run("Module 3: Dashboard, Reporting, Audit & Customer Conversion")
    set_font(r_m3_hdr, size_pt=12, bold=True, color=RGBColor(14, 116, 144))

    # Module 3 - MD. ABU NAYEM
    p_m3_n = doc.add_paragraph()
    p_m3_n.paragraph_format.space_before = Pt(4)
    p_m3_n.paragraph_format.space_after = Pt(2)
    r_m3_n = p_m3_n.add_run("MD. ABU NAYEM (232-35-332)")
    set_font(r_m3_n, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m3_nayem = [
        ("FR-3.1: Executive Security Dashboard", "Managers and executives can view an aggregated high-level overview of organization security posture, average scores, and open risks."),
        ("FR-3.2: Resolution Time Metrics", "Users can track Mean Time to Remediate (MTTR) metrics showing how quickly teams resolve Critical, High, and Medium vulnerabilities."),
        ("FR-3.3: Risk Heatmap Matrix", "Users can explore an interactive risk matrix displaying the distribution of vulnerabilities across likelihood and impact levels."),
        ("FR-3.4: Asset Security Comparison", "Managers can compare security health grades and vulnerability counts across multiple company websites and web applications."),
        ("FR-3.5: System Activity Audit Trail", "Administrators can search, filter, and inspect a complete activity log recording user logins, scan triggers, and configuration changes."),
        ("FR-3.6: Inbound Request Notification", "Assessors and managers receive notifications whenever a customer submits a new full assessment inquiry.")
    ]
    for tag, desc in m3_nayem:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Module 3 - OVIJEET SAHA
    p_m3_o = doc.add_paragraph()
    p_m3_o.paragraph_format.space_before = Pt(4)
    p_m3_o.paragraph_format.space_after = Pt(2)
    r_m3_o = p_m3_o.add_run("OVIJEET SAHA (232-35-457)")
    set_font(r_m3_o, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m3_ovijeet = [
        ("FR-3.7: Vulnerability Category Charts", "Users can view visual bar and donut charts illustrating vulnerability distributions across security categories and severity rankings."),
        ("FR-3.8: Interactive Heatmap Filtering", "Users can click any cell within the risk heatmap to instantly filter and view all vulnerabilities matching that specific risk level."),
        ("FR-3.9: Assessment Inquiries Kanban Pipeline", "Assessors and managers can track and move incoming customer assessment inquiries through visual workflow stages (Pending, Approved, In Progress, Completed)."),
        ("FR-3.10: Customer Inquiry Review & Approval", "Assessors can review customer inquiry scopes, accept requests, and schedule security testing kickoff dates."),
        ("FR-3.11: Remediation Progress Dashboard", "Developers and managers can monitor the proportion of resolved versus outstanding security findings in real time."),
        ("FR-3.12: Security Posture Trends", "Users can view historical security posture trend charts showing score improvements over weeks and months.")
    ]
    for tag, desc in m3_ovijeet:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Module 3 - ATIYA KHANM LUCKY
    p_m3_l = doc.add_paragraph()
    p_m3_l.paragraph_format.space_before = Pt(4)
    p_m3_l.paragraph_format.space_after = Pt(2)
    r_m3_l = p_m3_l.add_run("ATIYA KHANM LUCKY (232-35-422)")
    set_font(r_m3_l, size_pt=11, bold=True, color=RGBColor(15, 23, 42))

    m3_lucky = [
        ("FR-3.13: Executive PDF Report Download", "Users can generate and download a comprehensive, print-ready executive security report summarizing findings, scores, and risk distributions."),
        ("FR-3.14: Technical Findings Report Export", "Developers and assessors can export detailed technical vulnerability reports containing remediation steps and verification records."),
        ("FR-3.15: Audit Log Export", "Administrators can export searchable activity audit trail logs for external compliance reviews and security governance audits."),
        ("FR-3.16: Stakeholder Notification Alerts", "Customers receive notifications when assessment milestones are completed, and reports become available for download."),
        ("FR-3.17: Multi-Organization Dashboard View", "Security consultants can switch views between different client organizations to review their respective security portfolios."),
        ("FR-3.18: Assessment Summary Sharing", "Managers can generate secure, view-only summary links or presentation-ready summaries to share with executive leadership.")
    ]
    for tag, desc in m3_lucky:
        p_fr = doc.add_paragraph(style='List Bullet')
        p_fr.paragraph_format.space_before = Pt(1)
        p_fr.paragraph_format.space_after = Pt(2)
        r_tag = p_fr.add_run(f"{tag} - ")
        set_font(r_tag, size_pt=11, bold=True)
        r_desc = p_fr.add_run(desc)
        set_font(r_desc, size_pt=11)

    # Section 6: Non-Functional Requirements
    p_s6 = doc.add_paragraph()
    p_s6.paragraph_format.space_before = Pt(10)
    p_s6.paragraph_format.space_after = Pt(3)
    r_s6 = p_s6.add_run("6. Non-Functional Requirements")
    set_font(r_s6, size_pt=13, bold=True, color=RGBColor(30, 58, 138))

    nfrs = [
        ("1. Security", "Secure password hashing, authorization checks, role permissions, and tamper-evident activity logging."),
        ("2. Safety", "Automated scans are strictly passive and non-destructive; private and internal networks are blocked by default."),
        ("3. Performance", "Fast automated checks and report generation completing operations within seconds."),
        ("4. Reliability", "Graceful error handling, input validation, and continuous data consistency across all assessment states."),
        ("5. Usability", "Clean, responsive web interface accessible across desktop and mobile browsers.")
    ]
    for title, desc in nfrs:
        p_nfr = doc.add_paragraph(style='List Bullet')
        p_nfr.paragraph_format.space_before = Pt(1)
        p_nfr.paragraph_format.space_after = Pt(2)
        r_title = p_nfr.add_run(f"{title}: ")
        set_font(r_title, size_pt=11, bold=True)
        r_desc = p_nfr.add_run(desc)
        set_font(r_desc, size_pt=11)

    output_path = "CyberShield_Group 02.docx"
    doc.save(output_path)
    print(f"Successfully generated and saved: {output_path}")

if __name__ == "__main__":
    create_document()
