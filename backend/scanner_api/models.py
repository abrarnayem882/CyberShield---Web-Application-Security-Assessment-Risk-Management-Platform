import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    domain = models.CharField(max_length=255)
    industry = models.CharField(max_length=100, default='Technology')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer / Organization'),
        ('assessor', 'Security Assessor'),
        ('developer', 'Remediation Developer'),
        ('manager', 'Security Manager'),
        ('admin', 'Security Administrator'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='customer')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"

class ScanRecord(models.Model):
    GRADE_CHOICES = [
        ('A+', 'Grade A+'),
        ('A', 'Grade A'),
        ('B', 'Grade B'),
        ('C', 'Grade C'),
        ('D', 'Grade D'),
        ('F', 'Grade F'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url = models.CharField(max_length=2048)
    hostname = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    letter_grade = models.CharField(max_length=5, choices=GRADE_CHOICES)
    grade_label = models.CharField(max_length=100)
    response_status = models.IntegerField(default=200)
    ssl_info = models.JSONField(default=dict, blank=True)
    checks_data = models.JSONField(default=list, blank=True)
    findings_data = models.JSONField(default=list, blank=True)
    severity_counts = models.JSONField(default=dict, blank=True)
    scanned_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='scans')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['hostname', 'created_at']),
            models.Index(fields=['score']),
        ]

    def __str__(self):
        return f"{self.hostname} - Score: {self.score} ({self.letter_grade})"

class ScanAuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_name = models.CharField(max_length=255, default='System User')
    role = models.CharField(max_length=50, default='customer')
    action = models.CharField(max_length=100)
    target_url = models.CharField(max_length=2048)
    ip_address = models.GenericIPAddressField(null=True, blank=True, default='127.0.0.1')
    details = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.action} by {self.user_name} on {self.target_url}"

class AssessmentRequest(models.Model):
    PRIORITY_CHOICES = [
        ('Routine', 'Routine'),
        ('Urgent', 'Urgent'),
        ('Emergency', 'Emergency'),
    ]
    STATUS_CHOICES = [
        ('Pending Review', 'Pending Review'),
        ('Approved & Scheduled', 'Approved & Scheduled'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    target_url = models.CharField(max_length=2048)
    scope_notes = models.TextField(blank=True)
    compliance_target = models.CharField(max_length=255, default='OWASP Top 10:2021 & NIST CSF 2.0')
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Urgent')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending Review')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Request for {self.organization} ({self.target_url})"


# =============================================================================
# MODULE 2: Full Security Assessment, Findings, Risk & Remediation Management
# =============================================================================

# --- MD. ABU NAYEM (232-35-332) --- FR-2.1 to FR-2.6 ---

class Assessment(models.Model):
    """
    FR-2.1: Assessment Setup — Assessors can create, configure, and schedule in-depth
    web application security assessment projects with custom scope.
    FR-2.6: Assessment Scope Definition — Define testing boundaries, excluded paths, and assets.
    """
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Scheduled', 'Scheduled'),
        ('In Progress', 'In Progress'),
        ('Under Review', 'Under Review'),
        ('Completed', 'Completed'),
        ('Archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    target_url = models.CharField(max_length=2048)
    target_organization = models.CharField(max_length=255)
    assessor = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='led_assessments'
    )
    assessment_request = models.ForeignKey(
        AssessmentRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='full_assessments'
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Draft')
    # FR-2.6: Scope Definition Fields
    scope_in_urls = models.TextField(
        blank=True,
        help_text='Authorized URLs and paths in scope, one per line'
    )
    scope_out_urls = models.TextField(
        blank=True,
        help_text='Excluded paths and endpoints, one per line'
    )
    authorized_domains = models.TextField(
        blank=True,
        help_text='Authorized domain assets for testing, one per line'
    )
    compliance_framework = models.CharField(
        max_length=255,
        default='OWASP Top 10:2021 & NIST CSF 2.0'
    )
    scheduled_start = models.DateTimeField(null=True, blank=True)
    scheduled_end = models.DateTimeField(null=True, blank=True)
    completion_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Assessment: {self.title} [{self.status}]"


class ChecklistItem(models.Model):
    """
    FR-2.2: Standard Security Checklist — Assessors can evaluate applications against
    comprehensive industry security checklists covering top web vulnerability categories.
    """
    CATEGORY_CHOICES = [
        ('A01:2021', 'Broken Access Control'),
        ('A02:2021', 'Cryptographic Failures'),
        ('A03:2021', 'Injection'),
        ('A04:2021', 'Insecure Design'),
        ('A05:2021', 'Security Misconfiguration'),
        ('A06:2021', 'Vulnerable & Outdated Components'),
        ('A07:2021', 'Identification & Authentication Failures'),
        ('A08:2021', 'Software & Data Integrity Failures'),
        ('A09:2021', 'Security Logging & Monitoring Failures'),
        ('A10:2021', 'Server-Side Request Forgery (SSRF)'),
        ('NIST-ID', 'NIST CSF: Identify'),
        ('NIST-PR', 'NIST CSF: Protect'),
        ('NIST-DE', 'NIST CSF: Detect'),
        ('NIST-RS', 'NIST CSF: Respond'),
        ('NIST-RC', 'NIST CSF: Recover'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name='checklist_items'
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    control_id = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField()
    test_procedure = models.TextField(blank=True)
    expected_outcome = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'control_id']

    def __str__(self):
        return f"[{self.control_id}] {self.title}"


class Finding(models.Model):
    """
    FR-2.3: Finding Creation — Assessors can log identified vulnerabilities with detailed
    titles, descriptions, affected endpoints, and evidence steps.
    FR-2.4: Risk Level Calculation — Assign likelihood and impact to auto-determine risk score.
    FR-2.5: Finding Status Tracking — Track vulnerability lifecycle from open to closure.
    """
    LIKELIHOOD_CHOICES = [
        (1, 'Very Low'),
        (2, 'Low'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Very High'),
    ]
    IMPACT_CHOICES = [
        (1, 'Negligible'),
        (2, 'Minor'),
        (3, 'Moderate'),
        (4, 'Major'),
        (5, 'Critical'),
    ]
    SEVERITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
        ('Informational', 'Informational'),
    ]
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Remediation', 'In Remediation'),
        ('Retest Requested', 'Retest Requested'),
        ('Retest In Progress', 'Retest In Progress'),
        ('Resolved', 'Resolved'),
        ('Reopened', 'Reopened'),
        ('Accepted Risk', 'Accepted Risk'),
        ('Closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name='findings'
    )
    checklist_item = models.ForeignKey(
        ChecklistItem, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='findings'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    affected_endpoint = models.CharField(max_length=2048)
    evidence_steps = models.TextField(
        blank=True,
        help_text='Step-by-step reproduction steps'
    )
    # FR-2.4: 5x5 Risk Scoring Matrix
    likelihood = models.IntegerField(choices=LIKELIHOOD_CHOICES, default=3)
    impact = models.IntegerField(choices=IMPACT_CHOICES, default=3)
    risk_score = models.IntegerField(
        default=9,
        validators=[MinValueValidator(1), MaxValueValidator(25)],
        help_text='Calculated: likelihood x impact (1-25)'
    )
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Medium')
    # FR-2.5: Status Tracking
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Open')
    target_resolution_date = models.DateField(null=True, blank=True)
    logged_by = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='logged_findings'
    )
    assigned_developer = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_findings'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-risk_score', '-created_at']

    def save(self, *args, **kwargs):
        # FR-2.4: Auto-calculate risk score and severity
        self.risk_score = self.likelihood * self.impact
        if self.risk_score >= 20:
            self.severity = 'Critical'
        elif self.risk_score >= 12:
            self.severity = 'High'
        elif self.risk_score >= 6:
            self.severity = 'Medium'
        elif self.risk_score >= 3:
            self.severity = 'Low'
        else:
            self.severity = 'Informational'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.severity}] {self.title} - {self.status}"


# --- OVIJEET SAHA (232-35-457) --- FR-2.7 to FR-2.12 ---

class ChecklistAuditRecord(models.Model):
    """
    FR-2.7: Interactive Audit Checklist Console — Assessors can record pass, fail,
    or not-applicable verdicts with real-time audit progress.
    """
    VERDICT_CHOICES = [
        ('Pass', 'Pass'),
        ('Fail', 'Fail'),
        ('Not Applicable', 'Not Applicable'),
        ('Pending', 'Pending'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    checklist_item = models.ForeignKey(
        ChecklistItem, on_delete=models.CASCADE, related_name='audit_records'
    )
    assessor = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='audit_records'
    )
    verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES, default='Pending')
    assessor_notes = models.TextField(blank=True)
    evidence_reference = models.CharField(max_length=512, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-recorded_at']
        unique_together = ['checklist_item', 'assessor']

    def __str__(self):
        return f"{self.checklist_item.control_id} - {self.verdict}"


class RemediationEvidence(models.Model):
    """
    FR-2.9: Remediation Evidence Submission — Developers can submit fix explanations,
    patch notes, configuration changes, and code pull request links.
    FR-2.10: Retest Verification Request — Developers can formally request re-testing.
    """
    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finding = models.ForeignKey(
        Finding, on_delete=models.CASCADE, related_name='remediation_evidence'
    )
    developer = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='submitted_evidence'
    )
    fix_summary = models.TextField()
    patch_notes = models.TextField(blank=True)
    configuration_changes = models.TextField(blank=True)
    pull_request_url = models.URLField(blank=True)
    additional_references = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Submitted')
    retest_requested = models.BooleanField(default=False)
    retest_requested_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Evidence for [{self.finding.title}] by {self.developer.name if self.developer else 'Unknown'}"


class RetestVerification(models.Model):
    """
    FR-2.11: Assessor Verification Verdict — Assessors can review submitted evidence,
    perform verification re-tests, and mark vulnerabilities as resolved or reopened.
    FR-2.12: Vulnerability Impact Details View — View business impact analysis.
    """
    VERDICT_CHOICES = [
        ('Resolved', 'Resolved'),
        ('Reopened', 'Reopened'),
        ('Partially Fixed', 'Partially Fixed'),
        ('Pending', 'Pending'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finding = models.ForeignKey(
        Finding, on_delete=models.CASCADE, related_name='retest_verifications'
    )
    evidence = models.ForeignKey(
        RemediationEvidence, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='verification'
    )
    assessor = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='retest_verifications'
    )
    verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES, default='Pending')
    verification_notes = models.TextField()
    # FR-2.12: Business impact details
    business_impact_summary = models.TextField(blank=True)
    exploitation_scenario = models.TextField(blank=True)
    cvss_score = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)]
    )
    verified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-verified_at']

    def __str__(self):
        return f"Retest [{self.finding.title}] - {self.verdict}"


# --- ATIYA KHANM LUCKY (232-35-422) --- FR-2.13 to FR-2.18 ---

class RemediationTask(models.Model):
    """
    FR-2.14: Remediation Task Assignment — Managers can assign specific vulnerability
    remediation tasks to responsible developer team members with target deadlines.
    FR-2.17: Overdue Remediation Alerts — Visual indicators for unresolved critical issues.
    """
    PRIORITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Overdue', 'Overdue'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finding = models.ForeignKey(
        Finding, on_delete=models.CASCADE, related_name='remediation_tasks'
    )
    assigned_to = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='remediation_tasks'
    )
    assigned_by = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_tasks'
    )
    title = models.CharField(max_length=255)
    instructions = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Assigned')
    target_deadline = models.DateField()
    is_overdue = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Task: {self.title} [{self.status}] - Due: {self.target_deadline}"


class RetestNote(models.Model):
    """
    FR-2.15: Retest History & Notes Log — Users can view a complete chronological record
    of all retest attempts, assessor feedback notes, and verification outcomes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finding = models.ForeignKey(
        Finding, on_delete=models.CASCADE, related_name='retest_notes'
    )
    retest_verification = models.ForeignKey(
        RetestVerification, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='notes'
    )
    recorded_by = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='retest_notes'
    )
    attempt_number = models.PositiveIntegerField(default=1)
    outcome = models.CharField(max_length=50)
    assessor_feedback = models.TextField()
    next_action = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"Retest #{self.attempt_number} for [{self.finding.title}] - {self.outcome}"


class FindingComment(models.Model):
    """
    FR-2.16: Finding Discussion & Collaboration — Assessors and developers can exchange
    comments and clarification questions within individual vulnerability records.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finding = models.ForeignKey(
        Finding, on_delete=models.CASCADE, related_name='comments'
    )
    author = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='finding_comments'
    )
    comment_text = models.TextField()
    is_question = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.name if self.author else 'Unknown'} on [{self.finding.title}]"


class AssessmentArchive(models.Model):
    """
    FR-2.18: Assessment Archival & Closure — Authorized managers can formally finalize,
    sign off, and archive completed assessment projects.
    FR-2.13: Assessment Progress Monitoring — Track completion percentage and milestones.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.OneToOneField(
        Assessment, on_delete=models.CASCADE, related_name='archive_record'
    )
    signed_off_by = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='signed_off_assessments'
    )
    total_findings = models.IntegerField(default=0)
    resolved_findings = models.IntegerField(default=0)
    unresolved_findings = models.IntegerField(default=0)
    final_risk_score = models.IntegerField(default=0)
    sign_off_notes = models.TextField(blank=True)
    archived_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-archived_at']

    def __str__(self):
        return f"Archive: {self.assessment.title} - Archived at {self.archived_at.strftime('%Y-%m-%d')}"


# =============================================================================
# MODULE 3: Dashboard, Reporting, Audit & Customer Conversion
# =============================================================================

# --- MD. ABU NAYEM (232-35-332) --- FR-3.1 to FR-3.6 ---

class InboundNotification(models.Model):
    """
    FR-3.6: Inbound Request Notification — Assessors and managers receive notifications
    whenever a customer submits a new full assessment inquiry or system milestone alerts trigger.
    """
    NOTIFICATION_TYPES = [
        ('INBOUND_INQUIRY', 'Inbound Customer Assessment Inquiry'),
        ('ASSESSMENT_MILESTONE', 'Assessment Milestone Update'),
        ('RETEST_REQUESTED', 'Remediation Retest Requested'),
        ('CRITICAL_ALERT', 'Critical Vulnerability Alert'),
        ('SYSTEM_NOTICE', 'System Governance Notice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='notifications'
    )
    target_role = models.CharField(max_length=50, default='assessor')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='INBOUND_INQUIRY')
    title = models.CharField(max_length=255)
    message = models.TextField()
    related_assessment = models.ForeignKey(
        Assessment, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='notifications'
    )
    related_inquiry = models.ForeignKey(
        AssessmentRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title} ({'Read' if self.is_read else 'Unread'})"


# --- ATIYA KHANM LUCKY (232-35-422) --- FR-3.13 to FR-3.18 ---

class SharedAssessmentSummary(models.Model):
    """
    FR-3.18: Assessment Summary Sharing — Managers can generate secure, view-only summary
    tokens or presentation-ready links to share with executive leadership.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name='shared_summaries'
    )
    share_token = models.CharField(max_length=64, unique=True)
    created_by = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_summaries'
    )
    title = models.CharField(max_length=255, default='Executive Security Posture Briefing')
    allow_pdf_export = models.BooleanField(default=True)
    access_count = models.IntegerField(default=0)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Share Token {self.share_token} for [{self.assessment.title}]"



