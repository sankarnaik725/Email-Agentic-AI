"""Contact & People Intelligence CRM Engine.
Constructs living dossiers of everyone in your inbox, tracking interaction cadence,
relationship strength, sentiment trends, and topic affinities.
"""

from typing import Dict, Any, List, Optional
from collections import defaultdict
from storage import load_cached_emails


def analyze_contacts() -> List[Dict[str, Any]]:
    """Aggregate and analyze all contacts across inbox communications."""
    emails = load_cached_emails()
    contact_map = defaultdict(lambda: {
        "name": "",
        "email": "",
        "threads": [],
        "sentiments": [],
        "categories": set(),
        "latest_date": ""
    })

    for em in emails:
        sender_email = em.get("sender_email", "").strip().lower()
        if not sender_email:
            continue
        sender_name = em.get("sender_name", "").strip() or sender_email.split("@")[0]

        entry = contact_map[sender_email]
        if not entry["name"] or len(sender_name) > len(entry["name"]):
            entry["name"] = sender_name
        entry["email"] = sender_email
        entry["threads"].append({
            "id": em.get("id"),
            "subject": em.get("subject", "No Subject"),
            "date": em.get("date_display", em.get("date_iso", ""))
        })
        
        ai = em.get("ai_analysis", {})
        if ai.get("sentiment"):
            entry["sentiments"].append(ai["sentiment"])
        if ai.get("category"):
            entry["categories"].add(ai["category"])
        
        d = em.get("date_display", "")
        if d and not entry["latest_date"]:
            entry["latest_date"] = d

    results = []
    for email, data in contact_map.items():
        count = len(data["threads"])
        name = data["name"]
        domain = email.split("@")[-1] if "@" in email else ""

        # Determine Relationship Tier
        if any(k in name.lower() for k in ["prof", "advisor", "dean", "director", "chair", "harish"]):
            tier = "VIP Academic / Advisor"
            badge_color = "purple"
        elif "iitm.ac.in" in domain:
            tier = "IIT Madras Department"
            badge_color = "blue"
        elif any(k in name.lower() + email.lower() for k in ["no-reply", "notification", "announce", "newsletter", "billing"]):
            tier = "Automated Service"
            badge_color = "gray"
        elif count >= 3:
            tier = "Frequent Collaborator"
            badge_color = "green"
        else:
            tier = "Direct Contact"
            badge_color = "teal"

        # Sentiment summary
        pos_count = sum(1 for s in data["sentiments"] if "pos" in s.lower())
        urg_count = sum(1 for s in data["sentiments"] if "urg" in s.lower())
        if urg_count > 0:
            sentiment_summary = "Action Oriented / Urgent"
        elif pos_count >= 1:
            sentiment_summary = "Positive & Constructive"
        else:
            sentiment_summary = "Professional / Neutral"

        results.append({
            "name": name,
            "email": email,
            "domain": domain,
            "interaction_count": count,
            "relationship_tier": tier,
            "badge_color": badge_color,
            "sentiment_summary": sentiment_summary,
            "categories": list(data["categories"])[:3],
            "latest_interaction": data["latest_date"] or "Recent",
            "recent_threads": data["threads"][:3]
        })

    # Sort VIP first, then by interaction count
    results.sort(key=lambda c: (1 if "VIP" in c["relationship_tier"] else 0, c["interaction_count"]), reverse=True)
    return results


def get_contact_dossier(email_address: str) -> Optional[Dict[str, Any]]:
    """Retrieve detailed interaction dossier for a specific contact."""
    contacts = analyze_contacts()
    clean = email_address.strip().lower()
    for c in contacts:
        if c["email"].lower() == clean:
            return c
    return None
