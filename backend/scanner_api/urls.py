from django.urls import path
from .views import (
    HealthCheckView,
    ScanTargetView,
    ScanHistoryView,
    ScanDetailView,
    AssessmentRequestView,
    AuthLoginView,
    CurrentUserView,
    AuditLogListView
)

urlpatterns = [
    path('health', HealthCheckView.as_view(), name='health'),
    path('health/', HealthCheckView.as_view(), name='health_slash'),
    path('scan', ScanTargetView.as_view(), name='scan'),
    path('scan/', ScanTargetView.as_view(), name='scan_slash'),
    path('scans', ScanHistoryView.as_view(), name='scan_history'),
    path('scans/', ScanHistoryView.as_view(), name='scan_history_slash'),
    path('scans/<uuid:scan_id>', ScanDetailView.as_view(), name='scan_detail'),
    path('request-assessment', AssessmentRequestView.as_view(), name='request_assessment'),
    path('request-assessment/', AssessmentRequestView.as_view(), name='request_assessment_slash'),
    path('auth/login', AuthLoginView.as_view(), name='auth_login'),
    path('auth/login/', AuthLoginView.as_view(), name='auth_login_slash'),
    path('auth/me', CurrentUserView.as_view(), name='auth_me'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me_slash'),
    path('audit-logs', AuditLogListView.as_view(), name='audit_logs'),
    path('audit-logs/', AuditLogListView.as_view(), name='audit_logs_slash'),
]

