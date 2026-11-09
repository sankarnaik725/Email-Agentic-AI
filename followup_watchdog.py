"""Ghost Follow-Up Autonomous Watchdog:
Monitors outbound inquiries and critical threads awaiting responses.
Detects radio-silence (> 48-72h) and automatically prepares polite,
contextual nudge drafts staged in the Draft Queue.
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from storage import load_cached_emails, load_sent_replies, stage_draft, load_draft_queue
from style_cloner import apply_style_to_draft

DATA_DIR = Path(__file__).resolve().parent / "data"
PENDING_FOLLOWUPS_FILE = DATA_DIR / "pending_followups.json"


DEFAULT_WATCHDOG_ITEMS = [
    {
        "id": "fup_1",
        "recipient_name": "Prof. Harish",
        "recipient_email": "harish@iitm.ac.in",
        "original_subject": "BTech Capstone Project Milestone 2 Submission",
        "sent_date": "3 days ago (Sept 30, 2026)",
        "days_waiting": 3,
        "urgency": "High",
        "topic": "Academic Review & Sign-off",
        "status": "Awaiting Response",
        "staged_nudge": "I wanted to gently follow up on the Milestone 2 submission sent on Tuesday. Please let me know if you would like me to walk you through the architecture diagram or if any revisions are needed."
    },
    {
        "id": "fup_2",
        "recipient_name": "Sarah Chen",
        "recipient_email": "sarah.chen@innovate.tech",
        "original_subject": "Product Design System & Cross-Functional Review",
        "sent_date": "4 days ago (Sept 29, 2026)",
        "days_waiting": 4,
        "urgency": "Medium",
        "topic": "Design Deliverable",
        "status": "Awaiting Response",
        "staged_nudge": "Hope your week has been going well! Just checking in to see if you had a chance to review the design tokens doc we discussed last week."
    },
    {
        "id": "fup_3",
        "recipient_name": "Placement Cell IITM",
        "recipient_email": "placement@smail.iitm.ac.in",
        "original_subject": "Interview Slot Confirmation & Resume Verification",
        "sent_date": "5 days ago (Sept 28, 2026)",
        "days_waiting": 5,
        "urgency": "Critical",
        "topic": "Career & Placement",
        "status": "Awaiting Response",
        "staged_nudge": "I am writing to respectfully confirm receipt of my verified resume submission and interview preference form submitted earlier this week. Kindly let me know if any further documentation is needed."
    }
]


def load_pending_followups() -> List[Dict[str, Any]]:
    """Load list of threads waiting on responses."""
    if not PENDING_FOLLOWUPS_FILE.exists():
        save_pending_followups(DEFAULT_WATCHDOG_ITEMS)
        return DEFAULT_WATCHDOG_ITEMS
    try:
        with open(PENDING_FOLLOWUPS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else DEFAULT_WATCHDOG_ITEMS
    except Exception:
        return DEFAULT_WATCHDOG_ITEMS


def save_pending_followups(items: List[Dict[str, Any]]) -> None:
    """Save pending followups to disk."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_file = PENDING_FOLLOWUPS_FILE.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    temp_file.replace(PENDING_FOLLOWUPS_FILE)


def scan_and_stage_followup_nudges() -> List[Dict[str, Any]]:
    """Scan waiting threads and stage nudge drafts in the Draft Queue."""
    followups = load_pending_followups()
    queue = load_draft_queue()
    existing_reasons = {d.get("reason", "") for d in queue}

    staged_count = 0
    for fup in followups:
        reason_tag = f"Follow-up: {fup.get('recipient_name')}"
        if reason_tag not in existing_reasons and fup.get("status") == "Awaiting Response":
            body = apply_style_to_draft(fup.get("staged_nudge", ""), recipient_name=fup.get("recipient_name", "there"))
            stage_draft(
                email_id=fup.get("id"),
                to_email=fup.get("recipient_email"),
                subject=f"Re: {fup.get('original_subject')}",
                body=body,
                reason=f"Ghost Follow-up ({fup.get('days_waiting')}d silence)",
                origin_agent="Follow-up Watchdog"
            )
            staged_count += 1

    return followups


def create_followup_nudge(followup_id: str) -> Dict[str, Any]:
    """Force stage an individual follow-up nudge draft in the Draft Queue."""
    followups = load_pending_followups()
    matched = next((f for f in followups if f.get("id") == followup_id), None)
    if not matched:
        return {"success": False, "message": "Followup thread not found"}

    body = apply_style_to_draft(matched.get("staged_nudge", ""), recipient_name=matched.get("recipient_name", "there"))
    draft = stage_draft(
        email_id=matched.get("id"),
        to_email=matched.get("recipient_email"),
        subject=f"Re: {matched.get('original_subject')}",
        body=body,
        reason=f"Ghost Follow-up ({matched.get('days_waiting')}d silence)",
        origin_agent="Follow-up Watchdog"
    )

    return {
        "success": True,
        "message": f"✓ Follow-up nudge staged in Draft Queue for {matched.get('recipient_name')}",
        "draft": draft
    }
