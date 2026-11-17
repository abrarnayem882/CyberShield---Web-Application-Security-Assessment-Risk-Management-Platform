"""
seed_module2.py — Django management command to seed Module 2 demo data.
Run: python backend/manage.py seed_module2
"""
import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from scanner_api.models import (
    Organization, UserProfile, AssessmentRequest,
    Assessment, ChecklistItem, Finding,
    ChecklistAuditRecord, RemediationEvidence, RetestVerification,
    RemediationTask, RetestNote, FindingComment, AssessmentArchive
)


class Command(BaseCommand):
    help = 'Seed Module 2 demo data: assessments, findings, tasks, comments'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Module 2 data...')

        # --- Organizations ---
        org1, _ = Organization.objects.get_or_create(
            name='GlobalMart Retail Ltd',
            defaults={'domain': 'globalmart-retail.com', 'industry': 'Retail'}
        )
        org2, _ = Organization.objects.get_or_create(
            name='ApexBank Financial',
            defaults={'domain': 'apexbank-secure.io', 'industry': 'Finance'}
        )

        # --- Users ---
        assessor, _ = UserProfile.objects.get_or_create(
            username='assessor_ali',
            defaults={
                'email': 'ali.assessor@cybershield.io',
                'name': 'Ali Hassan',
                'password_hash': 'pbkdf2_sha256$demo',
                'role': 'assessor',
                'organization': org1,
            }
        )
        developer, _ = UserProfile.objects.get_or_create(
            username='dev_sara',
            defaults={
                'email': 'sara.dev@globalmart-retail.com',
                'name': 'Sara Ahmed',
                'password_hash': 'pbkdf2_sha256$demo',
                'role': 'developer',
                'organization': org1,
            }
        )
        manager, _ = UserProfile.objects.get_or_create(
            username='manager_karim',
            defaults={
                'email': 'karim.manager@cybershield.io',
                'name': 'Karim Hossain',
                'password_hash': 'pbkdf2_sha256$demo',
                'role': 'manager',
                'organization': org1,
            }
        )
        customer, _ = UserProfile.objects.get_or_create(
            username='customer_globalmart',
            defaults={
                'email': 'security@globalmart-retail.com',
                'name': 'GlobalMart Security Team',
                'password_hash': 'pbkdf2_sha256$demo',
                'role': 'customer',
                'organization': org1,
            }
        )

        # --- Assessment Request (Customer submitted) ---
        req, _ = AssessmentRequest.objects.get_or_create(
            organization='GlobalMart Retail Ltd',
            target_url='https://globalmart-retail.com',
            defaults={
                'contact_name': 'GlobalMart Security Team',
                'contact_email': 'security@globalmart-retail.com',
                'scope_notes': 'Full web application assessment including login, checkout, and admin panels.',
                'compliance_target': 'OWASP Top 10:2021 & PCI DSS 4.0',
                'priority': 'Urgent',
                'status': 'Approved & Scheduled',
            }
        )

        req2, _ = AssessmentRequest.objects.get_or_create(
            organization='ApexBank Financial',
            target_url='https://apexbank-secure.io',
            defaults={
                'contact_name': 'ApexBank IT Security',
                'contact_email': 'itsec@apexbank-secure.io',
                'scope_notes': 'Online banking portal and API endpoints assessment.',
                'compliance_target': 'OWASP Top 10:2021 & NIST CSF 2.0',
                'priority': 'Emergency',
                'status': 'In Progress',
            }
        )

        # --- Assessments ---
        a1, created1 = Assessment.objects.get_or_create(
            title='GlobalMart Q4 2026 Web Application Pentest',
            defaults={
                'target_url': 'https://globalmart-retail.com',
                'target_organization': 'GlobalMart Retail Ltd',
                'assessor': assessor,
                'assessment_request': req,
                'status': 'In Progress',
                'scope_in_urls': 'https://globalmart-retail.com/login\nhttps://globalmart-retail.com/checkout\nhttps://globalmart-retail.com/admin',
                'scope_out_urls': 'https://globalmart-retail.com/static\nhttps://globalmart-retail.com/cdn',
                'authorized_domains': 'globalmart-retail.com\napi.globalmart-retail.com',
                'compliance_framework': 'OWASP Top 10:2021 & PCI DSS 4.0',
                'scheduled_start': timezone.now(),
                'scheduled_end': timezone.now() + datetime.timedelta(days=14),
                'completion_percentage': 45,
            }
        )

        a2, created2 = Assessment.objects.get_or_create(
            title='ApexBank Online Banking Security Audit',
            defaults={
                'target_url': 'https://apexbank-secure.io',
                'target_organization': 'ApexBank Financial',
                'assessor': assessor,
                'assessment_request': req2,
                'status': 'Under Review',
                'scope_in_urls': 'https://apexbank-secure.io/portal\nhttps://apexbank-secure.io/api',
                'scope_out_urls': 'https://apexbank-secure.io/legacy',
                'authorized_domains': 'apexbank-secure.io\napi.apexbank-secure.io',
                'compliance_framework': 'OWASP Top 10:2021 & NIST CSF 2.0',
                'scheduled_start': timezone.now() - datetime.timedelta(days=7),
                'scheduled_end': timezone.now() + datetime.timedelta(days=7),
                'completion_percentage': 80,
            }
        )

        # --- Checklist Items for Assessment 1 ---
        checklist_data = [
            ('A01:2021', 'BAC-001', 'Broken Access Control Test', 'Test for IDOR, missing authorization checks on sensitive endpoints.', 'Access /admin without credentials. Access other users data via ID manipulation.', 'All sensitive endpoints must require authentication and authorization.'),
            ('A02:2021', 'CF-001', 'SSL/TLS Configuration Check', 'Verify TLS version, certificate validity, and cipher strength.', 'Test with sslscan and sslyze. Check for TLS 1.0/1.1 support.', 'TLS 1.2+ only. Certificate valid. No weak ciphers.'),
            ('A03:2021', 'INJ-001', 'SQL Injection Test', 'Test all input fields and URL parameters for SQL injection vulnerabilities.', 'Use sqlmap on login form, search box, and product filters.', 'No SQL injection possible. Parameterized queries used.'),
            ('A05:2021', 'MISC-001', 'Security Headers Audit', 'Check for HSTS, CSP, X-Frame-Options, X-Content-Type-Options headers.', 'Scan HTTP response headers using curl or browser DevTools.', 'All critical security headers present and correctly configured.'),
            ('A07:2021', 'AUTH-001', 'Authentication Mechanism Test', 'Test login for brute-force protection, session management, and logout.', 'Attempt 10+ failed logins. Verify session token invalidation on logout.', 'Account lockout after 5 attempts. Secure session handling.'),
            ('A10:2021', 'SSRF-001', 'SSRF Protection Verification', 'Verify that server-side requests cannot be redirected to internal resources.', 'Submit internal IPs (127.0.0.1, 192.168.x.x) in URL input fields.', 'All private IP ranges blocked. HTTP 403 returned for internal targets.'),
        ]

        checklist_items = []
        for cat, ctrl, title, desc, proc, outcome in checklist_data:
            item, _ = ChecklistItem.objects.get_or_create(
                assessment=a1, control_id=ctrl,
                defaults={'category': cat, 'title': title, 'description': desc, 'test_procedure': proc, 'expected_outcome': outcome}
            )
            checklist_items.append(item)

        # --- Checklist Audit Records (verdicts) ---
        verdicts = ['Fail', 'Pass', 'Fail', 'Fail', 'Pass', 'Pass']
        notes_list = [
            'IDOR vulnerability found in /api/orders/{id} endpoint.',
            'TLS 1.3 configured. Certificate valid until 2027.',
            'SQL injection confirmed on /search?q= parameter.',
            'HSTS header missing. CSP header absent.',
            'Account lockout works after 5 attempts.',
            'SSRF guard blocks private IPs correctly.',
        ]
        for item, verdict, note in zip(checklist_items, verdicts, notes_list):
            ChecklistAuditRecord.objects.get_or_create(
                checklist_item=item,
                defaults={'assessor': assessor, 'verdict': verdict, 'assessor_notes': note}
            )

        # --- Findings ---
        findings_data = [
            {
                'title': 'Insecure Direct Object Reference in Order API',
                'description': 'The /api/orders/{id} endpoint does not verify that the requesting user owns the order. Any authenticated user can access any order by changing the ID.',
                'affected_endpoint': 'https://globalmart-retail.com/api/orders/{id}',
                'evidence_steps': '1. Login as User A.\n2. Place an order and note order ID.\n3. Login as User B.\n4. Access /api/orders/{User_A_order_id}.\n5. Full order details returned — IDOR confirmed.',
                'likelihood': 4, 'impact': 4, 'status': 'In Remediation',
            },
            {
                'title': 'SQL Injection in Product Search Parameter',
                'description': 'The search parameter ?q= is not sanitized and allows SQL injection via UNION-based attack.',
                'affected_endpoint': 'https://globalmart-retail.com/search?q=',
                'evidence_steps': "1. Navigate to search.\n2. Enter: ' UNION SELECT username,password FROM users--\n3. Database credentials returned in response.",
                'likelihood': 5, 'impact': 5, 'status': 'Open',
            },
            {
                'title': 'Missing Security Headers (HSTS, CSP)',
                'description': 'HTTP Strict-Transport-Security and Content-Security-Policy headers are absent from all HTTP responses.',
                'affected_endpoint': 'https://globalmart-retail.com/',
                'evidence_steps': '1. curl -I https://globalmart-retail.com\n2. No Strict-Transport-Security header found.\n3. No Content-Security-Policy header found.',
                'likelihood': 3, 'impact': 3, 'status': 'Retest Requested',
            },
            {
                'title': 'Sensitive Data Exposure via Server Banner',
                'description': 'The Server response header reveals Apache/2.4.41 (Ubuntu). This exposes version information useful for targeted exploits.',
                'affected_endpoint': 'https://globalmart-retail.com/',
                'evidence_steps': '1. curl -I https://globalmart-retail.com\n2. Server: Apache/2.4.41 (Ubuntu) disclosed.',
                'likelihood': 2, 'impact': 2, 'status': 'Resolved',
            },
            {
                'title': 'Session Token Not Invalidated on Logout',
                'description': 'After logout, the session token remains valid server-side and can still be used to access authenticated endpoints.',
                'affected_endpoint': 'https://globalmart-retail.com/api/auth/logout',
                'evidence_steps': '1. Login and copy session token.\n2. Logout.\n3. Use copied token in Authorization header.\n4. API returns 200 OK — token still valid.',
                'likelihood': 3, 'impact': 4, 'status': 'Open',
            },
        ]

        created_findings = []
        for fd in findings_data:
            f, _ = Finding.objects.get_or_create(
                assessment=a1,
                title=fd['title'],
                defaults={
                    'description': fd['description'],
                    'affected_endpoint': fd['affected_endpoint'],
                    'evidence_steps': fd['evidence_steps'],
                    'likelihood': fd['likelihood'],
                    'impact': fd['impact'],
                    'status': fd['status'],
                    'logged_by': assessor,
                    'assigned_developer': developer,
                    'target_resolution_date': (timezone.now() + datetime.timedelta(days=7)).date(),
                }
            )
            created_findings.append(f)

        # --- Remediation Evidence for Finding 1 (IDOR) ---
        if created_findings:
            f_idor = created_findings[0]
            ev, _ = RemediationEvidence.objects.get_or_create(
                finding=f_idor,
                defaults={
                    'developer': developer,
                    'fix_summary': 'Added ownership check in OrderViewSet.get_queryset() to filter by request.user.',
                    'patch_notes': 'Modified GET /api/orders/{id} to validate order.user == request.user before returning data.',
                    'configuration_changes': '',
                    'pull_request_url': 'https://github.com/globalmart/backend/pull/142',
                    'status': 'Under Review',
                    'retest_requested': True,
                }
            )

            # Retest verification for finding 3 (headers - already retest requested)
            f_headers = created_findings[2]
            RetestVerification.objects.get_or_create(
                finding=f_headers,
                defaults={
                    'assessor': assessor,
                    'verdict': 'Partially Fixed',
                    'verification_notes': 'HSTS header added but CSP still missing. Reopening partially.',
                    'business_impact_summary': 'Missing CSP exposes users to XSS attacks. HSTS absence allows SSL stripping.',
                    'exploitation_scenario': 'Attacker on same network performs SSL stripping attack via MITM. CSP absence allows injected scripts.',
                    'cvss_score': '6.5',
                }
            )

        # --- Remediation Tasks ---
        today = timezone.now().date()
        task_data = [
            (created_findings[1], 'Fix SQL Injection in Search Endpoint', developer, manager, 'Critical', today + datetime.timedelta(days=2)),
            (created_findings[0], 'Fix IDOR in Order API', developer, manager, 'High', today + datetime.timedelta(days=3)),
            (created_findings[2], 'Add CSP Security Header', developer, manager, 'Medium', today - datetime.timedelta(days=1)),  # overdue
            (created_findings[4], 'Invalidate Session on Logout', developer, manager, 'High', today + datetime.timedelta(days=5)),
        ]
        for finding, title, assigned_to, assigned_by, priority, deadline in task_data:
            RemediationTask.objects.get_or_create(
                finding=finding,
                title=title,
                defaults={
                    'assigned_to': assigned_to,
                    'assigned_by': assigned_by,
                    'priority': priority,
                    'target_deadline': deadline,
                    'status': 'Assigned',
                    'is_overdue': deadline < today,
                }
            )

        # --- Retest Notes ---
        if created_findings:
            RetestNote.objects.get_or_create(
                finding=created_findings[2],
                attempt_number=1,
                defaults={
                    'outcome': 'Partially Fixed',
                    'assessor_feedback': 'HSTS header is now present. However, Content-Security-Policy is still missing from all responses.',
                    'next_action': 'Developer must add CSP header with appropriate policy directives.',
                    'recorded_by': assessor,
                }
            )

        # --- Finding Comments ---
        comment_data = [
            (created_findings[1], assessor, 'SQL injection is confirmed with UNION attack. Priority is Critical — needs immediate patch.', False),
            (created_findings[1], developer, 'Understood. Will switch all raw queries to parameterized statements in search_service.py.', False),
            (created_findings[1], assessor, 'Also check the product filter API endpoint — same pattern may exist there.', True),
            (created_findings[0], developer, 'PR submitted. Added ownership filter in get_queryset(). Please review.', False),
        ]
        for finding, author, text, is_question in comment_data:
            FindingComment.objects.get_or_create(
                finding=finding,
                author=author,
                comment_text=text,
                defaults={'is_question': is_question}
            )

        # Update assessment completion
        a1.completion_percentage = 45
        a1.save()
        a2.completion_percentage = 80
        a2.save()

        self.stdout.write(self.style.SUCCESS(
            f'Module 2 seed data created:\n'
            f'  - 2 Organizations\n'
            f'  - 4 Users (assessor, developer, manager, customer)\n'
            f'  - 2 Assessment Requests\n'
            f'  - 2 Assessments\n'
            f'  - {len(checklist_items)} Checklist Items with Audit Records\n'
            f'  - {len(created_findings)} Findings\n'
            f'  - 1 Remediation Evidence\n'
            f'  - 1 Retest Verification\n'
            f'  - 4 Remediation Tasks (1 overdue)\n'
            f'  - 1 Retest Note\n'
            f'  - 4 Finding Comments\n'
        ))

