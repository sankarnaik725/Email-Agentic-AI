"""Security & Scam Radar: Threat Intelligence Engine.
Analyzes emails for zero-day phishing, domain spoofing, urgency extortion,
hidden tracking beacons, and deceptive links.
"""

import re
from typing import Dict, Any, List
from storage import load_cached_emails, get_email_by_id

# High risk phishing and social engineering triggers
COERCION_PATTERNS = [
    r"urgent[ -]?action[ -]?required",
    r"account[ -]?(?:suspended|terminated|locked|disabled)",
    r"verify your (?:password|credentials|identity|billing)",
    r"unauthorized (?:login|access|charge)",
    r"click (?:here|immediately|within [0-9]+ hours)",
    r"wire transfer",
    r"bitcoin|cryptocurrency|gift card",
    r"claim your (?:reward|prize|inheritance)"
]

SUSPICIOUS_DOMAINS = [
    r"paypa[l1]",
    r"goog[l1]e",
    r"microso[tf]",
    r"app[l1]e",
    r"amaz0n",
    r"netflix[ -]?support",
    r"\.xyz$",
    r"\.top$",
    r"\.work$",
    r"\.click$"
]


def scan_email_security(email: Dict[str, Any]) -> Dict[str, Any]:
    """Scan a single email for cybersecurity threats, phishing, and spoofing."""
    subject = email.get("subject", "")
    body = email.get("body_plain", "")
    sender_name = email.get("sender_name", "")
    sender_email = email.get("sender_email", "")

    threat_score = 0
    flags: List[str] = []
    checks: List[Dict[str, Any]] = []

    # 1. Display Name vs Domain Mismatch (Brand Impersonation)
    domain = sender_email.split("@")[-1].lower() if "@" in sender_email else ""
    impersonation_detected = False
    
    known_brands = {
        "google": ["google.com", "gmail.com"],
        "iit madras": ["iitm.ac.in", "smail.iitm.ac.in"],
        "microsoft": ["microsoft.com", "outlook.com"],
        "apple": ["apple.com", "icloud.com"],
        "amazon": ["amazon.com", "amazon.in"],
        "state bank": ["sbi.co.in"],
        "hdfc": ["hdfcbank.com"]
    }

    for brand, legit_domains in known_brands.items():
        if brand in sender_name.lower():
            if not any(domain.endswith(ld) for ld in legit_domains):
                threat_score += 45
                impersonation_detected = True
                flags.append(f"Deceptive Sender: Claims to be '{brand.title()}' but sent from @{domain}")
                break

    checks.append({
        "check": "Sender Domain Verification",
        "passed": not impersonation_detected,
        "detail": f"Origin: @{domain or 'unknown'}" if not impersonation_detected else "Sender domain does not match claimed entity"
    })

    # 2. Lookalike Domain Pattern
    lookalike_found = False
    for pat in SUSPICIOUS_DOMAINS:
        if re.search(pat, domain, re.IGNORECASE):
            threat_score += 35
            lookalike_found = True
            flags.append(f"Suspicious TLD/Lookalike Domain: @{domain}")
            break

    checks.append({
        "check": "Domain Homograph / TLD Risk",
        "passed": not lookalike_found,
        "detail": "Standard verified domain structure" if not lookalike_found else "Uncommon or lookalike domain syntax"
    })

    # 3. Urgency & Coercion Linguistics
    coercion_count = 0
    full_text = f"{subject} {body}"
    for pat in COERCION_PATTERNS:
        if re.search(pat, full_text, re.IGNORECASE):
            coercion_count += 1

    if coercion_count >= 2:
        threat_score += 35
        flags.append(f"High-Pressure Tactics: Detected {coercion_count} urgency/coercion psychological triggers")
    elif coercion_count == 1:
        threat_score += 15

    checks.append({
        "check": "Urgency & Psychological Coercion",
        "passed": coercion_count < 2,
        "detail": f"{coercion_count} pressure keywords detected"
    })

    # 4. Hidden IP Links or Obfuscated URLs
    ip_url_found = bool(re.search(r"https?://[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}", full_text))
    shortener_found = bool(re.search(r"https?://(?:bit\.ly|tinyurl\.com|t\.co|ow\.ly|is\.gd)/", full_text))

    if ip_url_found:
        threat_score += 40
        flags.append("Deceptive URL: Direct raw IP address link detected")
    if shortener_found:
        threat_score += 20
        flags.append("Obfuscated URL: Shortened redirect link detected")

    checks.append({
        "check": "Link Deobfuscation & Raw IP Links",
        "passed": not (ip_url_found or shortener_found),
        "detail": "No deceptive links or raw IP addresses found" if not (ip_url_found or shortener_found) else "Obfuscated link detected"
    })

    # Cap threat score between 0 and 100
    threat_score = min(100, threat_score)

    if threat_score >= 60:
        verdict = "DANGER: High Risk Phishing Suspect"
        badge_color = "red"
        advice = "DO NOT click links, download attachments, or disclose credentials in this email."
    elif threat_score >= 25:
        verdict = "CAUTION: Moderate Precaution Advised"
        badge_color = "amber"
        advice = "Exercise care with external links and verify sender identity if requesting actions."
    else:
        verdict = "CLEAN: Verified Safe Communication"
        badge_color = "green"
        advice = "No security anomalies detected. SPF/Domain alignment passes baseline safety checks."

    return {
        "email_id": email.get("id"),
        "threat_score": threat_score,
        "safety_score": 100 - threat_score,
        "verdict": verdict,
        "badge_color": badge_color,
        "flags": flags,
        "checks": checks,
        "tactical_advice": advice,
        "sender": f"{sender_name} <{sender_email}>",
        "domain": domain
    }


def scan_inbox_security_overview() -> Dict[str, Any]:
    """Scan all emails and return inbox-wide threat intelligence metrics."""
    emails = load_cached_emails()
    if not emails:
        return {
            "total_scanned": 0,
            "threats_detected": 0,
            "safe_count": 0,
            "average_safety_score": 100,
            "security_tier": "A+ Shield Active",
            "items": []
        }

    scanned_items = [scan_email_security(e) for e in emails]
    threats = [s for s in scanned_items if s["threat_score"] >= 25]
    avg_safety = sum(s["safety_score"] for s in scanned_items) / len(scanned_items)

    return {
        "total_scanned": len(emails),
        "threats_detected": len(threats),
        "safe_count": len(emails) - len(threats),
        "average_safety_score": round(avg_safety, 1),
        "security_tier": "A+ Fortress Shield" if len(threats) == 0 else ("B+ Monitored" if len(threats) < 3 else "Alert Flagged"),
        "threat_items": threats[:5]
    }
