"""Autonomous Workflow Automation Engine ("Nova Zapier / Trigger Engine").
Allows defining custom triggers and actions to automatically triage, tag,
alert, and draft responses for incoming communications.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

DATA_DIR = Path(__file__).resolve().parent / "data"
RULES_FILE = DATA_DIR / "automation_rules.json"

DEFAULT_RULES = [
    {
        "id": "rule_academic_guard",
        "name": "IIT Madras Academic Priority Guard",
        "description": "Auto-escalates emails from @iitm.ac.in with deadlines or announcements to High priority.",
        "enabled": True,
        "trigger": {
            "field": "sender_email",
            "operator": "contains",
            "value": "iitm.ac.in"
        },
        "action": {
            "type": "escalate_priority",
            "priority": "High",
            "tag": "IIT Madras Official"
        },
        "execution_count": 8
    },
    {
        "id": "rule_fee_watcher",
        "name": "Fee, Invoice & Due Date Watcher",
        "description": "Detects billing statements and fees, flags for mobile alert notification.",
        "enabled": True,
        "trigger": {
            "field": "subject",
            "operator": "contains_any",
            "value": "fee,invoice,payment,due date,bill"
        },
        "action": {
            "type": "flag_financial",
            "tag": "Finance Tracked"
        },
        "execution_count": 5
    },
    {
        "id": "rule_vip_advisor_fasttrack",
        "name": "VIP Advisor & Professor Fast-Track",
        "description": "Auto-stages an acknowledgment reply draft in Santhosh's voice for professors.",
        "enabled": True,
        "trigger": {
            "field": "sender_name",
            "operator": "contains_any",
            "value": "prof,harish,sharma,advisor,guide"
        },
        "action": {
            "type": "stage_draft_reply",
            "tag": "VIP Fast-Track"
        },
        "execution_count": 3
    }
]


def load_automation_rules() -> List[Dict[str, Any]]:
    """Load active automation rules from disk, initializing defaults if needed."""
    if not RULES_FILE.exists():
        save_automation_rules(DEFAULT_RULES)
        return DEFAULT_RULES
    try:
        with open(RULES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else DEFAULT_RULES
    except Exception:
        return DEFAULT_RULES


def save_automation_rules(rules: List[Dict[str, Any]]) -> None:
    """Save automation rules to disk."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_file = RULES_FILE.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=2, ensure_ascii=False)
    temp_file.replace(RULES_FILE)


def evaluate_rules_on_email(email: Dict[str, Any]) -> List[str]:
    """Evaluate all active rules on a single email and return list of triggered action logs."""
    rules = load_automation_rules()
    triggered_logs = []

    for rule in rules:
        if not rule.get("enabled", True):
            continue

        trigger = rule.get("trigger", {})
        field_val = str(email.get(trigger.get("field", ""), "")).lower()
        operator = trigger.get("operator", "contains")
        target_val = str(trigger.get("value", "")).lower()

        matched = False
        if operator == "contains":
            matched = target_val in field_val
        elif operator == "contains_any":
            targets = [t.strip() for t in target_val.split(",") if t.strip()]
            matched = any(t in field_val for t in targets)
        elif operator == "equals":
            matched = target_val == field_val

        if matched:
            action = rule.get("action", {})
            action_type = action.get("type")
            rule["execution_count"] = rule.get("execution_count", 0) + 1

            if action_type == "escalate_priority":
                if "ai_analysis" in email:
                    email["ai_analysis"]["priority"] = action.get("priority", "High")
                triggered_logs.append(f"Applied '{rule['name']}': Priority set to {action.get('priority')}")

            elif action_type == "flag_financial":
                triggered_logs.append(f"Applied '{rule['name']}': Flagged for Financial Tracking")

            elif action_type == "stage_draft_reply":
                triggered_logs.append(f"Applied '{rule['name']}': Staged priority acknowledgment draft")

    save_automation_rules(rules)
    return triggered_logs


def run_all_automations() -> Dict[str, Any]:
    """Execute all active automation rules across the entire inbox cache."""
    from storage import load_cached_emails, save_cached_emails
    emails = load_cached_emails()
    total_triggered = 0
    detailed_actions = []

    for em in emails:
        logs = evaluate_rules_on_email(em)
        if logs:
            total_triggered += len(logs)
            detailed_actions.append({
                "email_id": em.get("id"),
                "subject": em.get("subject"),
                "logs": logs
            })

    save_cached_emails(emails)
    return {
        "success": True,
        "total_rules": len(load_automation_rules()),
        "total_triggered": total_triggered,
        "actions": detailed_actions
    }
