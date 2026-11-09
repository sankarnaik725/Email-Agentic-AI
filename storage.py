"""Storage manager: Persists emails, AI analysis results, and action item states to local disk."""

import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

DATA_DIR = Path(__file__).resolve().parent / "data"
CACHE_FILE = DATA_DIR / "inbox_cache.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_active_account_id() -> str:
    """Retrieve currently active account ID from accounts.json."""
    accounts_file = DATA_DIR / "accounts.json"
    if accounts_file.exists():
        try:
            with open(accounts_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("active_account_id", "personal_gmail")
        except Exception:
            pass
    return "personal_gmail"


def load_cached_emails() -> List[Dict[str, Any]]:
    """Load cached emails with their AI analysis from disk."""
    if not CACHE_FILE.exists():
        return []
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Error loading cache: {e}")
        return []


def save_cached_emails(emails: List[Dict[str, Any]]) -> None:
    """Save email list to cache file and the active account's dedicated cache using atomic write."""
    try:
        temp_file = CACHE_FILE.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(emails, f, indent=2, ensure_ascii=False)
        temp_file.replace(CACHE_FILE)

        # Strictly persist to the active account's dedicated cache file
        active_id = get_active_account_id()
        account_cache = DATA_DIR / f"inbox_cache_{active_id}.json"
        temp_acc_file = account_cache.with_suffix(".tmp")
        with open(temp_acc_file, "w", encoding="utf-8") as f:
            json.dump(emails, f, indent=2, ensure_ascii=False)
        temp_acc_file.replace(account_cache)
    except Exception as e:
        print(f"Error writing to cache: {e}")


def get_email_by_id(email_id: str) -> Optional[Dict[str, Any]]:
    """Find a single email by its unique ID."""
    emails = load_cached_emails()
    for em in emails:
        if em.get("id") == email_id:
            return em
    return None


def append_chat_message(email_id: str, role: str, content: str) -> List[Dict[str, str]]:
    """Append a user or assistant message to an email's conversational history."""
    emails = load_cached_emails()
    history = []
    for em in emails:
        if em.get("id") == email_id:
            if "chat_history" not in em or not isinstance(em["chat_history"], list):
                em["chat_history"] = []
            em["chat_history"].append({"role": role, "content": content, "timestamp": datetime.now().isoformat()})
            history = em["chat_history"]
            break
    save_cached_emails(emails)
    return history


def get_chat_history(email_id: str) -> List[Dict[str, str]]:
    """Retrieve chat history for a specific email."""
    em = get_email_by_id(email_id)
    if em and "chat_history" in em and isinstance(em["chat_history"], list):
        return em["chat_history"]
    return []


def update_action_item_status(email_id: str, task_index: int, completed: bool) -> Optional[Dict[str, Any]]:
    """Toggle or set completion status of a specific action item within an email."""
    emails = load_cached_emails()
    updated_email = None
    for em in emails:
        if em.get("id") == email_id:
            ai = em.get("ai_analysis", {})
            action_items = ai.get("action_items", [])
            if 0 <= task_index < len(action_items):
                action_items[task_index]["completed"] = completed
                em["ai_analysis"]["action_items"] = action_items
                updated_email = em
            break

    if updated_email:
        save_cached_emails(emails)
    return updated_email


def update_email_read_status(email_id: str, is_unread: bool) -> Optional[Dict[str, Any]]:
    """Update read/unread status for an email."""
    emails = load_cached_emails()
    target = None
    for em in emails:
        if em.get("id") == email_id:
            em["is_unread"] = is_unread
            target = em
            break
    if target:
        save_cached_emails(emails)
    return target


def update_email_analysis(email_id: str, new_analysis: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update or overwrite the AI analysis for an email."""
    emails = load_cached_emails()
    target = None
    for em in emails:
        if em.get("id") == email_id:
            em["ai_analysis"] = new_analysis
            target = em
            break
    if target:
        save_cached_emails(emails)
    return target


def record_sent_reply(email_id: str, to_email: str, subject: str, body: str, mode: str = "send") -> Optional[Dict[str, Any]]:
    """Record an outgoing sent email or draft against an email thread."""
    emails = load_cached_emails()
    target = None
    for em in emails:
        if em.get("id") == email_id:
            if "sent_replies" not in em or not isinstance(em["sent_replies"], list):
                em["sent_replies"] = []
            reply_entry = {
                "to_email": to_email,
                "subject": subject,
                "body": body,
                "mode": mode,
                "timestamp": datetime.now().isoformat(),
                "time_display": datetime.now().strftime("%b %d, %Y %I:%M %p")
            }
            em["sent_replies"].append(reply_entry)
            em["has_replied"] = True
            em["last_reply_at"] = reply_entry["time_display"]
            target = em
            break
    if target:
        save_cached_emails(emails)
    return target


# ============================================================================
# Autonomous Draft Queue & Workflows Storage
# ============================================================================
DRAFTS_FILE = DATA_DIR / "drafts_queue.json"
WORKFLOWS_FILE = DATA_DIR / "workflow_rules.json"


def load_draft_queue() -> List[Dict[str, Any]]:
    """Load pending autonomous drafts staged for user approval."""
    if not DRAFTS_FILE.exists():
        return []
    try:
        with open(DRAFTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Error loading drafts queue: {e}")
        return []


def save_draft_queue(queue: List[Dict[str, Any]]) -> None:
    """Save pending drafts queue atomically."""
    try:
        temp_file = DRAFTS_FILE.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(queue, f, indent=2, ensure_ascii=False)
        temp_file.replace(DRAFTS_FILE)
    except Exception as e:
        print(f"Error saving drafts queue: {e}")


def add_to_draft_queue(
    email_id: str,
    to_email: str,
    to_name: str,
    subject: str,
    body: str,
    trigger_reason: str,
    urgency: str = "High"
) -> Dict[str, Any]:
    """Add a new auto-staged draft to the review queue."""
    import uuid
    queue = load_draft_queue()
    # Check if a draft for this email already exists
    for item in queue:
        if item.get("email_id") == email_id:
            return item

    draft_entry = {
        "id": f"draft_{uuid.uuid4().hex[:8]}",
        "email_id": email_id,
        "to_email": to_email,
        "to_name": to_name,
        "subject": subject if subject.lower().startswith("re:") else f"Re: {subject}",
        "body": body,
        "trigger_reason": trigger_reason,
        "urgency": urgency,
        "created_at": datetime.now().isoformat(),
        "time_display": datetime.now().strftime("%I:%M %p")
    }
    queue.insert(0, draft_entry)
    save_draft_queue(queue)
    return draft_entry


def remove_from_draft_queue(draft_id: str) -> bool:
    """Remove a draft from queue after dispatch or dismissal."""
    queue = load_draft_queue()
    filtered = [d for d in queue if d.get("id") != draft_id]
    if len(filtered) != len(queue):
        save_draft_queue(filtered)
        return True
    return False


def load_workflow_rules() -> List[Dict[str, Any]]:
    """Load autonomous workflow trigger rules."""
    default_rules = [
        {
            "id": "rule_auto_draft_requests",
            "name": "Auto-Stage Drafts for Direct Requests",
            "description": "When an email asks a direct question or assigns a task, Nova autonomously prepares a draft response ready for 1-click approval.",
            "enabled": True,
            "category": "All",
            "action": "stage_draft"
        },
        {
            "id": "rule_mobile_job_shortlists",
            "name": "Instant Phone Ping for Job / Placement Shortlists",
            "description": "Immediately alert your phone (Telegram/WhatsApp) when an email contains interview, placement, or shortlist keywords.",
            "enabled": True,
            "category": "Career",
            "action": "push_mobile"
        },
        {
            "id": "rule_mobile_security_alerts",
            "name": "Instant Phone Ping for Critical Security Alerts",
            "description": "Immediately alert phone when security, password recovery, or account verification events are detected.",
            "enabled": True,
            "category": "Security",
            "action": "push_mobile"
        },
        {
            "id": "rule_auto_log_finances",
            "name": "Financial Transactions Ledger Logging",
            "description": "Automatically extract all amounts, currencies, and due dates into the Finance & Bills hub.",
            "enabled": True,
            "category": "Finance",
            "action": "log_finance"
        }
    ]
    if not WORKFLOWS_FILE.exists():
        save_workflow_rules(default_rules)
        return default_rules
    try:
        with open(WORKFLOWS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default_rules


def save_workflow_rules(rules: List[Dict[str, Any]]) -> None:
    """Save workflow rules to disk."""
    try:
        temp_file = WORKFLOWS_FILE.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(rules, f, indent=2, ensure_ascii=False)
        temp_file.replace(WORKFLOWS_FILE)
    except Exception as e:
        print(f"Error saving workflow rules: {e}")


def load_sent_replies() -> List[Dict[str, Any]]:
    """Retrieve all sent replies recorded across cached emails."""
    emails = load_cached_emails()
    all_replies = []
    for em in emails:
        for r in em.get("sent_replies", []):
            all_replies.append(r)
    return all_replies


def stage_draft(
    email_id: str,
    to_email: str,
    subject: str,
    body: str,
    reason: str = "Autonomous Trigger",
    origin_agent: str = "Ghostwriter"
) -> Dict[str, Any]:
    """Helper alias for add_to_draft_queue."""
    return add_to_draft_queue(
        email_id=email_id,
        to_email=to_email,
        to_name=to_email.split("@")[0],
        subject=subject,
        body=body,
        trigger_reason=f"{reason} ({origin_agent})",
        urgency="High"
    )



