"""
Seed database for CyberShield Module 1.
Creates initial organizations, users, scan presets, and audit logs.
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cybershield.settings')
django.setup()

from scanner_api.models import Organization, UserProfile, ScanRecord, ScanAuditLog
from scanner_api.scanner import execute_automated_security_checks

def run_seed():
    print("Running initial database setup & migrations...")
    from django.core.management import call_command
    call_command('makemigrations', 'scanner_api')
    call_command('migrate')

    print("Seeding Organizations...")
    org1, _ = Organization.objects.get_or_create(
        name='GlobalMart Retail Ltd',
        defaults={'domain': 'globalmart-retail.com', 'industry': 'E-Commerce & Retail'}
    )
    org2, _ = Organization.objects.get_or_create(
        name='Apex Financial Services Corp',
        defaults={'domain': 'apexbank-secure.io', 'industry': 'Fintech & Banking'}
    )
    org3, _ = Organization.objects.get_or_create(
        name='CyberShield SecOps Security Assessment Team',
        defaults={'domain': 'cybershield-platform.sec', 'industry': 'Cybersecurity'}
    )

    print("Seeding User Profiles (RBAC Personas)...")
    users = [
        {
            'username': 'nayem_customer',
            'email': 'customer@globalmart.com',
            'name': 'Sarah Jenkins',
            'role': 'customer',
            'org': org1
        },
        {
            'username': 'nayem_lead',
            'email': 'nayem@cybershield.sec',
            'name': 'MD. Abu Nayem',
            'role': 'admin',
            'org': org3
        },
        {
            'username': 'ovijeet_assessor',
            'email': 'ovijeet@cybershield.sec',
            'name': 'Ovijeet Saha',
            'role': 'assessor',
            'org': org3
        },
        {
            'username': 'lucky_qa',
            'email': 'atiya@cybershield.sec',
            'name': 'Atiya Khanm Lucky',
            'role': 'manager',
            'org': org3
        },
        {
            'username': 'dev_lead',
            'email': 'alex.dev@globalmart.com',
            'name': 'Alex Rivera',
            'role': 'developer',
            'org': org1
        }
    ]

    for u in users:
        UserProfile.objects.get_or_create(
            username=u['username'],
            defaults={
                'email': u['email'],
                'name': u['name'],
                'role': u['role'],
                'organization': u['org'],
                'password_hash': 'pbkdf2_sha256$260000$mockhash'
            }
        )

    print("Seeding Initial Scan Records (Targets: Apex Bank, GlobalMart, JuiceShop)...")
    preset_targets = [
        ('https://apexbank-secure.io', 'apexbank-secure.io'),
        ('https://globalmart-retail.com', 'globalmart-retail.com'),
        ('https://vulnerable-demo-app.lab', 'vulnerable-demo-app.lab')
    ]

    for url, host in preset_targets:
        if not ScanRecord.objects.filter(hostname=host).exists():
            res = execute_automated_security_checks(url, host)
            rec = ScanRecord.objects.create(
                url=url,
                hostname=host,
                ip_address='104.21.56.88' if 'apex' in host else ('198.51.100.24' if 'globalmart' in host else '203.0.113.50'),
                score=res['score'],
                letter_grade=res['letter_grade'],
                grade_label=res['grade_label'],
                response_status=res['response_status'],
                ssl_info=res['ssl_info'],
                checks_data=res['checks'],
                findings_data=res['findings'],
                severity_counts=res['severity_counts']
            )
            ScanAuditLog.objects.create(
                user_name='System Initializer',
                role='admin',
                action='PRESET_SCAN_SEEDED',
                target_url=url,
                ip_address='127.0.0.1',
                details=f"Initialized default security report benchmark for {host} (Score: {rec.score})."
            )

    print("Seed complete! Database is initialized.")

if __name__ == '__main__':
    run_seed()

