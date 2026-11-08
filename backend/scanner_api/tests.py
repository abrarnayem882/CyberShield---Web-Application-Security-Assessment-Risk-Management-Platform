"""
Unit and Integration Tests for Module 1 Security Analysis Engine
Author: Ovijeet Saha <ovijeetsaha65@gmail.com>
Student ID: 232-35-457
Assigned Scope: FR-1.7 - FR-1.12 (Security Headers, Cookies, Scoring & Remediation)
"""

from django.test import TestCase
from scanner_api.scanner import (
    generate_remediation_snippets,
    execute_automated_security_checks,
    validate_target_url,
    is_ip_private,
)


class SecurityHeadersAndRemediationTests(TestCase):
    """
    FR-1.7: Security Headers Audit
    FR-1.12: Tailored Remediation Fix Snippets
    """

    def test_remediation_snippets_hsts(self):
        snippets = generate_remediation_snippets('HSTS')
        self.assertIn('nginx', snippets)
        self.assertIn('apache', snippets)
        self.assertIn('django', snippets)
        self.assertIn('Strict-Transport-Security', snippets['nginx'])
        self.assertIn('Strict-Transport-Security', snippets['apache'])

    def test_remediation_snippets_csp(self):
        snippets = generate_remediation_snippets('CSP')
        self.assertIn('nginx', snippets)
        self.assertIn('apache', snippets)
        self.assertIn('Content-Security-Policy', snippets['nginx'])

    def test_remediation_snippets_all_core_headers(self):
        expected_keys = ['HSTS', 'CSP', 'XFO', 'XCTO', 'Referrer-Policy', 'Permissions-Policy', 'Cookies', 'ServerBanner']
        for key in expected_keys:
            snippets = generate_remediation_snippets(key)
            self.assertTrue(bool(snippets), f"Missing remediation snippet for {key}")
            self.assertIn('nginx', snippets)
            self.assertIn('apache', snippets)


class VulnerabilityScoringEngineTests(TestCase):
    """
    FR-1.10: Security Score (0-100) & Letter Grade Engine
    FR-1.11: Vulnerability Findings Categorization
    """

    def test_demo_target_security_checks_structure(self):
        # Demo domains bypass real outbound network sockets
        result = execute_automated_security_checks("https://demo.lab", "demo.lab")
        self.assertIn('score', result)
        self.assertIn('letter_grade', result)
        self.assertIn('grade_label', result)
        self.assertIn('checks', result)
        self.assertIn('findings', result)
        self.assertIn('severity_counts', result)
        
        # Verify score is within valid range [0, 100]
        self.assertGreaterEqual(result['score'], 0)
        self.assertLessEqual(result['score'], 100)
        
        # Verify letter grade is one of the valid grades
        self.assertIn(result['letter_grade'], ['A+', 'A', 'B', 'C', 'D', 'F'])

    def test_findings_severity_structure(self):
        result = execute_automated_security_checks("https://demo.lab", "demo.lab")
        findings = result['findings']
        self.assertIsInstance(findings, list)
        for finding in findings:
            self.assertIn('title', finding)
            self.assertIn('severity', finding)
            self.assertIn(finding['severity'], ['Critical', 'High', 'Medium', 'Low', 'Informational'])


class TargetValidationAndProtectionTests(TestCase):
    """
    FR-1.3 & FR-1.4: URL Validation and Private IP / SSRF Protection
    """

    def test_private_ip_detection(self):
        self.assertTrue(is_ip_private('127.0.0.1'))
        self.assertTrue(is_ip_private('10.0.0.1'))
        self.assertTrue(is_ip_private('192.168.1.1'))
        self.assertTrue(is_ip_private('172.16.0.1'))
        self.assertFalse(is_ip_private('8.8.8.8'))
        self.assertFalse(is_ip_private('1.1.1.1'))

    def test_empty_url_validation(self):
        is_valid, _, _, error = validate_target_url("")
        self.assertFalse(is_valid)
        self.assertIn("cannot be empty", error)
