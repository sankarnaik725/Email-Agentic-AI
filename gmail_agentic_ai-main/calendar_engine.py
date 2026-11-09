"""Calendar Conflict & Two-Way Scheduling Engine:
Checks incoming proposed meeting slots against the user's active schedule,
detects conflicts, and proposes optimal alternative slots.
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import urllib.parse

DATA_DIR = Path(__file__).resolve().parent / "data"
CALENDAR_EVENTS_FILE = DATA_DIR / "calendar_events.json"


DEFAULT_CALENDAR_EVENTS = [
    {
        "id": "cal_1",
        "title": "Machine Learning Lab & Project Review",
        "start_time": "Tomorrow at 2:00 PM",
        "end_time": "Tomorrow at 3:30 PM",
        "category": "Academic",
        "location": "IIT Madras Dept / Online",
        "busy": True
    },
    {
        "id": "cal_2",
        "title": "Core Engineering Systems Sync",
        "start_time": "Monday at 11:00 AM",
        "end_time": "Monday at 12:00 PM",
        "category": "Work",
        "location": "Google Meet",
        "busy": True
    },
    {
        "id": "cal_3",
        "title": "Executive AI Strategy Discussion",
        "start_time": "Wednesday at 4:00 PM",
        "end_time": "Wednesday at 5:00 PM",
        "category": "Project",
        "location": "Zoom",
        "busy": True
    }
]


def load_calendar_events() -> List[Dict[str, Any]]:
    """Load user's active calendar events."""
    if not CALENDAR_EVENTS_FILE.exists():
        save_calendar_events(DEFAULT_CALENDAR_EVENTS)
        return DEFAULT_CALENDAR_EVENTS
    try:
        with open(CALENDAR_EVENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else DEFAULT_CALENDAR_EVENTS
    except Exception:
        return DEFAULT_CALENDAR_EVENTS


def save_calendar_events(events: List[Dict[str, Any]]) -> None:
    """Save calendar events to disk."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_file = CALENDAR_EVENTS_FILE.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)
    temp_file.replace(CALENDAR_EVENTS_FILE)


def check_slot_conflict(proposed_slot_text: str, email_subject: str = "") -> Dict[str, Any]:
    """Check if a proposed meeting slot clashes with an existing event."""
    events = load_calendar_events()
    slot_lower = proposed_slot_text.lower().strip()

    # Simple time detection
    clashing_event = None
    for ev in events:
        ev_start = ev.get("start_time", "").lower()
        # Check day overlap (e.g. tomorrow, monday)
        if any(d in slot_lower and d in ev_start for d in ["tomorrow", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "today"]):
            # Check rough hour overlap
            for h in ["2", "3", "11", "4", "5", "10", "1", "9"]:
                if f"{h}:" in slot_lower and f"{h}:" in ev_start:
                    clashing_event = ev
                    break
                elif f"{h} pm" in slot_lower and f"{h}:" in ev_start:
                    clashing_event = ev
                    break

        if clashing_event:
            break

    if clashing_event:
        # Generate an intelligent alternative slot
        alt_slot = "Tomorrow at 4:30 PM" if "tomorrow" in slot_lower else "Next Day at 11:30 AM"
        if "monday" in slot_lower:
            alt_slot = "Monday at 2:30 PM (afternoon slot open)"
        elif "afternoon" in slot_lower or "pm" in slot_lower:
            alt_slot = "Same day at 4:30 PM (or morning 11:00 AM)"

        return {
            "has_conflict": True,
            "conflict_type": "Direct Overlap",
            "proposed_slot": proposed_slot_text,
            "conflicting_event": clashing_event,
            "alternative_slot": alt_slot,
            "recommendation": f"⚠️ Schedule Conflict: Clashes with '{clashing_event.get('title')}' ({clashing_event.get('start_time')}). Propose alternative slot: {alt_slot}.",
            "counter_proposal_text": f"Thanks for reaching out! I have a prior commitment at {proposed_slot_text} ('{clashing_event.get('title')}'). Could we connect at {alt_slot} instead?"
        }

    # No conflict
    title = f"Meeting: {email_subject}" if email_subject else f"Meeting ({proposed_slot_text})"
    gcal_url = (
        f"https://calendar.google.com/calendar/render?action=TEMPLATE"
        f"&text={urllib.parse.quote(title)}"
        f"&details={urllib.parse.quote(f'Confirmed slot: {proposed_slot_text} via Antigravity Mail AI')}"
    )

    return {
        "has_conflict": False,
        "conflict_type": "None",
        "proposed_slot": proposed_slot_text,
        "conflicting_event": None,
        "alternative_slot": None,
        "recommendation": f"✓ Slot is free! No calendar clashes detected for {proposed_slot_text}.",
        "google_calendar_url": gcal_url
    }


def add_calendar_event(title: str, start_time: str, category: str = "Meeting", location: str = "Online") -> Dict[str, Any]:
    """Add a newly confirmed event to the user's active calendar."""
    events = load_calendar_events()
    new_event = {
        "id": f"cal_{int(datetime.now().timestamp())}",
        "title": title,
        "start_time": start_time,
        "end_time": f"{start_time} + 1 hr",
        "category": category,
        "location": location,
        "busy": True
    }
    events.append(new_event)
    save_calendar_events(events)
    return new_event
