import datetime
import jwt
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import ScanRecord, ScanAuditLog, AssessmentRequest, UserProfile, Organization
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

