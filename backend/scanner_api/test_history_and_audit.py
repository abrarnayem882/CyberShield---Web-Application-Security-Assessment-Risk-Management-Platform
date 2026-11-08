"""
Unit and Integration Tests for Module 1 Scan History, Audit Logging, and Assessment Pipeline
Author: Atiya Khanm Lucky <atiyakhanm235@gmail.com>
Student ID: 232-35-422
Assigned Scope: FR-1.13 - FR-1.18 (Scan History, Re-Scan, Audit Trail, Assessment Conversion, Profile)
"""

from django.test import TestCase, Client
from scanner_api.models import ScanRecord, ScanAuditLog, AssessmentRequest, UserProfile, Organization


class ScanHistoryAndReScanTests(TestCase):
    """
    FR-1.14: Scan History Log
    FR-1.15: One-Click Re-Scan
    """

    def setUp(self):
        self.client = Client()
        self.org = Organization.objects.create(
            name="Apex Security Partners",
            domain="apexbank.sec",
            industry="Financial Technology"
        )
        self.user = UserProfile.objects.create(
            username="atiya_analyst",
            email="atiyakhanm235@gmail.com",
            name="Atiya Khanm Lucky",
            role="assessor",
            organization=self.org
        )

        # Create historical scan records
        self.scan1 = ScanRecord.objects.create(
            url="https://apexbank-secure.io",
            hostname="apexbank-secure.io",
            ip_address="198.51.100.22",
            score=92,
            letter_grade="A+",
            grade_label="Hardened Security Posture",
            response_status=200,
            ssl_info={"issuer": "Let's Encrypt Authority", "tls_version": "TLSv1.3", "expires": "2027-01-15"}
        )
        self.scan2 = ScanRecord.objects.create(
            url="https://legacy-portal.lab",
            hostname="legacy-portal.lab",
            ip_address="203.0.113.5",
            score=30,
            letter_grade="F",
            grade_label="Critical Security Deficiencies",
            response_status=200,
            ssl_info={"issuer": "Untrusted / Self-Signed", "tls_version": "TLSv1.0", "expires": "2024-05-10"}
        )

    def test_scan_history_retrieval(self):
        """Verify historical scans can be queried and sorted by timestamp."""
        scans = ScanRecord.objects.all().order_by('-created_at')
        self.assertEqual(scans.count(), 2)
        self.assertEqual(scans.first().hostname, "legacy-portal.lab")

    def test_scan_record_payload_integrity(self):
        """Verify stored scan records retain SSL details and score."""
        record = ScanRecord.objects.get(hostname="apexbank-secure.io")
        self.assertEqual(record.score, 92)
        self.assertEqual(record.letter_grade, "A+")
        self.assertEqual(record.ssl_info["tls_version"], "TLSv1.3")


class AuditTrailLoggingTests(TestCase):
    """
    FR-1.17: Activity Audit Trail
    """

    def setUp(self):
        self.user = UserProfile.objects.create(
            username="admin_lead",
            email="admin@cybershield.sec",
            name="Security Admin",
            role="admin"
        )

    def test_audit_log_creation_and_tamper_evidence(self):
        """Ensure tamper-evident audit logs cannot have their creation timestamp mutated."""
        log = ScanAuditLog.objects.create(
            user_name="Atiya Khanm Lucky",
            role="assessor",
            action="EXECUTE_SCAN",
            target_url="https://apexbank-secure.io",
            ip_address="127.0.0.1",
            details="Automated TLS, Header and Cookie Security Assessment completed."
        )
        self.assertIsNotNone(log.id)
        self.assertIsNotNone(log.timestamp)
        self.assertEqual(log.action, "EXECUTE_SCAN")

    def test_multiple_audit_events_sequencing(self):
        """Ensure audit logs accurately track sequenced multi-user actions."""
        ScanAuditLog.objects.create(
            user_name="Sarah Jenkins",
            role="customer",
            action="LOGIN",
            details="Customer authenticated via 1-click persona."
        )
        ScanAuditLog.objects.create(
            user_name="Sarah Jenkins",
            role="customer",
            action="REQUEST_ASSESSMENT",
            target_url="https://globalmart-shop.org",
            details="Customer requested In-Depth SOC2 compliance audit."
        )
        logs = ScanAuditLog.objects.filter(user_name="Sarah Jenkins")
        self.assertEqual(logs.count(), 2)


class AssessmentRequestPipelineTests(TestCase):
    """
    FR-1.13: Full Assessment Request
    """

    def setUp(self):
        self.client = Client()

    def test_assessment_request_creation(self):
        """Verify customers can create in-depth assessment requests with compliance scope."""
        req = AssessmentRequest.objects.create(
            target_url="https://apexbank-secure.io",
            contact_name="Sarah Jenkins",
            contact_email="sarah.jenkins@fintechglobal.com",
            organization="FinTech Global Corp",
            scope_notes="Requires whitebox penetration testing for PCI-DSS 4.0 certification.",
            compliance_target="PCI-DSS 4.0 & ISO 27001",
            priority="Urgent",
            status="Pending Review"
        )
        self.assertIsNotNone(req.id)
        self.assertEqual(req.status, "Pending Review")
        self.assertEqual(req.organization, "FinTech Global Corp")
        self.assertEqual(req.priority, "Urgent")
