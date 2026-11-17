import datetime
import jwt
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

import datetime as dt
from .models import (
    ScanRecord, ScanAuditLog, AssessmentRequest, UserProfile, Organization,
    Assessment, ChecklistItem, Finding, ChecklistAuditRecord,
    RemediationEvidence, RetestVerification,
    RemediationTask, RetestNote, FindingComment, AssessmentArchive
)
from .serializers import (
    ScanInputSerializer, 
    ScanRecordSerializer, 
    ScanAuditLogSerializer, 
    AssessmentRequestSerializer, 
    UserProfileSerializer
)
from .scanner import validate_target_url, execute_automated_security_checks

JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = 'HS256'

def generate_jwt_token(user: UserProfile) -> str:
    """
    FR-1.1: Issue HMAC-SHA256 signed JWT with role claims and 60-min expiry.
    """
    payload = {
        'sub': str(user.id),
        'username': user.username,
        'email': user.email,
        'name': user.name,
        'role': user.role,
        'org': user.organization.name if user.organization else 'General Public',
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=60),
        'iat': datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

class HealthCheckView(APIView):
    def get(self, request):
        return Response({
            'status': 'HEALTHY',
            'service': 'CyberShield Security Scanner API',
            'framework': 'Django REST Framework',
            'module': 'Module 1: Website Submission, Basic Security Report & User Management',
            'version': '2.4.0',
            'architecture': 'RESTful API with JWT & Safe Concurrent Scanner'
        })

class ScanTargetView(APIView):
    """
    FR-1.3: Develop POST /api/scan with RFC 3986 URL validation and private IP rejection.
    FR-1.4: Execute concurrent safe checks.
    FR-1.5: Calculate security score (0-100) and letter grades.
    FR-1.6: Generate tailored remediation configuration snippets.
    FR-1.7: Store scan metadata, findings JSON, and audit events.
    """
    def post(self, request):
        serializer = ScanInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        raw_url = serializer.validated_data['url']
        user_name = serializer.validated_data.get('user_name', 'System User')
        role = serializer.validated_data.get('role', 'customer')

        # FR-1.3: URL Validation & Private IP Blocking
        is_valid, normalized_url, hostname, err_msg = validate_target_url(raw_url)
        if not is_valid:
            if 'prohibited private' in err_msg or 'RFC 3986' in err_msg:
                # FR-1.3 RFC 3986 SSRF Protection: HTTP 403 Forbidden
                return Response({
                    'error': 'Forbidden Target: Private / loopback IP address blocked.',
                    'details': err_msg,
                    'code': 'HTTP_403_PROHIBITED_TARGET'
                }, status=status.HTTP_403_FORBIDDEN)
            return Response({
                'error': 'Invalid URL Format or DNS Resolution Failed',
                'details': err_msg
            }, status=status.HTTP_400_BAD_REQUEST)

        # FR-1.4 & FR-1.5: Execute Safe Checks & Compute Score
        scan_results = execute_automated_security_checks(normalized_url, hostname)

        # FR-1.7: Store in Database
        scan_record = ScanRecord.objects.create(
            url=normalized_url,
            hostname=hostname,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            score=scan_results['score'],
            letter_grade=scan_results['letter_grade'],
            grade_label=scan_results['grade_label'],
            response_status=scan_results['response_status'],
            ssl_info=scan_results['ssl_info'],
            checks_data=scan_results['checks'],
            findings_data=scan_results['findings'],
            severity_counts=scan_results['severity_counts']
        )

        # Store Audit Log
        ScanAuditLog.objects.create(
            user_name=user_name,
            role=role,
            action='BASIC_SCAN_EXECUTED',
            target_url=normalized_url,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details=f"Automated security check executed. Score: {scan_record.score} ({scan_record.letter_grade}). Found {len(scan_results['findings'])} potential issues."
        )

        return Response({
            'id': str(scan_record.id),
            'url': scan_record.url,
            'hostname': scan_record.hostname,
            'score': scan_record.score,
            'grade': scan_record.letter_grade,
            'grade_label': scan_record.grade_label,
            'response_status': scan_record.response_status,
            'ssl_info': scan_record.ssl_info,
            'checks': scan_record.checks_data,
            'findings': scan_record.findings_data,
            'severity_counts': scan_record.severity_counts,
            'scanned_at': scan_record.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)

class ScanHistoryView(APIView):
    """
    FR-1.12: Scan history management.
    """
    def get(self, request):
        scans = ScanRecord.objects.all()[:20]
        results = []
        for s in scans:
            results.append({
                'id': str(s.id),
                'url': s.url,
                'hostname': s.hostname,
                'score': s.score,
                'grade': s.letter_grade,
                'grade_label': s.grade_label,
                'response_status': s.response_status,
                'severity_counts': s.severity_counts,
                'scanned_at': s.created_at.isoformat()
            })
        return Response(results)

class ScanDetailView(APIView):
    def get(self, request, scan_id):
        try:
            s = ScanRecord.objects.get(id=scan_id)
            return Response({
                'id': str(s.id),
                'url': s.url,
                'hostname': s.hostname,
                'score': s.score,
                'grade': s.letter_grade,
                'grade_label': s.grade_label,
                'response_status': s.response_status,
                'ssl_info': s.ssl_info,
                'checks': s.checks_data,
                'findings': s.findings_data,
                'severity_counts': s.severity_counts,
                'scanned_at': s.created_at.isoformat()
            })
        except ScanRecord.DoesNotExist:
            return Response({'error': 'Scan record not found'}, status=status.HTTP_404_NOT_FOUND)

class AssessmentRequestView(APIView):
    """
    FR-1.13: Request Full Security Assessment CTA conversion.
    """
    def post(self, request):
        serializer = AssessmentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        req_obj = serializer.save()

        # Log conversion audit
        ScanAuditLog.objects.create(
            user_name=req_obj.contact_name,
            role='customer',
            action='FULL_ASSESSMENT_REQUESTED',
            target_url=req_obj.target_url,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details=f"Inbound assessment inquiry registered for {req_obj.organization} under {req_obj.compliance_target}."
        )

        return Response({
            'id': str(req_obj.id),
            'organization': req_obj.organization,
            'target_url': req_obj.target_url,
            'status': req_obj.status,
            'message': 'Full assessment request queued successfully. The assessor team will review your target.'
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        reqs = AssessmentRequest.objects.all()[:20]
        return Response(AssessmentRequestSerializer(reqs, many=True).data)

    def patch(self, request):
        req_id = request.data.get('id')
        new_status = request.data.get('status')
        if not req_id or not new_status:
            return Response({'error': 'id and status required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            req_obj = AssessmentRequest.objects.get(id=req_id)
            req_obj.status = new_status
            req_obj.save()
            
            # Log status change audit
            ScanAuditLog.objects.create(
                user_name=request.data.get('user_name', 'Security Manager'),
                role=request.data.get('role', 'manager'),
                action='ASSESSMENT_STATUS_UPDATED',
                target_url=req_obj.target_url,
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
                details=f"Assessment request status for {req_obj.organization} updated to '{new_status}'."
            )
            return Response(AssessmentRequestSerializer(req_obj).data)
        except AssessmentRequest.DoesNotExist:
            return Response({'error': 'Assessment request not found'}, status=status.HTTP_404_NOT_FOUND)

class AuthLoginView(APIView):
    """
    FR-1.1: Authenticate users via role or credentials; issue HMAC-SHA256 signed JWT with role claims and 60-min expiry.
    """
    def post(self, request):
        username = request.data.get('username')
        role_req = request.data.get('role')
        password = request.data.get('password')

        user = None
        if role_req:
            user = UserProfile.objects.filter(role=role_req).first()
        
        if not user and username:
            user = UserProfile.objects.filter(username=username).first() or \
                   UserProfile.objects.filter(email=username).first() or \
                   UserProfile.objects.filter(role=username).first()

        if not user:
            # Fallback: create demo user
            target_name = username or role_req or 'guest'
            org, _ = Organization.objects.get_or_create(name='GlobalMart Retail Ltd', domain='globalmart-retail.com')
            user = UserProfile.objects.create(
                username=target_name,
                email=f"{target_name}@example.com",
                name=target_name.replace('_', ' ').title(),
                password_hash='pbkdf2_sha256$test$hashed',
                role=role_req if role_req in ['customer', 'assessor', 'developer', 'manager', 'admin'] else 'customer',
                organization=org
            )

        token = generate_jwt_token(user)
        
        # Log auth event
        ScanAuditLog.objects.create(
            user_name=user.name,
            role=user.role,
            action='USER_LOGIN_SUCCESS',
            target_url='http://localhost:8000/api/auth/login',
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details=f"User {user.name} ({user.role}) authenticated successfully."
        )

        return Response({
            'token': token,
            'user': UserProfileSerializer(user).data,
            'expires_in_minutes': 60
        })

class UserListView(APIView):
    """
    FR-1.2: Admin RBAC User Management.
    """
    def get(self, request):
        users = UserProfile.objects.all().order_by('created_at')
        return Response(UserProfileSerializer(users, many=True).data)

    def post(self, request):
        # Update user role (Admin feature)
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')
        if not user_id or not new_role:
            return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = UserProfile.objects.get(id=user_id)
            old_role = user.role
            user.role = new_role
            user.save()

            ScanAuditLog.objects.create(
                user_name=request.data.get('admin_name', 'Security Administrator'),
                role='admin',
                action='USER_ROLE_CHANGED',
                target_url='http://localhost:8000/api/users',
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
                details=f"User {user.name} role changed from '{old_role}' to '{new_role}'."
            )
            return Response(UserProfileSerializer(user).data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class CurrentUserView(APIView):
    """
    FR-1.2: Validate token & return user profile and RBAC role.
    """
    def get(self, request):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                return Response({
                    'authenticated': True,
                    'user': payload
                })
            except jwt.ExpiredSignatureError:
                return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
            except jwt.InvalidTokenError:
                return Response({'error': 'Invalid token signature'}, status=status.HTTP_401_UNAUTHORIZED)

        # Default fallback persona
        user = UserProfile.objects.first()
        if user:
            return Response({
                'authenticated': True,
                'user': UserProfileSerializer(user).data
            })
        return Response({'authenticated': False})

class AuditLogListView(APIView):
    """
    FR-1.7: Query audit records.
    """
    def get(self, request):
        logs = ScanAuditLog.objects.all()[:30]
        return Response(ScanAuditLogSerializer(logs, many=True).data)


# =============================================================================
# MODULE 2 VIEWS: Full Security Assessment, Findings, Risk & Remediation
# =============================================================================

# --- MD. ABU NAYEM (232-35-332) --- FR-2.1 to FR-2.6 ---

class AssessmentSetupView(APIView):
    """
    FR-2.1: Assessment Setup — Create, configure, and schedule assessment projects.
    FR-2.6: Assessment Scope Definition — Define testing boundaries and authorized assets.
    """
    def get(self, request):
        assessments = Assessment.objects.all()[:30]
        result = []
        for a in assessments:
            result.append({
                'id': str(a.id),
                'title': a.title,
                'target_url': a.target_url,
                'target_organization': a.target_organization,
                'status': a.status,
                'compliance_framework': a.compliance_framework,
                'completion_percentage': a.completion_percentage,
                'scope_in_urls': a.scope_in_urls,
                'scope_out_urls': a.scope_out_urls,
                'authorized_domains': a.authorized_domains,
                'scheduled_start': a.scheduled_start.isoformat() if a.scheduled_start else None,
                'scheduled_end': a.scheduled_end.isoformat() if a.scheduled_end else None,
                'created_at': a.created_at.isoformat(),
            })
        return Response(result)

    def post(self, request):
        title = request.data.get('title')
        target_url = request.data.get('target_url')
        target_org = request.data.get('target_organization', '')
        scope_in = request.data.get('scope_in_urls', '')
        scope_out = request.data.get('scope_out_urls', '')
        authorized = request.data.get('authorized_domains', '')
        compliance = request.data.get('compliance_framework', 'OWASP Top 10:2021 & NIST CSF 2.0')
        scheduled_start = request.data.get('scheduled_start')
        scheduled_end = request.data.get('scheduled_end')

        if not title or not target_url:
            return Response({'error': 'title and target_url are required'}, status=status.HTTP_400_BAD_REQUEST)

        a = Assessment.objects.create(
            title=title,
            target_url=target_url,
            target_organization=target_org,
            scope_in_urls=scope_in,
            scope_out_urls=scope_out,
            authorized_domains=authorized,
            compliance_framework=compliance,
            scheduled_start=scheduled_start if scheduled_start else None,
            scheduled_end=scheduled_end if scheduled_end else None,
        )

        ScanAuditLog.objects.create(
            user_name=request.data.get('assessor_name', 'Security Assessor'),
            role='assessor',
            action='ASSESSMENT_CREATED',
            target_url=target_url,
            details=f"Assessment '{title}' created for {target_org} under {compliance}."
        )

        return Response({
            'id': str(a.id),
            'title': a.title,
            'status': a.status,
            'message': 'Assessment project created and configured successfully.'
        }, status=status.HTTP_201_CREATED)

    def patch(self, request):
        assessment_id = request.data.get('id')
        if not assessment_id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            a = Assessment.objects.get(id=assessment_id)
            for field in ['title', 'status', 'scope_in_urls', 'scope_out_urls',
                          'authorized_domains', 'compliance_framework', 'completion_percentage']:
                if field in request.data:
                    setattr(a, field, request.data[field])
            a.save()
            return Response({'id': str(a.id), 'status': a.status, 'completion_percentage': a.completion_percentage})
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)


class ChecklistView(APIView):
    """
    FR-2.2: Standard Security Checklist — Evaluate against OWASP Top 10:2021 & NIST CSF 2.0.
    """
    def get(self, request):
        assessment_id = request.query_params.get('assessment_id')
        if not assessment_id:
            return Response({'error': 'assessment_id query param required'}, status=status.HTTP_400_BAD_REQUEST)
        items = ChecklistItem.objects.filter(assessment_id=assessment_id)
        result = [{
            'id': str(i.id),
            'category': i.category,
            'control_id': i.control_id,
            'title': i.title,
            'description': i.description,
            'test_procedure': i.test_procedure,
            'expected_outcome': i.expected_outcome,
        } for i in items]
        return Response(result)

    def post(self, request):
        assessment_id = request.data.get('assessment_id')
        if not assessment_id:
            return Response({'error': 'assessment_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

        item = ChecklistItem.objects.create(
            assessment=assessment,
            category=request.data.get('category', 'A01:2021'),
            control_id=request.data.get('control_id', 'CTL-001'),
            title=request.data.get('title', ''),
            description=request.data.get('description', ''),
            test_procedure=request.data.get('test_procedure', ''),
            expected_outcome=request.data.get('expected_outcome', ''),
        )
        return Response({
            'id': str(item.id),
            'control_id': item.control_id,
            'title': item.title,
        }, status=status.HTTP_201_CREATED)


class FindingView(APIView):
    """
    FR-2.3: Finding Creation — Log vulnerabilities with titles, descriptions, endpoints, evidence.
    FR-2.4: Risk Level Calculation — Auto-calculate 5x5 risk score and severity.
    FR-2.5: Finding Status Tracking — Track lifecycle from open through closure.
    """
    def get(self, request):
        assessment_id = request.query_params.get('assessment_id')
        severity_filter = request.query_params.get('severity')
        status_filter = request.query_params.get('status')

        qs = Finding.objects.all()
        if assessment_id:
            qs = qs.filter(assessment_id=assessment_id)
        if severity_filter:
            qs = qs.filter(severity=severity_filter)
        if status_filter:
            qs = qs.filter(status=status_filter)

        result = [{
            'id': str(f.id),
            'title': f.title,
            'description': f.description,
            'affected_endpoint': f.affected_endpoint,
            'likelihood': f.likelihood,
            'impact': f.impact,
            'risk_score': f.risk_score,
            'severity': f.severity,
            'status': f.status,
            'target_resolution_date': f.target_resolution_date.isoformat() if f.target_resolution_date else None,
            'created_at': f.created_at.isoformat(),
        } for f in qs[:50]]
        return Response(result)

    def post(self, request):
        assessment_id = request.data.get('assessment_id')
        if not assessment_id:
            return Response({'error': 'assessment_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

        f = Finding(
            assessment=assessment,
            title=request.data.get('title', ''),
            description=request.data.get('description', ''),
            affected_endpoint=request.data.get('affected_endpoint', ''),
            evidence_steps=request.data.get('evidence_steps', ''),
            likelihood=int(request.data.get('likelihood', 3)),
            impact=int(request.data.get('impact', 3)),
            status='Open',
        )
        f.save()  # auto-calculates risk_score and severity

        ScanAuditLog.objects.create(
            user_name=request.data.get('assessor_name', 'Security Assessor'),
            role='assessor',
            action='FINDING_LOGGED',
            target_url=assessment.target_url,
            details=f"Finding '{f.title}' logged. Risk Score: {f.risk_score} ({f.severity})."
        )

        return Response({
            'id': str(f.id),
            'title': f.title,
            'risk_score': f.risk_score,
            'severity': f.severity,
            'status': f.status,
        }, status=status.HTTP_201_CREATED)

    def patch(self, request):
        finding_id = request.data.get('id')
        if not finding_id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            f = Finding.objects.get(id=finding_id)
            for field in ['status', 'likelihood', 'impact', 'target_resolution_date', 'evidence_steps']:
                if field in request.data:
                    setattr(f, field, request.data[field])
            f.save()
            return Response({'id': str(f.id), 'status': f.status, 'risk_score': f.risk_score, 'severity': f.severity})
        except Finding.DoesNotExist:
            return Response({'error': 'Finding not found'}, status=status.HTTP_404_NOT_FOUND)


# --- OVIJEET SAHA (232-35-457) --- FR-2.7 to FR-2.12 ---

class ChecklistAuditConsoleView(APIView):
    """
    FR-2.7: Interactive Audit Checklist Console — Record pass/fail/N-A verdicts with progress.
    """
    def get(self, request):
        assessment_id = request.query_params.get('assessment_id')
        if not assessment_id:
            return Response({'error': 'assessment_id required'}, status=status.HTTP_400_BAD_REQUEST)

        items = ChecklistItem.objects.filter(assessment_id=assessment_id)
        total = items.count()
        result = []
        pass_count = fail_count = na_count = pending_count = 0

        for item in items:
            audit = ChecklistAuditRecord.objects.filter(checklist_item=item).first()
            verdict = audit.verdict if audit else 'Pending'
            if verdict == 'Pass':
                pass_count += 1
            elif verdict == 'Fail':
                fail_count += 1
            elif verdict == 'Not Applicable':
                na_count += 1
            else:
                pending_count += 1

            result.append({
                'checklist_item_id': str(item.id),
                'control_id': item.control_id,
                'category': item.category,
                'title': item.title,
                'verdict': verdict,
                'assessor_notes': audit.assessor_notes if audit else '',
                'recorded_at': audit.recorded_at.isoformat() if audit else None,
            })

        progress_pct = round(((pass_count + fail_count + na_count) / total * 100) if total > 0 else 0)
        return Response({
            'total': total,
            'progress_percentage': progress_pct,
            'pass': pass_count,
            'fail': fail_count,
            'not_applicable': na_count,
            'pending': pending_count,
            'items': result,
        })

    def post(self, request):
        item_id = request.data.get('checklist_item_id')
        verdict = request.data.get('verdict')
        if not item_id or not verdict:
            return Response({'error': 'checklist_item_id and verdict required'}, status=status.HTTP_400_BAD_REQUEST)
        if verdict not in ['Pass', 'Fail', 'Not Applicable', 'Pending']:
            return Response({'error': 'verdict must be Pass, Fail, Not Applicable, or Pending'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = ChecklistItem.objects.get(id=item_id)
        except ChecklistItem.DoesNotExist:
            return Response({'error': 'Checklist item not found'}, status=status.HTTP_404_NOT_FOUND)

        record, _ = ChecklistAuditRecord.objects.update_or_create(
            checklist_item=item,
            defaults={
                'verdict': verdict,
                'assessor_notes': request.data.get('assessor_notes', ''),
                'evidence_reference': request.data.get('evidence_reference', ''),
            }
        )
        return Response({
            'checklist_item_id': str(item.id),
            'control_id': item.control_id,
            'verdict': record.verdict,
            'recorded_at': record.recorded_at.isoformat(),
        }, status=status.HTTP_200_OK)


class VulnerabilitySearchView(APIView):
    """
    FR-2.8: Vulnerability Search & Filter — Search, filter, and sort findings by
    severity, status, affected module, and discovery date.
    """
    def get(self, request):
        qs = Finding.objects.all()

        q = request.query_params.get('q')
        severity = request.query_params.get('severity')
        finding_status = request.query_params.get('status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        sort_by = request.query_params.get('sort_by', '-risk_score')

        if q:
            from django.db.models import Q as DQ
            qs = qs.filter(
                DQ(title__icontains=q) |
                DQ(description__icontains=q) |
                DQ(affected_endpoint__icontains=q)
            )
        if severity:
            qs = qs.filter(severity=severity)
        if finding_status:
            qs = qs.filter(status=finding_status)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        allowed_sorts = ['risk_score', '-risk_score', 'created_at', '-created_at', 'severity', 'status']
        if sort_by not in allowed_sorts:
            sort_by = '-risk_score'
        qs = qs.order_by(sort_by)

        result = [{
            'id': str(f.id),
            'title': f.title,
            'affected_endpoint': f.affected_endpoint,
            'severity': f.severity,
            'status': f.status,
            'risk_score': f.risk_score,
            'created_at': f.created_at.isoformat(),
        } for f in qs[:50]]

        return Response({
            'count': len(result),
            'findings': result,
        })


class RemediationEvidenceView(APIView):
    """
    FR-2.9: Remediation Evidence Submission — Submit fix details and PR links.
    FR-2.10: Retest Verification Request — Request formal re-testing after fix.
    """
    def get(self, request):
        finding_id = request.query_params.get('finding_id')
        if not finding_id:
            return Response({'error': 'finding_id query param required'}, status=status.HTTP_400_BAD_REQUEST)
        evidence = RemediationEvidence.objects.filter(finding_id=finding_id)
        result = [{
            'id': str(e.id),
            'fix_summary': e.fix_summary,
            'pull_request_url': e.pull_request_url,
            'status': e.status,
            'retest_requested': e.retest_requested,
            'submitted_at': e.submitted_at.isoformat(),
        } for e in evidence]
        return Response(result)

    def post(self, request):
        finding_id = request.data.get('finding_id')
        fix_summary = request.data.get('fix_summary')
        if not finding_id or not fix_summary:
            return Response({'error': 'finding_id and fix_summary required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            finding = Finding.objects.get(id=finding_id)
        except Finding.DoesNotExist:
            return Response({'error': 'Finding not found'}, status=status.HTTP_404_NOT_FOUND)

        evidence = RemediationEvidence.objects.create(
            finding=finding,
            fix_summary=fix_summary,
            patch_notes=request.data.get('patch_notes', ''),
            configuration_changes=request.data.get('configuration_changes', ''),
            pull_request_url=request.data.get('pull_request_url', ''),
            additional_references=request.data.get('additional_references', ''),
            retest_requested=request.data.get('retest_requested', False),
        )

        if evidence.retest_requested:
            finding.status = 'Retest Requested'
            finding.save()

        return Response({
            'id': str(evidence.id),
            'status': evidence.status,
            'retest_requested': evidence.retest_requested,
            'message': 'Remediation evidence submitted successfully.'
        }, status=status.HTTP_201_CREATED)


class RetestVerificationView(APIView):
    """
    FR-2.11: Assessor Verification Verdict — Review evidence and mark resolved or reopened.
    FR-2.12: Vulnerability Impact Details View — Business impact and exploitation details.
    """
    def get(self, request):
        finding_id = request.query_params.get('finding_id')
        if not finding_id:
            return Response({'error': 'finding_id required'}, status=status.HTTP_400_BAD_REQUEST)
        verifications = RetestVerification.objects.filter(finding_id=finding_id)
        result = [{
            'id': str(v.id),
            'verdict': v.verdict,
            'verification_notes': v.verification_notes,
            'business_impact_summary': v.business_impact_summary,
            'exploitation_scenario': v.exploitation_scenario,
            'cvss_score': str(v.cvss_score) if v.cvss_score else None,
            'verified_at': v.verified_at.isoformat(),
        } for v in verifications]
        return Response(result)

    def post(self, request):
        finding_id = request.data.get('finding_id')
        verdict = request.data.get('verdict')
        if not finding_id or not verdict:
            return Response({'error': 'finding_id and verdict required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            finding = Finding.objects.get(id=finding_id)
        except Finding.DoesNotExist:
            return Response({'error': 'Finding not found'}, status=status.HTTP_404_NOT_FOUND)

        v = RetestVerification.objects.create(
            finding=finding,
            verdict=verdict,
            verification_notes=request.data.get('verification_notes', ''),
            business_impact_summary=request.data.get('business_impact_summary', ''),
            exploitation_scenario=request.data.get('exploitation_scenario', ''),
            cvss_score=request.data.get('cvss_score'),
        )

        # Update finding status based on verdict
        status_map = {
            'Resolved': 'Resolved',
            'Reopened': 'Reopened',
            'Partially Fixed': 'In Remediation',
        }
        if verdict in status_map:
            finding.status = status_map[verdict]
            finding.save()

        ScanAuditLog.objects.create(
            user_name=request.data.get('assessor_name', 'Security Assessor'),
            role='assessor',
            action='RETEST_VERDICT_ISSUED',
            target_url=finding.assessment.target_url,
            details=f"Finding '{finding.title}' retest verdict: {verdict}."
        )

        return Response({
            'id': str(v.id),
            'verdict': v.verdict,
            'finding_status': finding.status,
        }, status=status.HTTP_201_CREATED)


# --- ATIYA KHANM LUCKY (232-35-422) --- FR-2.13 to FR-2.18 ---

class AssessmentProgressView(APIView):
    """
    FR-2.13: Assessment Progress Monitoring — Track completion percentage, pending checks,
    and milestone progress.
    """
    def get(self, request):
        assessment_id = request.query_params.get('assessment_id')
        if not assessment_id:
            return Response({'error': 'assessment_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            a = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

        total_findings = Finding.objects.filter(assessment=a).count()
        resolved = Finding.objects.filter(assessment=a, status='Resolved').count()
        open_findings = Finding.objects.filter(assessment=a, status='Open').count()
        in_remediation = Finding.objects.filter(assessment=a, status='In Remediation').count()
        critical = Finding.objects.filter(assessment=a, severity='Critical').count()
        high = Finding.objects.filter(assessment=a, severity='High').count()

        total_checklist = ChecklistItem.objects.filter(assessment=a).count()
        completed_checklist = ChecklistAuditRecord.objects.filter(
            checklist_item__assessment=a
        ).exclude(verdict='Pending').count()

        checklist_progress = round((completed_checklist / total_checklist * 100) if total_checklist > 0 else 0)

        return Response({
            'assessment_id': str(a.id),
            'title': a.title,
            'status': a.status,
            'overall_completion_percentage': a.completion_percentage,
            'checklist_progress_percentage': checklist_progress,
            'findings': {
                'total': total_findings,
                'resolved': resolved,
                'open': open_findings,
                'in_remediation': in_remediation,
                'critical': critical,
                'high': high,
            },
            'milestones': {
                'checklist_complete': checklist_progress == 100,
                'findings_logged': total_findings > 0,
                'all_resolved': total_findings > 0 and resolved == total_findings,
            }
        })


class RemediationTaskView(APIView):
    """
    FR-2.14: Remediation Task Assignment — Assign remediation tasks with deadlines.
    FR-2.17: Overdue Remediation Alerts — Visual indicators for overdue critical tasks.
    """
    def get(self, request):
        import datetime
        today = datetime.date.today()
        qs = RemediationTask.objects.all()

        finding_id = request.query_params.get('finding_id')
        if finding_id:
            qs = qs.filter(finding_id=finding_id)

        # FR-2.17: Mark overdue tasks
        overdue_ids = []
        result = []
        for t in qs[:50]:
            is_overdue = t.target_deadline < today and t.status not in ['Completed']
            if is_overdue and not t.is_overdue:
                t.is_overdue = True
                t.status = 'Overdue'
                t.save()
                overdue_ids.append(str(t.id))
            result.append({
                'id': str(t.id),
                'title': t.title,
                'priority': t.priority,
                'status': t.status,
                'is_overdue': t.is_overdue,
                'target_deadline': t.target_deadline.isoformat(),
                'finding_title': t.finding.title,
                'assigned_to': t.assigned_to.name if t.assigned_to else None,
            })

        return Response({
            'tasks': result,
            'overdue_alerts': len(overdue_ids),
            'overdue_task_ids': overdue_ids,
        })

    def post(self, request):
        finding_id = request.data.get('finding_id')
        title = request.data.get('title')
        deadline = request.data.get('target_deadline')
        if not finding_id or not title or not deadline:
            return Response({'error': 'finding_id, title, and target_deadline required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            finding = Finding.objects.get(id=finding_id)
        except Finding.DoesNotExist:
            return Response({'error': 'Finding not found'}, status=status.HTTP_404_NOT_FOUND)

        task = RemediationTask.objects.create(
            finding=finding,
            title=title,
            instructions=request.data.get('instructions', ''),
            priority=request.data.get('priority', 'Medium'),
            target_deadline=deadline,
        )

        return Response({
            'id': str(task.id),
            'title': task.title,
            'priority': task.priority,
            'target_deadline': task.target_deadline.isoformat(),
        }, status=status.HTTP_201_CREATED)


class RetestNoteView(APIView):
    """
    FR-2.15: Retest History & Notes Log — Chronological record of retest attempts and feedback.
    """
    def get(self, request):
        finding_id = request.query_params.get('finding_id')
        if not finding_id:
            return Response({'error': 'finding_id required'}, status=status.HTTP_400_BAD_REQUEST)
        notes = RetestNote.objects.filter(finding_id=finding_id)
        result = [{
            'id': str(n.id),
            'attempt_number': n.attempt_number,
            'outcome': n.outcome,
            'assessor_feedback': n.assessor_feedback,
            'next_action': n.next_action,
            'recorded_at': n.recorded_at.isoformat(),
        } for n in notes]
        return Response({'finding_id': finding_id, 'retest_history': result})

    def post(self, request):
        finding_id = request.data.get('finding_id')
        outcome = request.data.get('outcome')
        feedback = request.data.get('assessor_feedback', '')
        if not finding_id or not outcome:
            return Response({'error': 'finding_id and outcome required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            finding = Finding.objects.get(id=finding_id)
        except Finding.DoesNotExist:
            return Response({'error': 'Finding not found'}, status=status.HTTP_404_NOT_FOUND)

        attempt_number = RetestNote.objects.filter(finding=finding).count() + 1
        note = RetestNote.objects.create(
            finding=finding,
            attempt_number=attempt_number,
            outcome=outcome,
            assessor_feedback=feedback,
            next_action=request.data.get('next_action', ''),
        )
        return Response({
            'id': str(note.id),
            'attempt_number': note.attempt_number,
            'outcome': note.outcome,
        }, status=status.HTTP_201_CREATED)


class FindingDiscussionView(APIView):
    """
    FR-2.16: Finding Discussion & Collaboration — Exchange comments within vulnerability records.
    """
    def get(self, request):
        finding_id = request.query_params.get('finding_id')
        if not finding_id:
            return Response({'error': 'finding_id required'}, status=status.HTTP_400_BAD_REQUEST)
        comments = FindingComment.objects.filter(finding_id=finding_id)
        result = [{
            'id': str(c.id),
            'author': c.author.name if c.author else 'Unknown',
            'comment_text': c.comment_text,
            'is_question': c.is_question,
            'is_resolved': c.is_resolved,
            'created_at': c.created_at.isoformat(),
        } for c in comments]
        return Response({'finding_id': finding_id, 'comments': result})

    def post(self, request):
        finding_id = request.data.get('finding_id')
        comment_text = request.data.get('comment_text')
        if not finding_id or not comment_text:
            return Response({'error': 'finding_id and comment_text required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            finding = Finding.objects.get(id=finding_id)
        except Finding.DoesNotExist:
            return Response({'error': 'Finding not found'}, status=status.HTTP_404_NOT_FOUND)

        comment = FindingComment.objects.create(
            finding=finding,
            comment_text=comment_text,
            is_question=request.data.get('is_question', False),
        )
        return Response({
            'id': str(comment.id),
            'comment_text': comment.comment_text,
            'is_question': comment.is_question,
        }, status=status.HTTP_201_CREATED)


class AssessmentArchiveView(APIView):
    """
    FR-2.18: Assessment Archival & Closure — Formally finalize and archive completed assessments.
    """
    def get(self, request):
        archives = AssessmentArchive.objects.all()[:20]
        result = [{
            'id': str(a.id),
            'assessment_title': a.assessment.title,
            'total_findings': a.total_findings,
            'resolved_findings': a.resolved_findings,
            'unresolved_findings': a.unresolved_findings,
            'final_risk_score': a.final_risk_score,
            'sign_off_notes': a.sign_off_notes,
            'archived_at': a.archived_at.isoformat(),
        } for a in archives]
        return Response(result)

    def post(self, request):
        assessment_id = request.data.get('assessment_id')
        if not assessment_id:
            return Response({'error': 'assessment_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            a = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

        total_findings = Finding.objects.filter(assessment=a).count()
        resolved_findings = Finding.objects.filter(assessment=a, status='Resolved').count()
        unresolved = total_findings - resolved_findings

        a.status = 'Archived'
        a.completion_percentage = 100
        a.save()

        archive = AssessmentArchive.objects.create(
            assessment=a,
            total_findings=total_findings,
            resolved_findings=resolved_findings,
            unresolved_findings=unresolved,
            final_risk_score=request.data.get('final_risk_score', 0),
            sign_off_notes=request.data.get('sign_off_notes', ''),
        )

        ScanAuditLog.objects.create(
            user_name=request.data.get('manager_name', 'Security Manager'),
            role='manager',
            action='ASSESSMENT_ARCHIVED',
            target_url=a.target_url,
            details=f"Assessment '{a.title}' archived. Total: {total_findings}, Resolved: {resolved_findings}."
        )

        return Response({
            'id': str(archive.id),
            'assessment_title': a.title,
            'status': 'Archived',
            'resolved_findings': resolved_findings,
            'unresolved_findings': unresolved,
            'message': 'Assessment successfully finalized and archived.'
        }, status=status.HTTP_201_CREATED)


