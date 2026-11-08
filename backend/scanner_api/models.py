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

