from django.urls import path
from .views import (
    # Module 1
    HealthCheckView,
    ScanTargetView,
    ScanHistoryView,
    ScanDetailView,
    AssessmentRequestView,
    AuthLoginView,
    CurrentUserView,
    AuditLogListView,
    UserListView,
    # Module 2 — MD. ABU NAYEM (FR-2.1 to FR-2.6)
    AssessmentSetupView,
    ChecklistView,
    FindingView,
    # Module 2 — OVIJEET SAHA (FR-2.7 to FR-2.12)
    ChecklistAuditConsoleView,
    VulnerabilitySearchView,
    RemediationEvidenceView,
    RetestVerificationView,
    # Module 2 — ATIYA KHANM LUCKY (FR-2.13 to FR-2.18)
    AssessmentProgressView,
    RemediationTaskView,
    RetestNoteView,
    FindingDiscussionView,
    AssessmentArchiveView,
    # Module 3 — MD. ABU NAYEM (FR-3.1 to FR-3.6)
    ExecutiveDashboardView,
    RiskHeatmapMatrixView,
    AssetSecurityComparisonView,
    ActivityAuditTrailView,
    InboundNotificationView,
    # Module 3 — OVIJEET SAHA (FR-3.7 to FR-3.12)
    VulnerabilityCategoryChartsView,
    HeatmapFilteredFindingsView,
    AssessmentKanbanPipelineView,
    CustomerInquiryApprovalView,
    SecurityPostureTrendsView,
)

urlpatterns = [
    # --- Module 1 ---
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
    path('users', UserListView.as_view(), name='users'),
    path('users/', UserListView.as_view(), name='users_slash'),

    # --- Module 2: MD. ABU NAYEM (FR-2.1 to FR-2.6) ---
    path('assessments', AssessmentSetupView.as_view(), name='assessments'),
    path('assessments/', AssessmentSetupView.as_view(), name='assessments_slash'),
    path('checklist', ChecklistView.as_view(), name='checklist'),
    path('checklist/', ChecklistView.as_view(), name='checklist_slash'),
    path('findings', FindingView.as_view(), name='findings'),
    path('findings/', FindingView.as_view(), name='findings_slash'),

    # --- Module 2: OVIJEET SAHA (FR-2.7 to FR-2.12) ---
    path('checklist-console', ChecklistAuditConsoleView.as_view(), name='checklist_console'),
    path('checklist-console/', ChecklistAuditConsoleView.as_view(), name='checklist_console_slash'),
    path('vulnerability-search', VulnerabilitySearchView.as_view(), name='vulnerability_search'),
    path('vulnerability-search/', VulnerabilitySearchView.as_view(), name='vulnerability_search_slash'),
    path('remediation-evidence', RemediationEvidenceView.as_view(), name='remediation_evidence'),
    path('remediation-evidence/', RemediationEvidenceView.as_view(), name='remediation_evidence_slash'),
    path('retest-verification', RetestVerificationView.as_view(), name='retest_verification'),
    path('retest-verification/', RetestVerificationView.as_view(), name='retest_verification_slash'),

    # --- Module 2: ATIYA KHANM LUCKY (FR-2.13 to FR-2.18) ---
    path('assessment-progress', AssessmentProgressView.as_view(), name='assessment_progress'),
    path('assessment-progress/', AssessmentProgressView.as_view(), name='assessment_progress_slash'),
    path('remediation-tasks', RemediationTaskView.as_view(), name='remediation_tasks'),
    path('remediation-tasks/', RemediationTaskView.as_view(), name='remediation_tasks_slash'),
    path('retest-notes', RetestNoteView.as_view(), name='retest_notes'),
    path('retest-notes/', RetestNoteView.as_view(), name='retest_notes_slash'),
    path('finding-discussion', FindingDiscussionView.as_view(), name='finding_discussion'),
    path('finding-discussion/', FindingDiscussionView.as_view(), name='finding_discussion_slash'),
    path('assessment-archive', AssessmentArchiveView.as_view(), name='assessment_archive'),
    path('assessment-archive/', AssessmentArchiveView.as_view(), name='assessment_archive_slash'),

    # --- Module 3: MD. ABU NAYEM (FR-3.1 to FR-3.6) ---
    path('dashboard/executive', ExecutiveDashboardView.as_view(), name='executive_dashboard'),
    path('dashboard/executive/', ExecutiveDashboardView.as_view(), name='executive_dashboard_slash'),
    path('dashboard/risk-matrix', RiskHeatmapMatrixView.as_view(), name='risk_matrix'),
    path('dashboard/risk-matrix/', RiskHeatmapMatrixView.as_view(), name='risk_matrix_slash'),
    path('dashboard/asset-comparison', AssetSecurityComparisonView.as_view(), name='asset_comparison'),
    path('dashboard/asset-comparison/', AssetSecurityComparisonView.as_view(), name='asset_comparison_slash'),
    path('audit/trail', ActivityAuditTrailView.as_view(), name='audit_trail'),
    path('audit/trail/', ActivityAuditTrailView.as_view(), name='audit_trail_slash'),
    path('notifications/inbound', InboundNotificationView.as_view(), name='inbound_notifications'),
    path('notifications/inbound/', InboundNotificationView.as_view(), name='inbound_notifications_slash'),

    # --- Module 3: OVIJEET SAHA (FR-3.7 to FR-3.12) ---
    path('analytics/vulnerability-categories', VulnerabilityCategoryChartsView.as_view(), name='vulnerability_categories'),
    path('analytics/vulnerability-categories/', VulnerabilityCategoryChartsView.as_view(), name='vulnerability_categories_slash'),
    path('analytics/heatmap-findings', HeatmapFilteredFindingsView.as_view(), name='heatmap_findings'),
    path('analytics/heatmap-findings/', HeatmapFilteredFindingsView.as_view(), name='heatmap_findings_slash'),
    path('inquiries/kanban', AssessmentKanbanPipelineView.as_view(), name='inquiries_kanban'),
    path('inquiries/kanban/', AssessmentKanbanPipelineView.as_view(), name='inquiries_kanban_slash'),
    path('inquiries/approve', CustomerInquiryApprovalView.as_view(), name='inquiry_approve'),
    path('inquiries/approve/', CustomerInquiryApprovalView.as_view(), name='inquiry_approve_slash'),
    path('analytics/posture-trends', SecurityPostureTrendsView.as_view(), name='posture_trends'),
    path('analytics/posture-trends/', SecurityPostureTrendsView.as_view(), name='posture_trends_slash'),
]
