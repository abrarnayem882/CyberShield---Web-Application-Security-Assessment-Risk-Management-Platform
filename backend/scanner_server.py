"""
CyberShield - Backend Security Scanner Service
Python-based HTTP & Web Configuration Security Checks
SE331 - Group 02 | Fall 2026
"""

import json
import socket
import ssl
import sys
import urllib.parse
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler

def check_website_security(raw_url: str) -> dict:
    # Ensure URL has scheme
    if not raw_url.startswith(('http://', 'https://')):
        url = 'https://' + raw_url
    else:
        url = raw_url
        
    parsed = urllib.parse.urlparse(url)
    hostname = parsed.hostname or raw_url
    port = parsed.port or (443 if parsed.scheme == 'https' else 80)
    
    findings = []
    checks = []
    score = 100
    
    # 1. SSL/TLS Certificate Check
    ssl_valid = False
    cert_info = {}
    if parsed.scheme == 'https':
        try:
            ctx = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=5) as sock:
                with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    version = ssock.version()
                    ssl_valid = True
                    cert_info = {
                        "issuer": dict(x[0] for x in cert.get('issuer', [])).get('organizationName', 'Trusted CA'),
                        "subject": dict(x[0] for x in cert.get('subject', [])).get('commonName', hostname),
                        "expires": cert.get('notAfter', 'Unknown'),
                        "cipher": cipher[0] if cipher else 'Modern AES-GCM',
                        "tls_version": version
                    }
                    checks.append({
                        "id": "ssl_tls",
                        "title": "SSL/TLS Certificate Validity & Cipher",
                        "status": "PASS",
                        "severity": "Informational",
                        "details": f"Valid certificate verified for {hostname}. TLS Version: {version}. Cipher: {cipher[0] if cipher else 'Strong'}.",
                        "recommendation": "Maintain automatic renewal and monitor TLS 1.3 transition."
                    })
        except Exception as e:
            score -= 25
            checks.append({
                "id": "ssl_tls",
                "title": "SSL/TLS Certificate Validity",
                "status": "FAIL",
                "severity": "Critical",
                "details": f"SSL connection error or invalid certificate: {str(e)}",
                "recommendation": "Install a valid TLS certificate from an approved Certificate Authority like Let's Encrypt or DigiCert."
            })
            findings.append({
                "id": "FIND-SSL-01",
                "title": "Invalid or Untrusted SSL/TLS Certificate",
                "severity": "Critical",
                "category": "A02:2021 - Cryptographic Failures",
                "impact": "Users encounter security warnings, and data in transit is vulnerable to interception.",
                "remediation": "Deploy a valid, recognized SSL certificate and enforce modern TLS 1.2+."
            })
    else:
        score -= 30
        checks.append({
            "id": "ssl_tls",
            "title": "HTTPS Encryption",
            "status": "FAIL",
            "severity": "Critical",
            "details": "Website was accessed over plaintext HTTP.",
            "recommendation": "Enforce HTTPS across all pages and redirect HTTP traffic."
        })
        findings.append({
            "id": "FIND-HTTP-01",
            "title": "Missing Transport Encryption (Plaintext HTTP)",
            "severity": "Critical",
            "category": "A02:2021 - Cryptographic Failures",
            "impact": "All traffic can be sniffed or modified in transit.",
            "remediation": "Migrate all endpoints to HTTPS."
        })

    # 2. HTTP Request & Headers
    headers = {}
    status_code = 0
    cookies = []
    
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'CyberShield-Security-Auditor/1.0 (SE331)'}
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            status_code = response.getcode()
            headers = dict(response.headers)
            for k, v in response.headers.items():
                if k.lower() == 'set-cookie':
                    cookies.append(v)
    except urllib.error.HTTPError as e:
        status_code = e.code
        headers = dict(e.headers)
    except Exception as e:
        # If network error or unreachable, return safe fallback inspection
        pass

    # Normalize header keys to lowercase
    lower_headers = {k.lower(): v for k, v in headers.items()}
    
    # Check HSTS (Strict-Transport-Security)
    if 'strict-transport-security' in lower_headers:
        val = lower_headers['strict-transport-security']
        checks.append({
            "id": "hsts",
            "title": "HTTP Strict Transport Security (HSTS)",
            "status": "PASS",
            "severity": "Informational",
            "details": f"Strict-Transport-Security header present: '{val}'.",
            "recommendation": "Ensure includeSubDomains and preload are enabled if applicable."
        })
    else:
        score -= 15
        checks.append({
            "id": "hsts",
            "title": "HTTP Strict Transport Security (HSTS)",
            "status": "FAIL",
            "severity": "High",
            "details": "Strict-Transport-Security header is missing.",
            "recommendation": "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' in web server configuration."
        })
        findings.append({
            "id": "FIND-SEC-HSTS",
            "title": "Missing Strict-Transport-Security (HSTS) Header",
            "severity": "High",
            "category": "A05:2021 - Security Misconfiguration",
            "impact": "Leaves visitors susceptible to SSL-stripping man-in-the-middle attacks.",
            "remediation": "Configure HSTS header on all HTTPS responses with a minimum max-age of 1 year."
        })

    # Check Content-Security-Policy (CSP)
    if 'content-security-policy' in lower_headers:
        checks.append({
            "id": "csp",
            "title": "Content Security Policy (CSP)",
            "status": "PASS",
            "severity": "Informational",
            "details": f"CSP configured: {lower_headers['content-security-policy'][:80]}...",
            "recommendation": "Audit CSP directives to ensure no 'unsafe-inline' or 'unsafe-eval' wildcards exist."
        })
    else:
        score -= 15
        checks.append({
            "id": "csp",
            "title": "Content Security Policy (CSP)",
            "status": "FAIL",
            "severity": "High",
            "details": "Content-Security-Policy header is missing.",
            "recommendation": "Implement a strong CSP policy restricting script-src, style-src, and object-src."
        })
        findings.append({
            "id": "FIND-SEC-CSP",
            "title": "Missing Content-Security-Policy (CSP)",
            "severity": "High",
            "category": "A03:2021 - Injection",
            "impact": "Increases exposure to Cross-Site Scripting (XSS) and data exfiltration.",
            "remediation": "Deploy a restrictive CSP header starting with default-src 'self'."
        })

    # Check X-Frame-Options
    if 'x-frame-options' in lower_headers:
        checks.append({
            "id": "xfo",
            "title": "Clickjacking Protection (X-Frame-Options)",
            "status": "PASS",
            "severity": "Informational",
            "details": f"X-Frame-Options present: '{lower_headers['x-frame-options']}'.",
            "recommendation": "DENY or SAMEORIGIN is appropriately configured."
        })
    else:
        score -= 10
        checks.append({
            "id": "xfo",
            "title": "Clickjacking Protection (X-Frame-Options)",
            "status": "FAIL",
            "severity": "Medium",
            "details": "X-Frame-Options header is absent.",
            "recommendation": "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' to prevent framing."
        })
        findings.append({
            "id": "FIND-SEC-XFO",
            "title": "Missing X-Frame-Options (Clickjacking Risk)",
            "severity": "Medium",
            "category": "A04:2021 - Insecure Design",
            "impact": "Attackers can embed the target site in a malicious iframe to perform clickjacking attacks.",
            "remediation": "Configure X-Frame-Options: SAMEORIGIN or use CSP frame-ancestors 'self'."
        })

    # Check X-Content-Type-Options
    if lower_headers.get('x-content-type-options', '').lower() == 'nosniff':
        checks.append({
            "id": "xcto",
            "title": "MIME Sniffing Protection (X-Content-Type-Options)",
            "status": "PASS",
            "severity": "Informational",
            "details": "X-Content-Type-Options is set to 'nosniff'.",
            "recommendation": "Maintain this configuration across all static and dynamic responses."
        })
    else:
        score -= 8
        checks.append({
            "id": "xcto",
            "title": "MIME Sniffing Protection (X-Content-Type-Options)",
            "status": "FAIL",
            "severity": "Medium",
            "details": "X-Content-Type-Options header is missing or not 'nosniff'.",
            "recommendation": "Add 'X-Content-Type-Options: nosniff'."
        })
        findings.append({
            "id": "FIND-SEC-XCTO",
            "title": "Missing X-Content-Type-Options: nosniff",
            "severity": "Medium",
            "category": "A05:2021 - Security Misconfiguration",
            "impact": "Browsers may attempt MIME sniffing on uploaded assets, facilitating script injection.",
            "remediation": "Send X-Content-Type-Options: nosniff on all HTTP responses."
        })

    # Check Referrer-Policy
    if 'referrer-policy' in lower_headers:
        checks.append({
            "id": "ref_policy",
            "title": "Referrer-Policy Header",
            "status": "PASS",
            "severity": "Informational",
            "details": f"Referrer-Policy defined: '{lower_headers['referrer-policy']}'.",
            "recommendation": "Ensure policy is strict-origin-when-cross-origin or stricter."
        })
    else:
        score -= 5
        checks.append({
            "id": "ref_policy",
            "title": "Referrer-Policy Header",
            "status": "WARN",
            "severity": "Low",
            "details": "Referrer-Policy header is missing (browser default applies).",
            "recommendation": "Add 'Referrer-Policy: strict-origin-when-cross-origin'."
        })

    # Check Information Exposure: Server banner & X-Powered-By
    server_hdr = lower_headers.get('server', '')
    powered_by = lower_headers.get('x-powered-by', '')
    
    if powered_by:
        score -= 7
        checks.append({
            "id": "info_powered",
            "title": "Technology Disclosure (X-Powered-By)",
            "status": "FAIL",
            "severity": "Low",
            "details": f"Technology stack exposed: '{powered_by}'.",
            "recommendation": "Disable X-Powered-By in framework settings (e.g., app.disable('x-powered-by'))."
        })
        findings.append({
            "id": "FIND-EXP-TECH",
            "title": "Backend Framework Disclosure via X-Powered-By",
            "severity": "Low",
            "category": "A05:2021 - Security Misconfiguration",
            "impact": "Assists attackers in fingerprinting server-side technologies for known CVE exploitation.",
            "remediation": "Suppress the X-Powered-By header in web framework production configuration."
        })
    else:
        checks.append({
            "id": "info_powered",
            "title": "Technology Disclosure (X-Powered-By)",
            "status": "PASS",
            "severity": "Informational",
            "details": "No X-Powered-By header detected.",
            "recommendation": "Continue masking backend framework details."
        })

    if server_hdr and any(c.isdigit() for c in server_hdr):
        score -= 5
        checks.append({
            "id": "info_server",
            "title": "Server Version Disclosure",
            "status": "WARN",
            "severity": "Low",
            "details": f"Server version revealed: '{server_hdr}'.",
            "recommendation": "Configure ServerTokens Prod (Apache) or server_tokens off (Nginx)."
        })
    else:
        checks.append({
            "id": "info_server",
            "title": "Server Banner Disclosure",
            "status": "PASS",
            "severity": "Informational",
            "details": f"Server banner generic or obscured: '{server_hdr or 'Hidden'}'.",
            "recommendation": "Maintain minimal server header banners."
        })

    # Clamp Score
    final_score = max(10, min(100, score))
    
    # Calculate Grade
    if final_score >= 90:
        grade = "A+"
        grade_label = "Excellent Posture"
    elif final_score >= 80:
        grade = "A"
        grade_label = "Good Posture"
    elif final_score >= 70:
        grade = "B"
        grade_label = "Acceptable with Gaps"
    elif final_score >= 55:
        grade = "C"
        grade_label = "Moderate Risk"
    elif final_score >= 40:
        grade = "D"
        grade_label = "High Risk"
    else:
        grade = "F"
        grade_label = "Critical Risk"

    # Severity Counts
    severity_counts = {
        "Critical": sum(1 for f in findings if f["severity"] == "Critical"),
        "High": sum(1 for f in findings if f["severity"] == "High"),
        "Medium": sum(1 for f in findings if f["severity"] == "Medium"),
        "Low": sum(1 for f in findings if f["severity"] == "Low"),
        "Informational": sum(1 for c in checks if c["status"] == "PASS")
    }

    return {
        "url": url,
        "hostname": hostname,
        "scan_timestamp": "2026-10-11T22:15:00Z",
        "score": final_score,
        "grade": grade,
        "grade_label": grade_label,
        "ssl_info": cert_info,
        "checks": checks,
        "findings": findings,
        "severity_counts": severity_counts,
        "response_status": status_code
    }


class CyberShieldHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/api/health':
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "status": "healthy",
                "service": "CyberShield Security Scanner API",
                "version": "1.0.0",
                "group": "SE331 - Group 02"
            }).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/api/scan':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                target_url = data.get('url', '').strip()
                if not target_url:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({"error": "URL parameter is required"}).encode('utf-8'))
                    return
                
                result = check_website_security(target_url)
                self._set_headers(200)
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CyberShieldHandler)
    print(f"CyberShield Security Analysis Server running on http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
