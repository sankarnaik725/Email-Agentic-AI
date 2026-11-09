"""Mail Connector: Connects to real IMAP servers (Gmail, Outlook, custom)
and provides a rich realistic Demo Inbox when credentials are not configured.
"""

import imaplib
import email
import email.message
from email.message import Message
from email.header import decode_header
import email.utils
from datetime import datetime, timezone
import re
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup


def decode_str(header_value: Optional[str]) -> str:
    """Decode RFC2047 encoded email header fields."""
    if not header_value:
        return ""
    decoded_fragments = decode_header(header_value)
    result = []
    for fragment, encoding in decoded_fragments:
        if isinstance(fragment, bytes):
            try:
                result.append(fragment.decode(encoding or "utf-8", errors="replace"))
            except Exception:
                result.append(fragment.decode("utf-8", errors="replace"))
        else:
            result.append(str(fragment))
    return "".join(result)


def clean_html(html_content: str) -> str:
    """Extract readable text from HTML email content."""
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        # Remove script and style elements
        for element in soup(["script", "style", "head", "title", "meta"]):
            element.extract()
        text = soup.get_text(separator="\n")
        # Collapse multiple blank lines
        lines = [line.strip() for line in text.splitlines()]
        return "\n".join(chunk for chunk in lines if chunk)
    except Exception:
        # Fallback regex strip
        clean = re.sub(r"<[^>]+>", " ", html_content)
        return re.sub(r"\s+", " ", clean).strip()


def extract_email_body(msg: email.message.Message) -> tuple[str, str]:
    """Extract plain text and HTML bodies from an email message."""
    plain_text = ""
    html_text = ""

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))

            # Skip attachments
            if "attachment" in content_disposition:
                continue

            try:
                payload = part.get_payload(decode=True)
                if not payload:
                    continue
                charset = part.get_content_charset() or "utf-8"
                text = payload.decode(charset, errors="replace")

                if content_type == "text/plain" and not plain_text:
                    plain_text = text
                elif content_type == "text/html" and not html_text:
                    html_text = text
            except Exception:
                continue
    else:
        content_type = msg.get_content_type()
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or "utf-8"
                text = payload.decode(charset, errors="replace")
                if content_type == "text/html":
                    html_text = text
                    plain_text = clean_html(text)
                else:
                    plain_text = text
        except Exception:
            plain_text = str(msg.get_payload())

    if not plain_text and html_text:
        plain_text = clean_html(html_text)

    return plain_text.strip(), html_text.strip()


def extract_attachments(msg: email.message.Message) -> List[Dict[str, str]]:
    """Extract attachment metadata from an email message."""
    attachments = []
    if msg.is_multipart():
        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            if "attachment" in content_disposition or part.get_filename():
                filename = decode_str(part.get_filename() or "attachment")
                content_type = part.get_content_type()
                size = len(part.get_payload(decode=True) or b"")
                size_str = f"{round(size / 1024, 1)} KB" if size < 1048576 else f"{round(size / 1048576, 1)} MB"
                attachments.append({
                    "name": filename,
                    "type": content_type,
                    "size": size_str
                })
    return attachments


class MailConnector:
    """Manages real IMAP connectivity and retrieval."""

    def __init__(self, host: str, port: int, user: str, password: str, use_ssl: bool = True):
        self.host = host.strip() if host else host
        self.port = port
        self.user = user.strip() if user else user
        self.password = password.replace(" ", "").strip() if password else password
        self.use_ssl = use_ssl

    def test_connection(self) -> Dict[str, Any]:
        """Test IMAP connection and credentials."""
        try:
            if self.use_ssl:
                server = imaplib.IMAP4_SSL(self.host, self.port, timeout=10)
            else:
                server = imaplib.IMAP4(self.host, self.port, timeout=10)

            server.login(self.user, self.password)
            status, folders = server.list()
            server.logout()
            return {"success": True, "message": f"Successfully connected to {self.host} as {self.user}"}
        except imaplib.IMAP4.error as e:
            err_msg = str(e)
            if "AUTHENTICATIONFAILED" in err_msg or "Invalid credentials" in err_msg:
                return {
                    "success": False,
                    "message": "Authentication failed. If using Gmail, make sure to use a 16-character App Password, NOT your regular Google account password."
                }
            return {"success": False, "message": f"IMAP Error: {err_msg}"}
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    def fetch_emails(self, folder: str = "INBOX", limit: int = 15) -> List[Dict[str, Any]]:
        """Fetch the most recent emails from the specified IMAP folder."""
        emails_list = []
        server = None
        try:
            if self.use_ssl:
                server = imaplib.IMAP4_SSL(self.host, self.port, timeout=15)
            else:
                server = imaplib.IMAP4(self.host, self.port, timeout=15)

            server.login(self.user, self.password)
            server.select(folder, readonly=True)

            status, data = server.search(None, "ALL")
            if status != "OK" or not data or not data[0]:
                return []

            email_ids = data[0].split()
            # Fetch the most recent IDs
            recent_ids = email_ids[-limit:]
            recent_ids.reverse()

            for eid in recent_ids:
                status, msg_data = server.fetch(eid, "(RFC822)")
                if status != "OK" or not msg_data:
                    continue

                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)

                subject = decode_str(msg.get("Subject", "(No Subject)"))
                from_header = decode_str(msg.get("From", ""))
                sender_name, sender_address = email.utils.parseaddr(from_header)
                if not sender_name:
                    sender_name = sender_address.split("@")[0] if "@" in sender_address else from_header

                date_header = msg.get("Date", "")
                date_parsed = email.utils.parsedate_to_datetime(date_header) if date_header else datetime.now(timezone.utc)
                iso_date = date_parsed.isoformat() if hasattr(date_parsed, "isoformat") else datetime.now().isoformat()

                plain_body, html_body = extract_email_body(msg)
                attachments = extract_attachments(msg)

                emails_list.append({
                    "id": f"imap_{eid.decode('utf-8', errors='ignore')}",
                    "uid": eid.decode("utf-8", errors="ignore"),
                    "subject": subject,
                    "sender_name": sender_name,
                    "sender_email": sender_address,
                    "date": iso_date,
                    "date_display": date_parsed.strftime("%b %d, %Y %I:%M %p") if hasattr(date_parsed, "strftime") else date_header,
                    "body_plain": plain_body or "(Empty email body)",
                    "body_html": html_body,
                    "snippet": (plain_body[:150] + "...") if len(plain_body) > 150 else plain_body,
                    "attachments": attachments,
                    "is_unread": True,
                    "is_demo": False
                })

            return emails_list

        except Exception as e:
            raise RuntimeError(f"Error fetching from IMAP ({self.host}): {str(e)}")
        finally:
            if server:
                try:
                    server.close()
                except Exception:
                    pass
                try:
                    server.logout()
                except Exception:
                    pass

    def send_email_smtp(self, to_email: str, subject: str, body_text: str, in_reply_to: Optional[str] = None) -> Dict[str, Any]:
        """Dispatch real email via SMTP using IMAP credentials."""
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_host = self.host.replace("imap.", "smtp.")
        if "gmail" in self.host.lower():
            smtp_host = "smtp.gmail.com"
        elif "outlook" in self.host.lower() or "office365" in self.host.lower():
            smtp_host = "smtp.office365.com"

        msg = MIMEMultipart()
        msg["From"] = self.user
        msg["To"] = to_email
        msg["Subject"] = subject if subject.lower().startswith("re:") else f"Re: {subject}"
        msg["Date"] = email.utils.formatdate(localtime=True)
        if in_reply_to:
            msg["In-Reply-To"] = in_reply_to
            msg["References"] = in_reply_to

        msg.attach(MIMEText(body_text, "plain", "utf-8"))

        try:
            try:
                server = smtplib.SMTP(smtp_host, 587, timeout=12)
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(self.user, self.password)
                server.send_message(msg)
                server.quit()
                return {"success": True, "message": f"Successfully sent via {smtp_host}:587 to {to_email}"}
            except Exception:
                server = smtplib.SMTP_SSL(smtp_host, 465, timeout=12)
                server.login(self.user, self.password)
                server.send_message(msg)
                server.quit()
                return {"success": True, "message": f"Successfully sent via {smtp_host}:465 to {to_email}"}
        except Exception as e:
            return {"success": False, "error": f"SMTP dispatch error: {str(e)}"}

    def save_draft_imap(self, to_email: str, subject: str, body_text: str) -> Dict[str, Any]:
        """Save draft to official IMAP Drafts folder."""
        import time
        from email.mime.text import MIMEText

        msg = MIMEText(body_text, "plain", "utf-8")
        msg["From"] = self.user
        msg["To"] = to_email
        msg["Subject"] = subject if subject.lower().startswith("re:") else f"Re: {subject}"
        msg["Date"] = email.utils.formatdate(localtime=True)

        server = None
        try:
            if self.use_ssl:
                server = imaplib.IMAP4_SSL(self.host, self.port, timeout=10)
            else:
                server = imaplib.IMAP4(self.host, self.port, timeout=10)
            server.login(self.user, self.password)

            for folder in ["Drafts", "[Gmail]/Drafts", "INBOX.Drafts"]:
                try:
                    res = server.append(folder, "\\Draft", imaplib.Time2Internaldate(time.time()), msg.as_bytes())
                    if res[0] == "OK":
                        server.logout()
                        return {"success": True, "message": f"Saved draft to {folder}"}
                except Exception:
                    continue
            server.logout()
            return {"success": False, "error": "Could not find Drafts folder on server"}
        except Exception as e:
            return {"success": False, "error": f"IMAP draft error: {str(e)}"}


def test_apps_script_connection(script_url: str, token: str = "iitm_smail_secret_2026") -> Dict[str, Any]:
    """Test connection to deployed Google Apps Script gateway."""
    import requests
    if not script_url:
        return {"success": False, "message": "Apps Script Web App URL cannot be empty."}
    
    clean_url = script_url.strip()
    sep = "&" if "?" in clean_url else "?"
    test_url = f"{clean_url}{sep}token={token}&limit=1"
    try:
        r = requests.get(test_url, allow_redirects=True, timeout=15)
        if r.status_code == 200:
            data = r.json()
            if "error" in data:
                return {"success": False, "message": f"Script error: {data['error']}"}
            count = len(data.get("emails", []))
            return {"success": True, "message": f"Successfully connected to IITM Smail Gateway! Verified access to mailbox."}
        elif r.status_code == 404:
            return {"success": False, "message": "Received 404 Not Found. Please make sure you copied the Web app URL (ending in /exec) and set 'Who has access' to 'Anyone'."}
        else:
            return {"success": False, "message": f"HTTP status {r.status_code}. Make sure 'Who has access' is set to 'Anyone' in deployment settings."}
    except Exception as e:
        return {"success": False, "message": f"Connection error: {str(e)}"}


def fetch_from_apps_script(script_url: str, token: str = "iitm_smail_secret_2026", limit: int = 15) -> List[Dict[str, Any]]:
    """Fetch emails from deployed Google Apps Script gateway."""
    import requests
    clean_url = script_url.strip()
    sep = "&" if "?" in clean_url else "?"
    url = f"{clean_url}{sep}token={token}&limit={limit}"
    
    resp = requests.get(url, allow_redirects=True, timeout=25)
    if resp.status_code != 200:
        raise RuntimeError(f"Apps script returned HTTP {resp.status_code}")
    data = resp.json()
    if "error" in data:
        raise RuntimeError(f"Apps script error: {data['error']}")
    return data.get("emails", [])


def get_demo_emails() -> List[Dict[str, Any]]:
    """Return realistic, rich mock emails spanning diverse categories and priorities.
    Provides out-of-the-box demo functionality for instant testing.
    """
    return [
        {
            "id": "demo_01",
            "subject": "URGENT: Executive Board Presentation Moved to Tomorrow 9 AM - Final Slides Needed",
            "sender_name": "Marcus Vance",
            "sender_email": "m.vance@acme-corp.com",
            "date": "2026-10-02T08:15:00Z",
            "date_display": "Oct 02, 2026 08:15 AM",
            "body_plain": (
                "Hi Team,\n\n"
                "The board of directors just moved the Q3 Strategic Review from next Monday up to tomorrow at 9:00 AM EST.\n\n"
                "We need all division leads to finalize their slides in the master deck by 6:00 PM today. Specifically:\n"
                "- Santhosh: Finalize the AI Automation ROI breakdown (Slides 14-18)\n"
                "- Elena: Review enterprise ARR forecasts and churn rates\n"
                "- David: Check infrastructure capacity projections\n\n"
                "Please confirm receipt of this email immediately and ping me on Slack once your sections are updated.\n\n"
                "Thanks,\nMarcus Vance\nVP of Operations"
            ),
            "body_html": "<p>Hi Team,<br><br>The board of directors just moved the <b>Q3 Strategic Review</b> from next Monday up to <b>tomorrow at 9:00 AM EST</b>.<br><br>We need all division leads to finalize their slides in the master deck by <b>6:00 PM today</b>. Specifically:<br><ul><li><b>Santhosh:</b> Finalize the AI Automation ROI breakdown (Slides 14-18)</li><li><b>Elena:</b> Review enterprise ARR forecasts and churn rates</li><li><b>David:</b> Check infrastructure capacity projections</li></ul>Please confirm receipt of this email immediately and ping me on Slack once your sections are updated.<br><br>Thanks,<br><b>Marcus Vance</b><br>VP of Operations</p>",
            "snippet": "The board of directors just moved the Q3 Strategic Review from next Monday up to tomorrow at 9:00 AM EST. Finalize slides by 6:00 PM...",
            "attachments": [
                {"name": "Master_Board_Deck_Q3_v4.pptx", "type": "application/vnd.ms-powerpoint", "size": "14.2 MB"}
            ],
            "is_unread": True,
            "is_demo": True
        },
        {
            "id": "demo_02",
            "subject": "Invoice INV-2026-8941: Cloud Cluster Tier 3 Renewal Notice ($1,450.00)",
            "sender_name": "Stripe Billing via HyperCloud",
            "sender_email": "billing@hypercloud-services.io",
            "date": "2026-10-02T06:30:00Z",
            "date_display": "Oct 02, 2026 06:30 AM",
            "body_plain": (
                "Dear Customer,\n\n"
                "Your subscription for 'Enterprise Kubernetes Cluster (Cluster-US-East)' will renew automatically on October 08, 2026.\n\n"
                "Invoice Summary:\n"
                "Invoice Number: INV-2026-8941\n"
                "Amount Due: $1,450.00 USD\n"
                "Payment Method: Corporate Visa ending in 4092\n"
                "Due Date: October 08, 2026\n\n"
                "To modify your tier or update your payment details before the billing cycle charges, please visit your account billing portal: https://hypercloud-services.io/billing/manage\n\n"
                "Thank you for choosing HyperCloud."
            ),
            "body_html": "<p>Dear Customer,<br><br>Your subscription for <b>Enterprise Kubernetes Cluster (Cluster-US-East)</b> will renew automatically on <b>October 08, 2026</b>.<br><br><b>Invoice Summary:</b><br>Invoice Number: INV-2026-8941<br>Amount Due: <b>$1,450.00 USD</b><br>Payment Method: Corporate Visa ending in 4092<br>Due Date: October 08, 2026<br><br>To modify your tier or update payment details, visit your billing portal.<br><br>Thank you for choosing HyperCloud.</p>",
            "snippet": "Your subscription for Enterprise Kubernetes Cluster will renew on October 08, 2026. Invoice Number: INV-2026-8941. Amount Due: $1,450.00 USD...",
            "attachments": [
                {"name": "Invoice_INV-2026-8941.pdf", "type": "application/pdf", "size": "145 KB"}
            ],
            "is_unread": True,
            "is_demo": True
        },
        {
            "id": "demo_03",
            "subject": "Action Required: Annual SOC 2 Security & Compliance Access Audit",
            "sender_name": "Infosec Compliance Bot",
            "sender_email": "security-audit@company-internal.net",
            "date": "2026-10-01T19:40:00Z",
            "date_display": "Oct 01, 2026 07:40 PM",
            "body_plain": (
                "Action Required for All Technical Staff:\n\n"
                "In preparation for our annual SOC 2 Type II audit, all team members holding production database or SSH bastion credentials must complete their access verification by Friday, October 06, 2026.\n\n"
                "Required Steps:\n"
                "1. Log into Okta Identity Governance.\n"
                "2. Confirm your active IAM roles and revoke any unused staging credentials.\n"
                "3. Ensure 2FA hardware keys (YubiKey) are registered as the primary factor.\n\n"
                "Failure to complete this audit will result in temporary suspension of production access until manual re-verification is completed.\n\n"
                "Security Operations Team"
            ),
            "body_html": "<p><b>Action Required for All Technical Staff:</b><br><br>In preparation for our annual SOC 2 Type II audit, all team members holding production access must complete verification by <b>Friday, October 06, 2026</b>.<br><br><ol><li>Log into Okta Identity Governance</li><li>Confirm active IAM roles</li><li>Ensure 2FA hardware key is registered</li></ol>Security Operations Team</p>",
            "snippet": "All team members holding production database or SSH bastion credentials must complete access verification by Friday, October 06, 2026...",
            "attachments": [],
            "is_unread": True,
            "is_demo": True
        },
        {
            "id": "demo_04",
            "subject": "Quick sync next Tuesday on AI Mail Agent Architecture?",
            "sender_name": "Dr. Sarah Chen",
            "sender_email": "sarah.chen@deepmind-labs.org",
            "date": "2026-10-01T15:20:00Z",
            "date_display": "Oct 01, 2026 03:20 PM",
            "body_plain": (
                "Hi Santhosh,\n\n"
                "I was looking over your design doc for the multi-tier mail categorization pipeline and had a few ideas around low-latency streaming summaries.\n\n"
                "Are you free for a 30-minute Google Meet call next Tuesday, October 06, around 2:00 PM or 3:30 PM IST?\n\n"
                "Let me know if either time works for your schedule, or feel free to propose an alternate slot.\n\n"
                "Best,\nSarah"
            ),
            "body_html": "<p>Hi Santhosh,<br><br>I was looking over your design doc for the multi-tier mail categorization pipeline and had a few ideas around low-latency streaming summaries.<br><br>Are you free for a 30-minute Google Meet call <b>next Tuesday, October 06, around 2:00 PM or 3:30 PM IST</b>?<br><br>Let me know if either time works for your schedule, or feel free to propose an alternate slot.<br><br>Best,<br>Sarah</p>",
            "snippet": "Are you free for a 30-minute Google Meet call next Tuesday, October 06, around 2:00 PM or 3:30 PM IST? Catch up on AI Mail Agent...",
            "attachments": [],
            "is_unread": False,
            "is_demo": True
        },
        {
            "id": "demo_05",
            "subject": "Weekend family lunch & celebration at our place! 🍲",
            "sender_name": "Priya Sharma",
            "sender_email": "priya.sharma91@gmail.com",
            "date": "2026-10-01T11:05:00Z",
            "date_display": "Oct 01, 2026 11:05 AM",
            "body_plain": (
                "Hey Santhosh!\n\n"
                "Hope you're having a productive week. We are hosting a get-together this Sunday around 1:00 PM to celebrate Rohan's new job offer!\n\n"
                "Mom is making her special biryani and sweets. Let us know by Friday if you can make it so we know how much food to prepare.\n\n"
                "Bring anyone you'd like! See you soon,\n\nPriya"
            ),
            "body_html": "<p>Hey Santhosh!<br><br>Hope you're having a productive week. We are hosting a get-together this <b>Sunday around 1:00 PM</b> to celebrate Rohan's new job offer! 🍲<br><br>Mom is making her special biryani and sweets. Let us know by Friday if you can make it.<br><br>See you soon,<br>Priya</p>",
            "snippet": "We are hosting a get-together this Sunday around 1:00 PM to celebrate Rohan's new job offer! Let us know by Friday...",
            "attachments": [],
            "is_unread": False,
            "is_demo": True
        },
        {
            "id": "demo_06",
            "subject": "The Batch #284: Autonomous Reasoning Agents & Multimodal Memory",
            "sender_name": "DeepLearning.AI",
            "sender_email": "newsletter@deeplearning.ai",
            "date": "2026-09-30T17:00:00Z",
            "date_display": "Sep 30, 2026 05:00 PM",
            "body_plain": (
                "Dear AI Enthusiast,\n\n"
                "In this week's issue of The Batch:\n"
                "1. Self-evolving reasoning architectures demonstrate zero-shot generalization across code generation benchmarks.\n"
                "2. Open-source local models match proprietary weights on 100k token context benchmarks.\n"
                "3. Andrew Ng discusses how multi-agent collaboration frameworks will reshape software engineering in 2027.\n\n"
                "Read the full newsletter online: https://deeplearning.ai/the-batch/issue-284\n\n"
                "Keep learning!\nAndrew Ng & the DeepLearning.AI Team"
            ),
            "body_html": "<p>Dear AI Enthusiast,<br><br>In this week's issue of <b>The Batch</b>:<br>1. Self-evolving reasoning architectures demonstrate zero-shot generalization<br>2. Open-source local models match proprietary weights<br>3. Andrew Ng on multi-agent collaboration frameworks<br><br>Keep learning!<br>The DeepLearning.AI Team</p>",
            "snippet": "Self-evolving reasoning architectures demonstrate zero-shot generalization across code generation benchmarks. Read issue #284...",
            "attachments": [],
            "is_unread": False,
            "is_demo": True
        },
        {
            "id": "demo_07",
            "subject": "CRITICAL: 502 Bad Gateway Spike on Checkout API (Inc-4029)",
            "sender_name": "Datadog Alert Manager",
            "sender_email": "alerts@monitoring.internal.io",
            "date": "2026-10-02T09:12:00Z",
            "date_display": "Oct 02, 2026 09:12 AM",
            "body_plain": (
                "[P1 INCIDENT ALERT] Incident #4029\n\n"
                "Service: api-gateway-prod\n"
                "Metric: HTTP 502 error rate > 8.5% over the past 5 minutes\n"
                "Affected Region: us-east-1 (Northern Virginia)\n"
                "Current Status: TRIGGERED / INVESTIGATING\n\n"
                "Automated diagnostics suggest database connection pool exhaustion following Redis cache eviction.\n\n"
                "On-Call Engineer: Santhosh / SRE Tier 2\n"
                "War Room Link: https://zoom.us/j/9082341239\n"
                "Dashboard: https://app.datadoghq.com/monitors/4029"
            ),
            "body_html": "<p><span style='color:red;font-weight:bold;'>[P1 INCIDENT ALERT] Incident #4029</span><br><br><b>Service:</b> api-gateway-prod<br><b>Metric:</b> HTTP 502 error rate > 8.5%<br><b>Affected Region:</b> us-east-1<br><b>Status:</b> TRIGGERED<br><br>Automated diagnostics suggest database connection pool exhaustion.<br><b>On-Call Engineer:</b> Santhosh / SRE Tier 2</p>",
            "snippet": "P1 INCIDENT ALERT #4029: HTTP 502 error rate > 8.5% on api-gateway-prod. Connection pool exhaustion. War room link...",
            "attachments": [],
            "is_unread": True,
            "is_demo": True
        },
        {
            "id": "demo_08",
            "subject": "⚡ 48-Hour Fall Sale: 40% Off Mechanical Keyboards & Desk Accessories",
            "sender_name": "Keychron Deals",
            "sender_email": "promotions@keychron-store.com",
            "date": "2026-09-30T10:00:00Z",
            "date_display": "Sep 30, 2026 10:00 AM",
            "body_plain": (
                "Upgrade your developer setup today!\n\n"
                "Get up to 40% off on custom wireless mechanical keyboards, ergonomic wrist rests, and desk mats.\n\n"
                "Use promo code: AUTUMN40 at checkout.\n"
                "Offer ends Thursday at midnight. Free shipping on orders over $75.\n\n"
                "Shop now: https://keychron-store.com/collections/autumn-sale\n\n"
                "Unsubscribe from marketing emails: https://keychron-store.com/opt-out"
            ),
            "body_html": "<p>Upgrade your developer setup today!<br><br>Get up to <b>40% off</b> on custom wireless mechanical keyboards with code <b>AUTUMN40</b>.<br><br>Offer ends Thursday at midnight.<br><a href='https://keychron-store.com'>Shop Now</a></p>",
            "snippet": "Upgrade your developer setup today! Get up to 40% off on custom wireless mechanical keyboards with code AUTUMN40...",
            "attachments": [],
            "is_unread": False,
            "is_demo": True
        },
        {
            "id": "demo_09",
            "subject": "URGENT SECURITY ALERT: Immediate verification required to prevent suspension",
            "sender_name": "Account Security Team",
            "sender_email": "security-warning@mail-account-update-verification-notice.xyz",
            "date": "2026-10-01T22:15:00Z",
            "date_display": "Oct 01, 2026 10:15 PM",
            "body_plain": (
                "WARNING: Unusual login detected from Moscow, Russia.\n\n"
                "Your mailbox will be permanently deactivated within 12 hours due to suspected unauthorized access.\n\n"
                "You must click the secure link below to confirm your password and restore full access:\n"
                "http://secure-login-validation-account.xyz/auth?user=santhosh\n\n"
                "Do not reply to this email.\n"
                "Security Enforcement Department"
            ),
            "body_html": "<p><b>WARNING: Unusual login detected from Moscow, Russia.</b><br><br>Your mailbox will be permanently deactivated within 12 hours.<br><br><a href='http://secure-login-validation-account.xyz/auth?user=santhosh'>Click here immediately to verify password</a></p>",
            "snippet": "WARNING: Unusual login detected from Moscow, Russia. Your mailbox will be permanently deactivated within 12 hours. Click to verify...",
            "attachments": [],
            "is_unread": True,
            "is_demo": True
        },
        {
            "id": "demo_10",
            "subject": "Benefits Open Enrollment 2027: Health, Dental & 401(k) Matching",
            "sender_name": "People Operations",
            "sender_email": "hr-benefits@acme-corp.com",
            "date": "2026-09-29T14:00:00Z",
            "date_display": "Sep 29, 2026 02:00 PM",
            "body_plain": (
                "Dear Colleagues,\n\n"
                "The annual Benefits Open Enrollment period for 2027 is now officially open and will run through Friday, October 24, 2026.\n\n"
                "Key Highlights for this Year:\n"
                "- 401(k) company match increased to 6% with immediate vesting\n"
                "- New wellness stipend: $750/year for gym, mental health, or home fitness\n"
                "- Enhanced dental and vision coverage networks\n\n"
                "Please review the attached 2027 Benefits Guide and submit your elections in Workday before the October 24 deadline. Current plans do not automatically roll over for Flexible Spending Accounts (FSA).\n\n"
                "Best regards,\nPeople & Culture Team"
            ),
            "body_html": "<p>Dear Colleagues,<br><br>The annual Benefits Open Enrollment period for 2027 is now open through <b>October 24, 2026</b>.<br><br>Key highlights include 401(k) match increase and $750 wellness stipend.<br><br>People & Culture Team</p>",
            "snippet": "Annual Benefits Open Enrollment for 2027 is open through October 24, 2026. 401(k) match increased to 6%, new wellness stipend...",
            "attachments": [
                {"name": "2027_Employee_Benefits_Guide.pdf", "type": "application/pdf", "size": "3.8 MB"}
            ],
            "is_unread": False,
            "is_demo": True
        }
    ]
