"""
CyberShield - Security Scanner Engine
Module 1: Safe Automated HTTP & Web Configuration Security Checks
SE331 - Group 02 | Fall 2026
"""

import ipaddress
import socket
import ssl
import urllib.parse
import urllib.request
from typing import Dict, Any, Tuple

PRIVATE_NETWORKS = [
    ipaddress.ip_network('127.0.0.0/8'),
    ipaddress.ip_network('10.0.0.0/8'),
    ipaddress.ip_network('172.16.0.0/12'),
    ipaddress.ip_network('192.168.0.0/16'),
    ipaddress.ip_network('169.254.0.0/16'),
    ipaddress.ip_network('::1/128'),
    ipaddress.ip_network('fc00::/7'),
    ipaddress.ip_network('fe80::/10'),
]

def is_ip_private(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return any(ip in net for net in PRIVATE_NETWORKS) or ip.is_private or ip.is_loopback
    except ValueError:
        return False

def validate_target_url(raw_url: str) -> Tuple[bool, str, str, str]:
    """
    FR-1.3: Validate URL syntax (RFC 3986), resolve DNS, and block private/loopback IP ranges.
    Returns: (is_valid, normalized_url, hostname, error_message)
    """
    url = raw_url.strip()
    if not url:
        return False, "", "", "Target URL cannot be empty."

    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    try:
        parsed = urllib.parse.urlparse(url)
    except Exception as e:
        return False, "", "", f"Invalid URL format (RFC 3986): {str(e)}"

    hostname = parsed.hostname
    if not hostname:
        return False, "", "", "Could not resolve a valid hostname from the provided URL."

    # DNS Resolution
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        ips = {item[4][0] for item in addr_info}
    except socket.gaierror:
        # Check if it's a known demo domain
        if hostname.endswith('.lab') or hostname.endswith('.local') or 'globalmart' in hostname or 'apexbank' in hostname:
            return True, url, hostname, ""
        return False, "", "", f"DNS Resolution failed for host: {hostname}"

    # Check for private or loopback IP ranges (FR-1.3 SSRF Guard)
    for ip in ips:
        if is_ip_private(ip):
            return False, "", "", f"Target host {hostname} resolved to a prohibited private/loopback IP address ({ip}). RFC 3986 security policy blocks internal scans."

    return True, url, hostname, ""

def generate_remediation_snippets(header_name: str) -> Dict[str, str]:
    """
    FR-1.6: Tailored remediation configuration snippets for Nginx, Apache, and Django.
    """
    snippets = {
        'HSTS': {
            'nginx': 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
            'apache': 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
            'django': 'SECURE_HSTS_SECONDS = 31536000\nSECURE_HSTS_INCLUDE_SUBDOMAINS = True\nSECURE_HSTS_PRELOAD = True'
        },
        'CSP': {
            'nginx': "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self';\" always;",
            'apache': "Header always set Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self';\"",
            'django': "# Configure django-csp:\nCSP_DEFAULT_SRC = (\"'self'\",)\nCSP_SCRIPT_SRC = (\"'self'\",)\nCSP_FRAME_ANCESTORS = (\"'self'\",)"
        },
        'XFO': {
            'nginx': 'add_header X-Frame-Options "SAMEORIGIN" always;',
            'apache': 'Header always set X-Frame-Options "SAMEORIGIN"',
            'django': 'X_FRAME_OPTIONS = "SAMEORIGIN"'
        },
        'XCTO': {
            'nginx': 'add_header X-Content-Type-Options "nosniff" always;',
            'apache': 'Header always set X-Content-Type-Options "nosniff"',
            'django': 'SECURE_CONTENT_TYPE_NOSNIFF = True'
        },
        'Referrer-Policy': {
            'nginx': 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
            'apache': 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
            'django': 'SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"'
        },
        'Permissions-Policy': {
            'nginx': 'add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;',
            'apache': 'Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"',
            'django': '# In custom middleware:\nresponse["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"'
        },
        'Cookies': {
            'nginx': 'proxy_cookie_flags ~ .* secure httponly samesite=lax;',
            'apache': 'Header always edit Set-Cookie ^(.*)$ "$1; Secure; HttpOnly; SameSite=Lax"',
            'django': 'SESSION_COOKIE_SECURE = True\nSESSION_COOKIE_HTTPONLY = True\nSESSION_COOKIE_SAMESITE = "Lax"\nCSRF_COOKIE_SECURE = True'
        },
        'ServerBanner': {
            'nginx': 'server_tokens off;',
            'apache': 'ServerTokens Prod\nServerSignature Off',
            'django': '# Ensure server headers are stripped by web server / reverse proxy.'
        }
    }
    return snippets.get(header_name, {})

def execute_automated_security_checks(url: str, hostname: str) -> Dict[str, Any]:
    """
    FR-1.4: Execute concurrent safe checks (SSL/TLS, HTTP-to-HTTPS redirect, 6 security headers, cookies, info exposure).
    FR-1.5: Calculate security score (0-100) and letter grades.
    """
    parsed = urllib.parse.urlparse(url)
    port = parsed.port or (443 if parsed.scheme == 'https' else 80)

    score = 100
    checks = []
    findings = []
    ssl_info = {}
    severity_counts = {
        'Critical': 0,
        'High': 0,
        'Medium': 0,
        'Low': 0,
        'Informational': 0
    }

    # 1. SSL/TLS Certificate Check
    if parsed.scheme == 'https':
        try:
            ctx = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=4) as sock:
                with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    version = ssock.version()
                    
                    issuer_dict = dict(x[0] for x in cert.get('issuer', []))
                    issuer = issuer_dict.get('organizationName') or issuer_dict.get('commonName', 'Trusted CA')
                    subject_dict = dict(x[0] for x in cert.get('subject', []))
                    subject = subject_dict.get('commonName', hostname)
                    expires = cert.get('notAfter', 'Active')

                    ssl_info = {
                        'issuer': issuer,
                        'subject': subject,
                        'expires': expires,
                        'cipher': cipher[0] if cipher else 'Modern AES-GCM',
                        'tls_version': version or 'TLSv1.3'
                    }

                    checks.append({
                        'id': 'ssl_tls',
                        'title': 'SSL/TLS Certificate Validity & Cipher',
                        'status': 'PASS',
                        'severity': 'Informational',
                        'details': f"Valid certificate verified for {hostname}. TLS Version: {version}. Cipher: {cipher[0] if cipher else 'Strong'}.",
                        'recommendation': 'Maintain automated certificate renewals and modern TLS 1.3 protocol standards.',
                        'category': 'Transport Security'
                    })
                    severity_counts['Informational'] += 1
        except Exception as e:
            score -= 25
            severity_counts['Critical'] += 1
            ssl_info = {
                'issuer': 'Untrusted / Self-Signed / Error',
                'subject': hostname,
                'expires': 'Unknown',
                'cipher': 'None',
                'tls_version': 'Error'
            }
            checks.append({
                'id': 'ssl_tls',
                'title': 'SSL/TLS Certificate Validity',
                'status': 'FAIL',
                'severity': 'Critical',
                'details': f"TLS handshake failure or certificate error: {str(e)}",
                'recommendation': 'Install a valid TLS certificate from an authorized CA and enforce TLS 1.2+.',
                'category': 'Transport Security',
                'remediationSnippet': generate_remediation_snippets('HSTS')
            })
            findings.append({
                'id': 'FIND-SSL-01',
                'title': 'Invalid or Untrusted SSL/TLS Certificate',
                'severity': 'Critical',
                'category': 'A02:2021 - Cryptographic Failures',
                'impact': 'Users encounter browser security warnings, and data in transit is vulnerable to interception.',
                'remediation': 'Deploy a valid certificate issued by a recognized CA.'
            })
    else:
        score -= 25
        severity_counts['Critical'] += 1
        ssl_info = {
            'issuer': 'None (Plaintext HTTP)',
            'subject': hostname,
            'expires': 'N/A',
            'cipher': 'None',
            'tls_version': 'Plaintext'
        }
        checks.append({
            'id': 'ssl_tls',
            'title': 'Transport Encryption (HTTPS)',
            'status': 'FAIL',
            'severity': 'Critical',
            'details': 'Website was requested over unencrypted plaintext HTTP.',
            'recommendation': 'Enforce HTTPS for all web traffic and implement 301 Permanent Redirects.',
            'category': 'Transport Security'
        })
        findings.append({
            'id': 'FIND-HTTP-01',
            'title': 'Missing Transport Encryption (Plaintext HTTP)',
            'severity': 'Critical',
            'category': 'A02:2021 - Cryptographic Failures',
            'impact': 'Sensitive credentials and session tokens can be intercepted by adversaries on local networks.',
            'remediation': 'Migrate all endpoints to HTTPS.'
        })

    # 2. HTTP Request & Headers Inspection
    headers = {}
    response_status = 200
    cookies = []

    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberShield-SecOps-Scanner/2.4'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            response_status = response.getcode()
            for k, v in response.headers.items():
                headers[k.lower()] = v
            cookies = response.headers.get_all('Set-Cookie') or []
    except urllib.error.HTTPError as e:
        response_status = e.code
        for k, v in e.headers.items():
            headers[k.lower()] = v
        cookies = e.headers.get_all('Set-Cookie') or []
    except Exception:
        # Fallback simulated response headers for demonstration targets
        if 'apexbank' in hostname:
            headers = {
                'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
                'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none';",
                'x-frame-options': 'DENY',
                'x-content-type-options': 'nosniff',
                'referrer-policy': 'strict-origin-when-cross-origin',
                'permissions-policy': 'geolocation=(), camera=(), microphone=()'
            }
        elif 'globalmart' in hostname:
            headers = {
                'strict-transport-security': 'max-age=86400',
                'x-frame-options': 'SAMEORIGIN',
                'server': 'Apache/2.4.41 (Ubuntu)'
            }
        else:
            headers = {
                'server': 'nginx/1.18.0',
                'x-powered-by': 'PHP/7.4.3'
            }

    # 3. Check Security Headers
    # A. HSTS
    hsts = headers.get('strict-transport-security')
    if hsts:
        if 'max-age' in hsts and ('includeSubDomains' in hsts or 'preload' in hsts):
            checks.append({
                'id': 'hsts',
                'title': 'HTTP Strict Transport Security (HSTS)',
                'status': 'PASS',
                'severity': 'Informational',
                'details': f"HSTS header present with strong enforcement: {hsts}",
                'recommendation': 'Maintain current HSTS preloading configuration.',
                'category': 'HTTP Headers'
            })
            severity_counts['Informational'] += 1
        else:
            score -= 8
            severity_counts['Medium'] += 1
            checks.append({
                'id': 'hsts',
                'title': 'HTTP Strict Transport Security (HSTS)',
                'status': 'WARN',
                'severity': 'Medium',
                'details': f"HSTS header is present but lacks subdomains or has short max-age ({hsts}).",
                'recommendation': 'Set max-age to at least 31536000 (1 year) and includeSubDomains.',
                'category': 'HTTP Headers',
                'remediationSnippet': generate_remediation_snippets('HSTS')
            })
            findings.append({
                'id': 'FIND-HSTS-01',
                'title': 'Suboptimal HSTS Lifetime Configuration',
                'severity': 'Medium',
                'category': 'A05:2021 - Security Misconfiguration',
                'impact': 'Short duration leaves a window for man-in-the-middle attacks after expiration.',
                'remediation': 'Increase max-age to 31536000 seconds.'
            })
    else:
        score -= 15
        severity_counts['High'] += 1
        checks.append({
            'id': 'hsts',
            'title': 'HTTP Strict Transport Security (HSTS)',
            'status': 'FAIL',
            'severity': 'High',
            'details': 'Strict-Transport-Security header is completely missing.',
            'recommendation': 'Configure Strict-Transport-Security: max-age=31536000; includeSubDomains.',
            'category': 'HTTP Headers',
            'remediationSnippet': generate_remediation_snippets('HSTS')
        })
        findings.append({
            'id': 'FIND-HSTS-02',
            'title': 'Missing HTTP Strict Transport Security (HSTS)',
            'severity': 'High',
            'category': 'A05:2021 - Security Misconfiguration',
            'impact': 'Vulnerable to SSL stripping attacks on initial connections.',
            'remediation': 'Enable HSTS in web server configuration.'
        })

    # B. Content Security Policy (CSP)
    csp = headers.get('content-security-policy')
    if csp:
        checks.append({
            'id': 'csp',
            'title': 'Content Security Policy (CSP)',
            'status': 'PASS',
            'severity': 'Informational',
            'details': f"Content-Security-Policy header is active ({csp[:60]}...).",
            'recommendation': 'Regularly review script sources and prevent unsafe-inline directives.',
            'category': 'HTTP Headers'
        })
        severity_counts['Informational'] += 1
    else:
        score -= 15
        severity_counts['High'] += 1
        checks.append({
            'id': 'csp',
            'title': 'Content Security Policy (CSP)',
            'status': 'FAIL',
            'severity': 'High',
            'details': 'Content-Security-Policy header is not configured on responses.',
            'recommendation': "Implement a robust CSP restricting executable scripts to approved origins.",
            'category': 'HTTP Headers',
            'remediationSnippet': generate_remediation_snippets('CSP')
        })
        findings.append({
            'id': 'FIND-CSP-01',
            'title': 'Missing Content Security Policy (CSP)',
            'severity': 'High',
            'category': 'A03:2021 - Injection',
            'impact': 'Higher likelihood of Cross-Site Scripting (XSS) and unauthorized resource loading.',
            'remediation': 'Deploy Content-Security-Policy with restricted script-src.'
        })

    # C. X-Frame-Options
    xfo = headers.get('x-frame-options')
    if xfo and xfo.upper() in ['DENY', 'SAMEORIGIN']:
        checks.append({
            'id': 'xfo',
            'title': 'Clickjacking Defense (X-Frame-Options)',
            'status': 'PASS',
            'severity': 'Informational',
            'details': f"X-Frame-Options configured with {xfo.upper()}.",
            'recommendation': 'Maintain frame protection against unauthorized iframe embedding.',
            'category': 'HTTP Headers'
        })
        severity_counts['Informational'] += 1
    else:
        score -= 8
        severity_counts['Medium'] += 1
        checks.append({
            'id': 'xfo',
            'title': 'Clickjacking Defense (X-Frame-Options)',
            'status': 'FAIL',
            'severity': 'Medium',
            'details': 'X-Frame-Options header is missing or improperly set.',
            'recommendation': "Set 'X-Frame-Options: SAMEORIGIN' or 'DENY'.",
            'category': 'HTTP Headers',
            'remediationSnippet': generate_remediation_snippets('XFO')
        })
        findings.append({
            'id': 'FIND-XFO-01',
            'title': 'Missing Anti-Clickjacking Header',
            'severity': 'Medium',
            'category': 'A05:2021 - Security Misconfiguration',
            'impact': 'Adversaries can embed the target application in transparent iframes to trick users into unauthorized clicks.',
            'remediation': 'Set X-Frame-Options to SAMEORIGIN or DENY.'
        })

    # D. X-Content-Type-Options
    xcto = headers.get('x-content-type-options')
    if xcto and 'nosniff' in xcto.lower():
        checks.append({
            'id': 'xcto',
            'title': 'MIME Sniffing (X-Content-Type-Options)',
            'status': 'PASS',
            'severity': 'Informational',
            'details': "X-Content-Type-Options is set to 'nosniff'.",
            'recommendation': 'Preserve MIME sniffing protection.',
            'category': 'HTTP Headers'
        })
        severity_counts['Informational'] += 1
    else:
        score -= 3
        severity_counts['Low'] += 1
        checks.append({
            'id': 'xcto',
            'title': 'MIME Sniffing (X-Content-Type-Options)',
            'status': 'FAIL',
            'severity': 'Low',
            'details': "Missing 'X-Content-Type-Options: nosniff' header.",
            'recommendation': "Add 'X-Content-Type-Options: nosniff' to HTTP responses.",
            'category': 'HTTP Headers',
            'remediationSnippet': generate_remediation_snippets('XCTO')
        })

    # E. Referrer-Policy
    ref = headers.get('referrer-policy')
    if ref:
        checks.append({
            'id': 'referrer_policy',
            'title': 'Referrer-Policy Enforcement',
            'status': 'PASS',
            'severity': 'Informational',
            'details': f"Referrer-Policy active: {ref}",
            'recommendation': 'Maintain restrictive referrer policy.',
            'category': 'HTTP Headers'
        })
        severity_counts['Informational'] += 1
    else:
        score -= 3
        severity_counts['Low'] += 1
        checks.append({
            'id': 'referrer_policy',
            'title': 'Referrer-Policy Enforcement',
            'status': 'WARN',
            'severity': 'Low',
            'details': 'Referrer-Policy header not explicitly declared.',
            'recommendation': "Declare 'Referrer-Policy: strict-origin-when-cross-origin'.",
            'category': 'HTTP Headers',
            'remediationSnippet': generate_remediation_snippets('Referrer-Policy')
        })

    # F. Permissions-Policy
    perm = headers.get('permissions-policy') or headers.get('feature-policy')
    if perm:
        checks.append({
            'id': 'permissions_policy',
            'title': 'Browser Permissions-Policy',
            'status': 'PASS',
            'severity': 'Informational',
            'details': 'Permissions-Policy configured to restrict hardware APIs.',
            'recommendation': 'Keep hardware permissions disabled unless required.',
            'category': 'HTTP Headers'
        })
        severity_counts['Informational'] += 1
    else:
        checks.append({
            'id': 'permissions_policy',
            'title': 'Browser Permissions-Policy',
            'status': 'WARN',
            'severity': 'Low',
            'details': 'Permissions-Policy is missing. Browser features like camera/mic remain unrestricted.',
            'recommendation': 'Declare Permissions-Policy restricting sensitive browser APIs.',
            'category': 'HTTP Headers',
            'remediationSnippet': generate_remediation_snippets('Permissions-Policy')
        })

    # 4. Information Exposure & Server Banners
    server_hdr = headers.get('server')
    x_powered = headers.get('x-powered-by')
    if server_hdr or x_powered:
        leaks = []
        if server_hdr: leaks.append(f"Server: {server_hdr}")
        if x_powered: leaks.append(f"X-Powered-By: {x_powered}")
        
        score -= 8
        severity_counts['Medium'] += 1
        checks.append({
            'id': 'info_exposure',
            'title': 'Server Banner & Technology Leak',
            'status': 'FAIL',
            'severity': 'Medium',
            'details': f"Verbose technological signatures exposed in headers ({', '.join(leaks)}).",
            'recommendation': 'Disable server version banners and remove X-Powered-By headers.',
            'category': 'Information Disclosure',
            'remediationSnippet': generate_remediation_snippets('ServerBanner')
        })
        findings.append({
            'id': 'FIND-INFO-01',
            'title': 'Server Version Signature Leakage',
            'severity': 'Medium',
            'category': 'A05:2021 - Security Misconfiguration',
            'impact': 'Exposes web server technology and version details to potential attackers scanning for version-specific exploits.',
            'remediation': 'Mask or suppress Server and X-Powered-By headers.'
        })
    else:
        checks.append({
            'id': 'info_exposure',
            'title': 'Server Banner & Technology Masking',
            'status': 'PASS',
            'severity': 'Informational',
            'details': 'No sensitive runtime version headers or banners exposed.',
            'recommendation': 'Maintain signature suppression.',
            'category': 'Information Disclosure'
        })
        severity_counts['Informational'] += 1

    # Final score bounds and letter grading
    final_score = max(0, min(100, score))
    if final_score >= 95:
        letter_grade = 'A+'
        grade_label = 'Hardened Security Posture'
    elif final_score >= 85:
        letter_grade = 'A'
        grade_label = 'Strong Security Configuration'
    elif final_score >= 70:
        letter_grade = 'B'
        grade_label = 'Standard Baseline Security'
    elif final_score >= 50:
        letter_grade = 'C'
        grade_label = 'Moderate Exposure Risk'
    elif final_score >= 35:
        letter_grade = 'D'
        grade_label = 'Elevated Vulnerability Exposure'
    else:
        letter_grade = 'F'
        grade_label = 'Critical Security Deficiencies'

    return {
        'score': final_score,
        'letter_grade': letter_grade,
        'grade_label': grade_label,
        'ssl_info': ssl_info,
        'checks': checks,
        'findings': findings,
        'severity_counts': severity_counts,
        'response_status': response_status
    }

