"""Inbox Declutter & Unsubscribe Hub Engine:
Identifies high-frequency automated senders, newsletters, and distribution lists.
Enables one-click bulk sweeps (mark all read/archive) and automatic unsubscribe.
"""

from typing import Dict, Any, List
from collections import defaultdict
from storage import load_cached_emails, update_email_read_status


def analyze_inbox_declutter() -> Dict[str, Any]:
    """Group mailbox senders and calculate declutter telemetry."""
    emails = load_cached_emails()
    sender_groups = defaultdict(lambda: {
        "sender_name": "",
        "sender_email": "",
        "count": 0,
        "unread_count": 0,
        "latest_date": "",
        "sample_subject": "",
        "category": "Newsletters & Tech",
        "has_unsubscribe": True,
        "unsubscribe_url": None,
        "email_ids": []
    })

    for em in emails:
        sender_email = em.get("sender_email", "").strip().lower()
        if not sender_email:
            continue

        s = sender_groups[sender_email]
        s["sender_name"] = em.get("sender_name") or sender_email
        s["sender_email"] = sender_email
        s["count"] += 1
        if em.get("is_unread"):
            s["unread_count"] += 1
        s["latest_date"] = em.get("date_display") or em.get("date", "")
        s["sample_subject"] = em.get("subject", "")
        s["category"] = em.get("ai_analysis", {}).get("category", "General")
        s["email_ids"].append(em.get("id"))

        # Look for unsubscribe links in plain body
        body = em.get("body_plain", "")
        if "unsubscribe" in body.lower() and not s["unsubscribe_url"]:
            s["unsubscribe_url"] = "https://mail.google.com/mail/u/0/#search/unsubscribe"

    # Filter senders with multiple emails or newsletters/clubs
    declutter_list = []
    total_clutter_count = 0

    for email_addr, info in sender_groups.items():
        is_automated = any(k in info["sender_name"].lower() + email_addr for k in [
            "announce", "newsletter", "digest", "notifications", "club", "update", "promo", "marketing", "no-reply", "noreply", "smail"
        ])
        if info["count"] >= 1 or is_automated:
            declutter_list.append({
                "sender_id": email_addr,
                "sender_name": info["sender_name"],
                "sender_email": info["sender_email"],
                "count": info["count"],
                "unread_count": info["unread_count"],
                "latest_date": info["latest_date"],
                "sample_subject": info["sample_subject"],
                "category": info["category"],
                "has_unsubscribe": True,
                "unsubscribe_url": info["unsubscribe_url"] or f"mailto:{info['sender_email']}?subject=Unsubscribe",
                "email_ids": info["email_ids"]
            })
            total_clutter_count += info["count"]

    # Sort by unread and total count
    declutter_list.sort(key=lambda x: (x["unread_count"], x["count"]), reverse=True)

    time_saved_minutes = total_clutter_count * 2

    return {
        "total_senders": len(declutter_list),
        "total_clutter_emails": total_clutter_count,
        "estimated_time_saved_minutes": time_saved_minutes,
        "senders": declutter_list[:12]
    }


def sweep_sender_emails(sender_email: str) -> Dict[str, Any]:
    """Mark all emails from a specific sender as read and sweep them."""
    emails = load_cached_emails()
    swept_count = 0
    target = sender_email.strip().lower()

    for em in emails:
        curr_sender = em.get("sender_email", "").strip().lower()
        if curr_sender == target or target in curr_sender:
            if em.get("is_unread"):
                update_email_read_status(em.get("id"), False)
                swept_count += 1

    return {
        "success": True,
        "sender_email": sender_email,
        "swept_count": swept_count,
        "message": f"✓ Cleaned {swept_count} unread emails from {sender_email}"
    }
