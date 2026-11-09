"""FastAPI Server for AI Mail Agent Web Dashboard and REST API."""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

import config
import storage
import notifier
from mail_connector import MailConnector, get_demo_emails
from ai_agent import AIAgent
from companion_agent import companion, load_companion_history, save_companion_history, clear_companion_history
import style_cloner
import attachment_analyzer
import calendar_engine
import followup_watchdog
import declutter_engine
import account_manager
import innovations_engine
from innovations_engine import (
    OpportunityRadarEngine,
    CommitmentLedgerEngine,
    MorningShowPodcastEngine,
    ReactionSimulatorEngine,
)

app = FastAPI(title="AI Mail Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Global Agent instance
current_cfg = config.load_config()
agent = AIAgent(api_key=current_cfg.get("gemini_api_key"), model_name=current_cfg.get("gemini_model", "gemini-2.5-flash"))
companion.set_api_key(current_cfg.get("gemini_api_key", ""))


class CompanionChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, Any]]] = None


class ConfigUpdate(BaseModel):
    mailbox_type: Optional[str] = None
    smail_script_url: Optional[str] = None
    smail_token: Optional[str] = None
    imap_host: Optional[str] = None
    imap_port: Optional[int] = None
    imap_user: Optional[str] = None
    imap_password: Optional[str] = None
    gemini_api_key: Optional[str] = None
    demo_mode: Optional[bool] = None
    fetch_count: Optional[int] = None
    enable_mobile_alerts: Optional[bool] = None
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    whatsapp_webhook_url: Optional[str] = None
    notify_min_priority: Optional[str] = None
    notify_on_sync: Optional[bool] = None
    sms_alerts_enabled: Optional[bool] = None
    sms_recipient_phone: Optional[str] = None
    sms_provider: Optional[str] = None
    sms_api_key: Optional[str] = None
    sms_twilio_account_sid: Optional[str] = None
    sms_twilio_auth_token: Optional[str] = None
    sms_twilio_from: Optional[str] = None
    sms_custom_url: Optional[str] = None


class SendTestSmsRequest(BaseModel):
    phone_number: Optional[str] = "+919392709150"
    message: Optional[str] = None


class AskQuestionRequest(BaseModel):
    question: str


class AskInboxRequest(BaseModel):
    question: str


class ComposeEmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str


class WatcherConfigRequest(BaseModel):
    enabled: bool
    interval_seconds: Optional[int] = 300


class ToggleActionRequest(BaseModel):
    task_index: int
    completed: bool


class MarkReadRequest(BaseModel):
    is_unread: bool


class AddRadarToCalendarRequest(BaseModel):
    opportunity_id: str
    title: str
    deadline: Optional[str] = "Next Week"
    organization: Optional[str] = "Campus"
    details: Optional[str] = ""


class NudgeCommitmentRequest(BaseModel):
    commitment_id: str


class ReactionSimulateRequest(BaseModel):
    draft_body: str
    recipient_email: Optional[str] = ""
    context_subject: Optional[str] = ""


@app.get("/api/status")
async def get_system_status():
    """Retrieve operational status, credentials presence, and summary counts."""
    cfg = config.load_config()
    emails = storage.load_cached_emails()

    unread_count = sum(1 for e in emails if e.get("is_unread", False))
    critical_count = sum(1 for e in emails if e.get("ai_analysis", {}).get("priority") in ["Critical", "High"])
    pending_actions = sum(
        1 for e in emails for a in e.get("ai_analysis", {}).get("action_items", []) if not a.get("completed", False)
    )

    return {
        "status": "online",
        "demo_mode": cfg.get("demo_mode", False),
        "mailbox_user": cfg.get("imap_user", "dhanavathsanthosh1916@gmail.com"),
        "mailbox_type": cfg.get("mailbox_type", "imap"),
        "has_imap": bool(cfg.get("imap_user") and cfg.get("imap_password")),
        "has_gemini": bool(cfg.get("gemini_api_key")),
        "cached_emails_count": len(emails),
        "unread_count": unread_count,
        "critical_count": critical_count,
        "pending_actions_count": pending_actions,
        "ai_engine": "Gemini AI (Cloud)" if agent.client else "NLP Intelligent Heuristics (Local Engine)"
    }


@app.get("/api/emails")
async def list_emails(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    unread_only: bool = False
):
    """Retrieve filtered list of emails with their AI triage summaries."""
    emails = storage.load_cached_emails()

    # Only initialize with demo emails if active account is explicitly demo mode
    active_acc = account_manager.get_active_account()
    active_id = active_acc.get("id") if active_acc else "personal_gmail"
    if not emails and active_id == "demo":
        emails = get_demo_emails()
        for em in emails:
            if not em.get("ai_analysis"):
                em["ai_analysis"] = agent.analyze_email(em)
        storage.save_cached_emails(emails)

    filtered = emails

    if unread_only:
        filtered = [e for e in filtered if e.get("is_unread", False)]

    if priority and priority.lower() != "all":
        filtered = [
            e for e in filtered if e.get("ai_analysis", {}).get("priority", "").lower() == priority.lower()
        ]

    if category and category.lower() != "all":
        filtered = [
            e for e in filtered if category.lower() in e.get("ai_analysis", {}).get("category", "").lower()
        ]

    if search:
        s = search.lower()
        filtered = [
            e for e in filtered
            if s in e.get("subject", "").lower()
            or s in e.get("sender_name", "").lower()
            or s in e.get("sender_email", "").lower()
            or s in e.get("ai_analysis", {}).get("summary_tldr", "").lower()
            or s in e.get("body_plain", "").lower()
        ]

    return {
        "count": len(filtered),
        "total": len(emails),
        "emails": filtered
    }


@app.get("/api/emails/{email_id}")
async def get_email_detail(email_id: str):
    """Retrieve full email details and complete AI analysis, ensuring multi-agent council deliberation."""
    em = storage.get_email_by_id(email_id)
    if not em:
        raise HTTPException(status_code=404, detail="Email not found")

    if em.get("ai_analysis") and "agent_council" not in em["ai_analysis"]:
        ai = em["ai_analysis"]
        em["ai_analysis"]["agent_council"] = agent._deliberate_agent_council(
            em,
            ai.get("priority", "Medium"),
            ai.get("category", "General"),
            ai.get("key_entities", {}).get("amounts", []),
            ai.get("phishing_warning"),
            ai.get("subtext_analysis", {})
        )
        storage.update_email_analysis(email_id, em["ai_analysis"])

    return em


@app.post("/api/sync")
async def sync_emails(force_demo: Optional[bool] = None):
    """Sync emails strictly for the currently active account only (never both at a time)."""
    cfg = config.load_config()
    active_acc = account_manager.get_active_account()
    active_id = active_acc.get("id") if active_acc else "personal_gmail"
    active_name = active_acc.get("name", active_id) if active_acc else "Personal Gmail"

    use_demo = (active_id == "demo") if force_demo is None else force_demo

    fetched_emails: List[Dict[str, Any]] = []
    sync_source = ""
    info_message = None

    if use_demo or active_id == "demo":
        fetched_emails = get_demo_emails()
        sync_source = "Demo Simulated Mailbox"

    elif active_id == "iitm_smail":
        # Strictly IIT Madras Smail Gateway or Direct IMAP
        smail_script_url = cfg.get("smail_script_url") or active_acc.get("smail_script_url", "")
        iitm_imap_pw = active_acc.get("imap_password") or (cfg.get("imap_password") if cfg.get("mailbox_type") == "smail" else "")

        if smail_script_url:
            try:
                from mail_connector import fetch_from_apps_script
                smail_token = cfg.get("smail_token") or active_acc.get("smail_token", "iitm_smail_secret_2026")
                fetched_emails = fetch_from_apps_script(
                    script_url=smail_script_url,
                    token=smail_token,
                    limit=cfg.get("fetch_count", 15)
                )
                sync_source = f"IIT Madras Smail ({active_acc.get('email', 'am26m001@smail.iitm.ac.in')})"
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to fetch from IIT Madras Smail Gateway: {str(e)}. Please check your Web App URL and deployment settings."
                )
        elif iitm_imap_pw:
            try:
                connector = MailConnector(
                    host=active_acc.get("imap_host", "imap.gmail.com"),
                    port=active_acc.get("imap_port", 993),
                    user=active_acc.get("email", "am26m001@smail.iitm.ac.in"),
                    password=iitm_imap_pw,
                    use_ssl=True
                )
                fetched_emails = connector.fetch_emails(limit=cfg.get("fetch_count", 15))
                sync_source = f"IIT Madras Smail ({active_acc.get('email', 'am26m001@smail.iitm.ac.in')})"
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to fetch college emails via IMAP: {str(e)}."
                )
        else:
            info_message = (
                "IIT Madras Smail Web App URL is not configured yet. "
                "Because IIT Madras disables App Passwords, deploy the provided "
                "google_apps_script_iitm.js in your IITM account and paste the Web App URL to sync."
            )
            sync_source = "IIT Madras Smail"
            fetched_emails = []

    else:
        # Strictly Personal Gmail (or other configured IMAP account)
        imap_user = active_acc.get("imap_user") or active_acc.get("email") or cfg.get("imap_user")
        imap_password = active_acc.get("imap_password") or cfg.get("imap_password")
        imap_host = active_acc.get("imap_host") or cfg.get("imap_host", "imap.gmail.com")
        imap_port = active_acc.get("imap_port") or cfg.get("imap_port", 993)

        if not imap_user or not imap_password:
            raise HTTPException(
                status_code=400,
                detail=f"Missing IMAP credentials for {active_name}. Please configure your 16-character Google App Password in Accounts."
            )

        try:
            connector = MailConnector(
                host=imap_host,
                port=imap_port,
                user=imap_user,
                password=imap_password,
                use_ssl=True
            )
            fetched_emails = connector.fetch_emails(limit=cfg.get("fetch_count", 15))
            sync_source = f"{active_name} ({imap_user})"
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch emails via IMAP: {str(e)}."
            )

    # Merge with existing cache preserving user actions (completed tasks, read status, replies, chat history)
    existing = storage.load_cached_emails()
    existing_map = {e.get("id"): e for e in existing}

    processed_list = []
    dispatched_alerts = []
    fetched_ids = set()

    for em in fetched_emails:
        eid = em.get("id")
        fetched_ids.add(eid)
        is_new = (eid not in existing_map)
        if eid in existing_map and existing_map[eid].get("ai_analysis"):
            # Preserve existing AI analysis and custom user checkboxes
            em["ai_analysis"] = existing_map[eid]["ai_analysis"]
            em["is_unread"] = existing_map[eid].get("is_unread", em.get("is_unread", True))
            if "sent_replies" in existing_map[eid]:
                em["sent_replies"] = existing_map[eid]["sent_replies"]
                em["has_replied"] = existing_map[eid].get("has_replied", False)
                em["last_reply_at"] = existing_map[eid].get("last_reply_at")
            if "chat_history" in existing_map[eid]:
                em["chat_history"] = existing_map[eid]["chat_history"]
        else:
            # Perform AI triage
            em["ai_analysis"] = agent.analyze_email(em)
            if is_new and cfg.get("enable_mobile_alerts", True) and cfg.get("notify_on_sync", True):
                analysis = em["ai_analysis"]
                flat_data = dict(em)
                flat_data["priority"] = analysis.get("priority", "Medium")
                flat_data["summary"] = analysis.get("summary", "")
                flat_data["category"] = analysis.get("category", "General")
                flat_data["action_items"] = [a.get("task", "") if isinstance(a, dict) else str(a) for a in analysis.get("action_items", [])]
                flat_data["subtext_analysis"] = analysis.get("subtext_analysis", {})
                flat_data["suggested_responses"] = analysis.get("suggested_responses", [])
                flat_data["calendar_event"] = analysis.get("calendar_event")
                alert_res = notifier.dispatch_urgent_alert(flat_data, force=False)
                if alert_res.get("dispatched"):
                    dispatched_alerts.append({
                        "subject": em.get("subject"),
                        "priority": flat_data["priority"],
                        "channels": alert_res.get("channels")
                    })

        processed_list.append(em)

    # Retain existing emails from this account that were not in this fetch batch
    if fetched_emails:
        for old_em in existing:
            if old_em.get("id") not in fetched_ids:
                processed_list.append(old_em)
    else:
        # If no new emails were fetched (e.g. Smail URL not configured), preserve existing cache
        processed_list = existing

    storage.save_cached_emails(processed_list)

    return {
        "success": True,
        "source": sync_source,
        "count": len(processed_list),
        "message": info_message,
        "engine": "Gemini AI" if agent.client else "NLP Intelligent Heuristics",
        "dispatched_alerts": dispatched_alerts
    }


@app.post("/api/emails/{email_id}/analyze")
async def analyze_single_email(email_id: str):
    """Re-run AI analysis on a single email."""
    em = storage.get_email_by_id(email_id)
    if not em:
        raise HTTPException(status_code=404, detail="Email not found")

    new_analysis = agent.analyze_email(em)
    updated = storage.update_email_analysis(email_id, new_analysis)
    return updated


class SendReplyRequest(BaseModel):
    body: str
    tone: Optional[str] = "Professional"
    mode: Optional[str] = "send"  # "send" or "draft"


@app.post("/api/emails/{email_id}/ask")
async def ask_question_about_email(email_id: str, payload: AskQuestionRequest):
    """Ask an ad-hoc question or request a custom draft response with conversational memory."""
    em = storage.get_email_by_id(email_id)
    if not em:
        raise HTTPException(status_code=404, detail="Email not found")

    history = storage.get_chat_history(email_id)
    answer = agent.ask_email_question(em, payload.question, history)

    storage.append_chat_message(email_id, "user", payload.question)
    updated_history = storage.append_chat_message(email_id, "assistant", answer)

    return {
        "email_id": email_id,
        "question": payload.question,
        "answer": answer,
        "chat_history": updated_history
    }


@app.post("/api/emails/{email_id}/send-reply")
async def send_or_draft_reply(email_id: str, payload: SendReplyRequest):
    """Dispatch real email via SMTP or save to IMAP drafts folder with safety confirmation."""
    em = storage.get_email_by_id(email_id)
    if not em:
        raise HTTPException(status_code=404, detail="Email not found")

    cfg = config.load_config()
    to_email = em.get("sender_email")
    subject = em.get("subject", "Reply")

    if not cfg.get("demo_mode") and cfg.get("imap_user") and cfg.get("imap_password"):
        connector = MailConnector(
            host=cfg.get("imap_host", "imap.gmail.com"),
            port=cfg.get("imap_port", 993),
            user=cfg.get("imap_user"),
            password=cfg.get("imap_password"),
            use_ssl=cfg.get("imap_use_ssl", True)
        )
        if payload.mode == "draft":
            res = connector.save_draft_imap(to_email=to_email, subject=subject, body_text=payload.body)
        else:
            res = connector.send_email_smtp(to_email=to_email, subject=subject, body_text=payload.body)

        if not res.get("success"):
            return {
                "success": False,
                "mode": payload.mode,
                "message": res.get("error", "Failed to dispatch email via SMTP")
            }

        # Log sent reply in thread storage
        storage.record_sent_reply(email_id, to_email, subject, payload.body, payload.mode)
        return {
            "success": True,
            "mode": payload.mode,
            "recipient": to_email,
            "message": f"✓ {res.get('message', 'Dispatched successfully via Gmail SMTP')}"
        }
    else:
        # Simulated instant delivery confirmation for demo mode
        import time
        storage.record_sent_reply(email_id, to_email, subject, payload.body, payload.mode)
        return {
            "success": True,
            "mode": payload.mode,
            "simulated": True,
            "recipient": to_email,
            "message": f"✓ Simulated {payload.mode} dispatched to {to_email} ({len(payload.body)} characters)",
            "timestamp": time.strftime("%I:%M %p")
        }


@app.post("/api/emails/compose")
async def compose_and_send_email(payload: ComposeEmailRequest):
    """Direct standalone email composer allowing dispatch to any recipient via Gmail SMTP."""
    cfg = config.load_config()
    to_email = payload.to_email.strip()
    subject = payload.subject.strip()
    body = payload.body.strip()

    if not to_email or not body:
        raise HTTPException(status_code=400, detail="Recipient email and body are required.")

    if not cfg.get("demo_mode") and cfg.get("imap_user") and cfg.get("imap_password"):
        connector = MailConnector(
            host=cfg.get("imap_host", "imap.gmail.com"),
            port=cfg.get("imap_port", 993),
            user=cfg.get("imap_user"),
            password=cfg.get("imap_password"),
            use_ssl=cfg.get("imap_use_ssl", True)
        )
        res = connector.send_email_smtp(to_email=to_email, subject=subject, body_text=body)
        if not res.get("success"):
            return {"success": False, "message": res.get("error", "Failed to send email via SMTP")}
        return {
            "success": True,
            "recipient": to_email,
            "message": f"✓ Dispatched to {to_email} via Gmail SMTP"
        }
    else:
        return {
            "success": True,
            "simulated": True,
            "recipient": to_email,
            "message": f"✓ [Demo Simulation] Email dispatched to {to_email}"
        }


@app.post("/api/inbox/ask")
async def ask_entire_inbox_endpoint(payload: AskInboxRequest):
    """Cross-email AI reasoning and semantic inquiry across all mailbox threads."""
    emails = storage.load_cached_emails()
    if not emails:
        emails = get_demo_emails()
        for em in emails:
            em["ai_analysis"] = agent.analyze_email(em)
        storage.save_cached_emails(emails)

    return agent.ask_entire_inbox(payload.question, emails)


@app.get("/api/finance/overview")
async def get_finance_overview():
    """Aggregate financial intelligence, detected amounts, and ledger items across inbox."""
    import re
    emails = storage.load_cached_emails()
    if not emails:
        emails = get_demo_emails()

    financial_items = []
    total_detected_amount = 0.0
    detected_currencies = set()

    for em in emails:
        ai = em.get("ai_analysis", {})
        cat = str(ai.get("category", ""))
        entities = ai.get("key_entities", {})
        amounts = entities.get("amounts", [])
        subject_lower = em.get("subject", "").lower()

        is_finance = (
            "finance" in cat.lower() or
            "billing" in cat.lower() or
            bool(amounts) or
            any(k in subject_lower for k in ["balance", "nse", "invoice", "tier", "$", "fund", "payment", "renewal", "tax", "securities"])
        )

        if is_finance:
            for a in amounts:
                clean_num = re.sub(r"[^\d.]", "", a)
                try:
                    if clean_num:
                        total_detected_amount += float(clean_num)
                except Exception:
                    pass
                if "$" in a: detected_currencies.add("USD ($)")
                if "₹" in a or "inr" in a.lower(): detected_currencies.add("INR (₹)")
                if "€" in a: detected_currencies.add("EUR (€)")

            financial_items.append({
                "email_id": em.get("id"),
                "subject": em.get("subject"),
                "sender_name": em.get("sender_name"),
                "sender_email": em.get("sender_email"),
                "date_display": em.get("date_display", em.get("date", "")),
                "amounts": amounts if amounts else ["Account Notice"],
                "category": cat,
                "priority": ai.get("priority", "Medium"),
                "summary": ai.get("summary_tldr", em.get("snippet", ""))
            })

    return {
        "total_items": len(financial_items),
        "total_amount_estimate": round(total_detected_amount, 2),
        "currencies": list(detected_currencies) or ["USD / INR"],
        "items": financial_items
    }



@app.get("/api/briefing/podcast")
async def get_podcast_briefing():
    """Generate dynamic two-host conversational podcast morning show (Alex & Maya)."""
    emails = storage.load_cached_emails()
    if not emails:
        emails = get_demo_emails()
        for em in emails:
            em["ai_analysis"] = agent.analyze_email(em)
        storage.save_cached_emails(emails)

    return agent.generate_podcast_briefing(emails)


@app.post("/api/emails/{email_id}/toggle-action")
async def toggle_action_item(email_id: str, payload: ToggleActionRequest):
    """Toggle completion checkmark on an action item."""
    updated = storage.update_action_item_status(email_id, payload.task_index, payload.completed)
    if not updated:
        raise HTTPException(status_code=404, detail="Email or action item not found")
    return updated


@app.post("/api/emails/{email_id}/mark-read")
async def mark_email_read(email_id: str, payload: MarkReadRequest):
    """Toggle read / unread state."""
    updated = storage.update_email_read_status(email_id, payload.is_unread)
    if not updated:
        raise HTTPException(status_code=404, detail="Email not found")
    return updated


@app.get("/api/briefing")
async def get_daily_briefing():
    """Generate executive daily briefing across all emails."""
    emails = storage.load_cached_emails()
    if not emails:
        # If no emails, load and analyze demo emails
        emails = get_demo_emails()
        for em in emails:
            em["ai_analysis"] = agent.analyze_email(em)
        storage.save_cached_emails(emails)

    briefing = agent.generate_daily_briefing(emails)
    return briefing


# ============================================================================
# Conversational AI Companion ("Nova") - Friend Persona & Tool Execution
# ============================================================================

@app.get("/api/companion/history")
async def get_companion_history():
    """Retrieve persistent conversation history with Nova companion."""
    return load_companion_history()


@app.post("/api/companion/clear")
async def clear_companion_history_endpoint():
    """Clear conversation history with Nova."""
    clear_companion_history()
    return {"success": True, "message": "Companion chat history cleared."}


@app.post("/api/companion/chat")
async def chat_with_companion(payload: CompanionChatRequest):
    """Conversational interaction with Nova: autonomous inbox wingman and command executor."""
    from datetime import datetime
    res = companion.chat(payload.message, payload.chat_history)
    history = load_companion_history()
    history.append({
        "role": "user",
        "content": payload.message,
        "timestamp": datetime.now().isoformat(),
        "time_display": datetime.now().strftime("%I:%M %p")
    })
    history.append({
        "role": "assistant",
        "content": res.get("reply", ""),
        "actions_taken": res.get("actions_taken", []),
        "citations": res.get("citations", []),
        "timestamp": datetime.now().isoformat(),
        "time_display": datetime.now().strftime("%I:%M %p")
    })
    save_companion_history(history[-60:])
    return res


# ============================================================================
# 1. Autonomous Draft Queue & Workflows
# ============================================================================

def stage_autonomous_drafts_if_needed(emails):
    """Proactively populate the Nova Draft Queue with high-conviction drafts for urgent or actionable emails."""
    queue = storage.load_draft_queue()
    existing_ids = {d.get("email_id") for d in queue}

    for em in emails:
        eid = em.get("id")
        if eid in existing_ids:
            continue
        ai = em.get("ai_analysis", {})
        smart_replies = ai.get("smart_replies", [])
        action_items = ai.get("action_items", [])
        prio = ai.get("priority", "Medium")
        subj = em.get("subject", "")

        is_actionable = (
            prio in ["Critical", "High"] or
            bool(action_items) or
            any(w in subj.lower() for w in ["slide", "presentation", "update", "request", "review", "confirm", "meeting", "interview", "payment"])
        )

        if smart_replies and is_actionable:
            first_reply = smart_replies[0]
            reason = f"Action requested: {ai.get('summary_tldr', subj)[:80]}"
            storage.add_to_draft_queue(
                email_id=eid,
                to_email=em.get("sender_email", ""),
                to_name=em.get("sender_name", "Sender"),
                subject=subj,
                body=first_reply.get("body", ""),
                trigger_reason=reason,
                urgency=prio
            )


@app.get("/api/drafts/queue")
async def get_draft_queue():
    """Retrieve pending autonomous drafts staged for approval."""
    emails = storage.load_cached_emails()
    stage_autonomous_drafts_if_needed(emails)
    queue = storage.load_draft_queue()
    return {"count": len(queue), "drafts": queue}


@app.post("/api/drafts/{draft_id}/approve")
async def approve_draft_endpoint(draft_id: str):
    """Approve and dispatch a staged draft via Gmail SMTP."""
    queue = storage.load_draft_queue()
    draft = next((d for d in queue if d.get("id") == draft_id), None)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found in queue")

    cfg = config.load_config()
    to_email = draft.get("to_email")
    subject = draft.get("subject")
    body = draft.get("body")
    email_id = draft.get("email_id")

    if not cfg.get("demo_mode") and cfg.get("imap_user") and cfg.get("imap_password"):
        connector = MailConnector(
            host=cfg.get("imap_host", "imap.gmail.com"),
            port=cfg.get("imap_port", 993),
            user=cfg.get("imap_user"),
            password=cfg.get("imap_password"),
            use_ssl=cfg.get("imap_use_ssl", True)
        )
        res = connector.send_email_smtp(to_email=to_email, subject=subject, body_text=body)
        if not res.get("success"):
            return {"success": False, "message": res.get("error", "SMTP dispatch error")}
        storage.record_sent_reply(email_id, to_email, subject, body, mode="send")
        storage.remove_from_draft_queue(draft_id)
        return {"success": True, "message": f"✓ Dispatched via Gmail SMTP to {to_email}"}
    else:
        storage.record_sent_reply(email_id, to_email, subject, body, mode="send")
        storage.remove_from_draft_queue(draft_id)
        return {"success": True, "simulated": True, "message": f"✓ [Demo] Dispatched to {to_email}"}


@app.post("/api/drafts/{draft_id}/dismiss")
async def dismiss_draft_endpoint(draft_id: str):
    """Dismiss a draft without sending."""
    success = storage.remove_from_draft_queue(draft_id)
    return {"success": success, "message": "Draft dismissed."}


@app.post("/api/drafts/approve-all")
async def approve_all_drafts_endpoint():
    """Batch approve and dispatch all pending drafts in the queue."""
    queue = storage.load_draft_queue()
    cfg = config.load_config()
    dispatched_count = 0

    connector = None
    if not cfg.get("demo_mode") and cfg.get("imap_user") and cfg.get("imap_password"):
        connector = MailConnector(
            host=cfg.get("imap_host", "imap.gmail.com"),
            port=cfg.get("imap_port", 993),
            user=cfg.get("imap_user"),
            password=cfg.get("imap_password"),
            use_ssl=cfg.get("imap_use_ssl", True)
        )

    for draft in list(queue):
        to_email = draft.get("to_email")
        subject = draft.get("subject")
        body = draft.get("body")
        email_id = draft.get("email_id")
        did_send = True
        if connector:
            res = connector.send_email_smtp(to_email=to_email, subject=subject, body_text=body)
            did_send = res.get("success", False)

        if did_send:
            storage.record_sent_reply(email_id, to_email, subject, body, mode="send")
            storage.remove_from_draft_queue(draft.get("id"))
            dispatched_count += 1

    return {"success": True, "count": dispatched_count, "message": f"✓ Dispatched {dispatched_count} drafts"}


@app.get("/api/workflows/rules")
async def get_workflow_rules_endpoint():
    """Retrieve autonomous background workflow rules."""
    return storage.load_workflow_rules()


@app.post("/api/workflows/rules")
async def save_workflow_rules_endpoint(rules: List[Dict[str, Any]]):
    """Update workflow rules."""
    storage.save_workflow_rules(rules)
    return {"success": True, "rules": rules}


# ============================================================================
# 2. Executive Analytics & Inbox Health Engine
# ============================================================================

@app.get("/api/analytics/overview")
async def get_analytics_overview():
    """Compute executive inbox analytics, category distribution, and health score."""
    emails = storage.load_cached_emails()
    if not emails:
        emails = get_demo_emails()

    total = len(emails)
    unread = sum(1 for e in emails if e.get("is_unread"))
    urgent = sum(1 for e in emails if e.get("ai_analysis", {}).get("priority") in ["Critical", "High"])
    pending_tasks = sum(1 for e in emails for a in e.get("ai_analysis", {}).get("action_items", []) if not a.get("completed"))
    replied = sum(1 for e in emails if e.get("has_replied") or (e.get("sent_replies") and len(e.get("sent_replies")) > 0))

    cat_counts = {}
    for e in emails:
        c = e.get("ai_analysis", {}).get("category", "General")
        cat_counts[c] = cat_counts.get(c, 0) + 1

    pa_scores = [e.get("ai_analysis", {}).get("subtext_analysis", {}).get("passive_aggression_score", 15) for e in emails]
    avg_stress = round(sum(pa_scores) / max(len(pa_scores), 1), 1)

    unread_deduction = min((unread / max(total, 1)) * 30, 30)
    task_deduction = min(pending_tasks * 3, 20)
    stress_deduction = min(max(avg_stress - 20, 0) * 0.3, 15)
    health_score = max(int(100 - unread_deduction - task_deduction - stress_deduction), 35)

    if health_score >= 90:
        grade = "A+ (Inbox Zero Elite)"
        health_color = "#10b981"
    elif health_score >= 78:
        grade = "A (Clean & Controlled)"
        health_color = "#34d399"
    elif health_score >= 65:
        grade = "B (Moderate Backlog)"
        health_color = "#f59e0b"
    else:
        grade = "C (Action Required)"
        health_color = "#f43f5e"

    color_palette = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#64748b"]

    return {
        "total_emails": total,
        "unread_count": unread,
        "urgent_count": urgent,
        "pending_tasks": pending_tasks,
        "pending_actions": pending_tasks,
        "replied_count": replied,
        "health_score": health_score,
        "health_grade": grade,
        "health_desc": "Inbox Zero Elite" if health_score >= 90 else "Controlled",
        "health_color": health_color,
        "average_stress_index": avg_stress,
        "stress_percent": int(avg_stress),
        "stress_index": "Low" if avg_stress < 25 else ("Moderate" if avg_stress < 45 else "High"),
        "category_distribution": [
            {"category": k, "count": v, "percentage": round((v / max(total, 1)) * 100, 1)}
            for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
        ],
        "categories": [
            {
                "name": k,
                "count": v,
                "percent": round((v / max(total, 1)) * 100, 1),
                "color": color_palette[i % len(color_palette)]
            }
            for i, (k, v) in enumerate(sorted(cat_counts.items(), key=lambda x: x[1], reverse=True))
        ],
        "threats_deterred": sum(1 for e in emails if e.get("ai_analysis", {}).get("phishing_warning")),
        "drafts_pending": len(storage.load_draft_queue()),
        "drafts_staged": len(storage.load_draft_queue())
    }


# ============================================================================
# 3. Multi-Account Switching & Management (Gmail, IITM Smail, Demo)
# ============================================================================

class SwitchAccountRequest(BaseModel):
    account_id: str


class AddAccountRequest(BaseModel):
    name: str
    email: str
    app_password: str
    imap_host: Optional[str] = "imap.gmail.com"
    imap_port: Optional[int] = 993
    switch_now: Optional[bool] = True


class TestAccountRequest(BaseModel):
    email: str
    app_password: str
    imap_host: Optional[str] = "imap.gmail.com"
    imap_port: Optional[int] = 993


@app.get("/api/accounts")
async def list_configured_accounts():
    """List configured and switchable mailboxes."""
    return account_manager.list_accounts()


@app.post("/api/accounts/switch")
async def switch_mailbox_account(payload: SwitchAccountRequest):
    """Switch active account cleanly without triggering unexpected background sync."""
    try:
        res = account_manager.switch_account(payload.account_id)
        return {"success": True, "active_account": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/accounts/test")
async def test_account_credentials_endpoint(payload: TestAccountRequest):
    """Test Gmail IMAP credentials without saving."""
    success, msg = account_manager.test_gmail_credentials(
        email=payload.email,
        app_password=payload.app_password,
        host=payload.imap_host or "imap.gmail.com",
        port=payload.imap_port or 993
    )
    return {"success": success, "message": msg}


@app.post("/api/accounts/add")
async def add_new_gmail_account(payload: AddAccountRequest):
    """Connect a new Gmail account with Google App Password validation."""
    try:
        res = account_manager.add_gmail_account(
            name=payload.name,
            email=payload.email,
            app_password=payload.app_password,
            imap_host=payload.imap_host or "imap.gmail.com",
            imap_port=payload.imap_port or 993,
            switch_now=payload.switch_now if payload.switch_now is not None else True
        )
        if payload.switch_now:
            try:
                await sync_emails()
            except Exception as e:
                print(f"Sync error on new account add: {e}")
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/accounts/{account_id}")
async def delete_account_endpoint(account_id: str):
    """Remove a connected account."""
    try:
        res = account_manager.remove_account(account_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/config")
async def get_config():
    """Return current configuration with passwords masked."""
    return config.get_masked_config()


@app.post("/api/config")
async def update_config(payload: ConfigUpdate):
    """Update settings and reinitialize AI Agent if API key changed."""
    data = payload.model_dump(exclude_unset=True)
    updated = config.save_config(data)

    if "gemini_api_key" in data and data["gemini_api_key"]:
        agent.set_api_key(data["gemini_api_key"])
        companion.set_api_key(data["gemini_api_key"])

    return config.get_masked_config()


@app.post("/api/config/test-imap")
async def test_imap_connection(payload: ConfigUpdate):
    """Test IMAP connection with provided credentials."""
    cfg = config.load_config()
    host = payload.imap_host or cfg.get("imap_host", "imap.gmail.com")
    port = payload.imap_port or cfg.get("imap_port", 993)
    user = payload.imap_user or cfg.get("imap_user", "")
    password = payload.imap_password or cfg.get("imap_password", "")

    if not user or not password:
        return {"success": False, "message": "Username and password cannot be empty."}

    connector = MailConnector(host=host, port=port, user=user, password=password)
    res = connector.test_connection()
    return res


@app.post("/api/config/test-smail")
async def test_smail_connection(payload: ConfigUpdate):
    """Test connection to deployed IITM Smail Google Apps Script gateway."""
    from mail_connector import test_apps_script_connection
    cfg = config.load_config()
    url = payload.smail_script_url or cfg.get("smail_script_url", "")
    token = payload.smail_token or cfg.get("smail_token", "iitm_smail_secret_2026")
    return test_apps_script_connection(url, token)


class SaveSmailConfigRequest(BaseModel):
    smail_script_url: Optional[str] = None
    smail_token: Optional[str] = "iitm_smail_secret_2026"
    imap_password: Optional[str] = None


@app.get("/api/smail/script-code")
async def get_smail_script_code():
    """Return the Google Apps Script template code for IIT Madras Smail."""
    script_path = Path(__file__).resolve().parent / "google_apps_script_iitm.js"
    if script_path.exists():
        with open(script_path, "r", encoding="utf-8") as f:
            code = f.read()
    else:
        code = ""
    return {
        "filename": "google_apps_script_iitm.js",
        "email": "am26m001@smail.iitm.ac.in",
        "code": code
    }


@app.post("/api/smail/configure")
async def configure_smail(payload: SaveSmailConfigRequest):
    """Save IIT Madras Smail configuration (Web App URL or IMAP password)."""
    updates = {}
    if payload.smail_script_url is not None:
        updates["smail_script_url"] = payload.smail_script_url.strip()
    if payload.smail_token is not None:
        updates["smail_token"] = payload.smail_token.strip()

    config.save_config(updates)

    acc_data = account_manager.load_accounts_data()
    for acc in acc_data.get("accounts", []):
        if acc["id"] == "iitm_smail":
            if payload.smail_script_url is not None:
                acc["smail_script_url"] = payload.smail_script_url.strip()
            if payload.smail_token is not None:
                acc["smail_token"] = payload.smail_token.strip()
            if payload.imap_password:
                acc["imap_password"] = payload.imap_password.strip()
                acc["type"] = "Gmail IMAP/SMTP"
            break
    account_manager.save_accounts_data(acc_data)

    return {"success": True, "message": "IIT Madras Smail configuration saved successfully."}


@app.post("/api/config/test-mobile-alert")
async def test_mobile_alert_endpoint(payload: ConfigUpdate):
    """Sends an instant test ping to verify Telegram or Webhook setup."""
    return notifier.test_mobile_alert(
        bot_token=payload.telegram_bot_token,
        chat_id=payload.telegram_chat_id,
        webhook_url=payload.whatsapp_webhook_url
    )


@app.post("/api/emails/{email_id}/notify-mobile")
async def notify_mobile_single_email(email_id: str):
    """Dispatches immediate mobile alert (Telegram / WhatsApp) for a specific email."""
    em = storage.get_email_by_id(email_id)
    if not em:
        raise HTTPException(status_code=404, detail="Email not found")

    analysis = em.get("ai_analysis") or {}
    flat_data = dict(em)
    flat_data["priority"] = analysis.get("priority", "Medium")
    flat_data["summary"] = analysis.get("summary", "")
    flat_data["category"] = analysis.get("category", "General")
    flat_data["action_items"] = [a.get("task", "") if isinstance(a, dict) else str(a) for a in analysis.get("action_items", [])]
    flat_data["subtext_analysis"] = analysis.get("subtext_analysis", {})
    flat_data["suggested_responses"] = analysis.get("suggested_responses", [])
    flat_data["calendar_event"] = analysis.get("calendar_event")

    result = notifier.dispatch_urgent_alert(flat_data, force=True)
    return result


# ============================================================================
# Advanced Upgrades: Style Cloning, Attachments, Calendar, Followup, Declutter
# ============================================================================

# 1. Style Cloning
@app.get("/api/style/profile")
async def get_style_profile_endpoint():
    """Retrieve learned personal writing style profile for Santhosh."""
    return style_cloner.load_style_profile()


@app.post("/api/style/train")
async def train_style_profile_endpoint():
    """Retrain style profile from sent replies and cached sent mailbox."""
    sent = storage.load_sent_replies()
    updated = style_cloner.analyze_sent_emails(sent)
    return {"success": True, "profile": updated}


# 2. Attachment Intelligence
@app.get("/api/emails/{email_id}/attachments/{att_idx}/analyze")
async def analyze_attachment_endpoint(email_id: str, att_idx: int):
    """Analyze attached documents, PDFs, slides, and extract insights."""
    return attachment_analyzer.analyze_attachment(email_id, att_idx)


# 3. Two-Way Calendar Conflict
class CalendarCheckRequest(BaseModel):
    slot: str
    subject: Optional[str] = ""


@app.post("/api/calendar/check-conflict")
async def check_calendar_conflict_endpoint(payload: CalendarCheckRequest):
    """Check scheduling conflict for a proposed meeting slot."""
    return calendar_engine.check_slot_conflict(payload.slot, payload.subject)


@app.get("/api/calendar/events")
async def get_calendar_events_endpoint():
    """Return active schedule commitments."""
    return calendar_engine.load_calendar_events()


# 4. Ghost Follow-up Watchdog
@app.get("/api/followups/pending")
async def get_pending_followups_endpoint():
    """Scan and list threads awaiting response with staged nudges."""
    return followup_watchdog.scan_and_stage_followup_nudges()


@app.post("/api/followups/{fup_id}/nudge")
async def stage_followup_nudge_endpoint(fup_id: str):
    """Stage a polite follow-up nudge draft in the Draft Queue."""
    return followup_watchdog.create_followup_nudge(fup_id)


# 5. Inbox Declutter & Sweep
@app.get("/api/inbox/declutter")
async def get_inbox_declutter_endpoint():
    """Analyze clutter, high-frequency newsletters, and unsubscribe links."""
    return declutter_engine.analyze_inbox_declutter()


class DeclutterSweepRequest(BaseModel):
    sender_email: str


@app.post("/api/inbox/declutter/sweep")
async def sweep_declutter_endpoint(payload: DeclutterSweepRequest):
    """One-click sweep all unread emails from a clutter sender."""
    return declutter_engine.sweep_sender_emails(payload.sender_email)


# ============================================================================
# Two-Way Mobile Telegram Command Bridge
# ============================================================================
import telegram_bridge


@app.get("/api/telegram/status")
async def get_telegram_status_endpoint():
    """Return status of two-way Telegram remote command bridge."""
    cfg = config.load_config()
    token = cfg.get("telegram_bot_token", "")
    chat_id = cfg.get("telegram_chat_id", "")
    return {
        "configured": bool(token and chat_id),
        "has_token": bool(token),
        "has_chat_id": bool(chat_id),
        "bot_username": "NovaMailAI_Bot" if token else None,
        "available_commands": ["/briefing", "/urgent", "/ask", "/status", "/declutter", "/help"]
    }


class TelegramCommandRequest(BaseModel):
    command: str


@app.post("/api/telegram/command")
async def execute_telegram_command_endpoint(payload: TelegramCommandRequest):
    """Simulate or execute a Telegram remote command."""
    response = telegram_bridge.execute_remote_command(payload.command)
    return {"command": payload.command, "response": response}


@app.post("/api/telegram/test")
async def test_telegram_alert_endpoint():
    """Dispatch a test message to configured Telegram chat."""
    cfg = config.load_config()
    token = cfg.get("telegram_bot_token", "")
    chat_id = cfg.get("telegram_chat_id", "")
    if not token or not chat_id:
        return {"success": False, "message": "Telegram Bot Token and Chat ID must be configured in Settings"}
    
    test_msg = (
        "🤖 <b>Antigravity Mail AI — Connection Verified!</b>\n\n"
        "Your two-way Telegram Command Bridge is live! You can now send:\n"
        "• <code>/briefing</code> for daily executive highlights\n"
        "• <code>/urgent</code> for high priority items\n"
        "• <code>/ask &lt;question&gt;</code> to ask Nova questions about your mail"
    )
    ok = telegram_bridge.send_message(token, chat_id, test_msg)
    return {"success": ok, "message": "Dispatched test message" if ok else "Failed to send (check token/chat_id)"}


@app.post("/api/telegram/webhook")
async def telegram_webhook_endpoint(update: Dict[str, Any] = Body(...)):
    """Webhook endpoint for incoming Telegram updates."""
    cfg = config.load_config()
    token = cfg.get("telegram_bot_token", "")
    msg = update.get("message") or update.get("channel_post")
    if msg and "text" in msg and token:
        from_chat = str(msg.get("chat", {}).get("id", ""))
        text = msg.get("text", "")
        reply = telegram_bridge.execute_remote_command(text)
        telegram_bridge.send_message(token, from_chat, reply)
    return {"ok": True}


# ============================================================================
# Security Threat Intelligence & Phishing Scanner
# ============================================================================
import security_scanner


@app.get("/api/security/scan/{email_id}")
async def scan_single_email_security_endpoint(email_id: str):
    """Scan an individual email for phishing, spoofing, and threats."""
    email = storage.get_email_by_id(email_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return security_scanner.scan_email_security(email)


@app.get("/api/security/overview")
async def get_security_overview_endpoint():
    """Retrieve security health metrics and threat counts across mailbox."""
    return security_scanner.scan_inbox_security_overview()


# ============================================================================
# Autonomous Workflow Automations ("Nova Zapier / Trigger Engine")
# ============================================================================
import automation_engine


@app.get("/api/automations")
async def get_automation_rules_endpoint():
    """List all active automation workflow recipes."""
    return automation_engine.load_automation_rules()


class AutomationRuleUpdate(BaseModel):
    rule: Dict[str, Any]


@app.post("/api/automations/rule")
async def save_automation_rule_endpoint(payload: AutomationRuleUpdate):
    """Create or update an automation rule."""
    rules = automation_engine.load_automation_rules()
    new_rule = payload.rule
    rule_id = new_rule.get("id")
    updated = False
    for i, r in enumerate(rules):
        if r.get("id") == rule_id:
            rules[i] = new_rule
            updated = True
            break
    if not updated:
        rules.append(new_rule)
    automation_engine.save_automation_rules(rules)
    return {"success": True, "rules": rules}


@app.post("/api/automations/run")
async def execute_automations_endpoint():
    """Execute all active automation recipes across the entire inbox."""
    return automation_engine.run_all_automations()


# ============================================================================
# Contact & People Intelligence CRM
# ============================================================================
import contacts_engine


@app.get("/api/contacts")
async def get_contacts_list_endpoint():
    """Retrieve list of analyzed contacts sorted by relationship importance."""
    return contacts_engine.analyze_contacts()


@app.get("/api/contacts/{email_address}")
async def get_contact_dossier_endpoint(email_address: str):
    """Retrieve deep dossier for an individual contact."""
    import urllib.parse
    decoded = urllib.parse.unquote(email_address)
    dossier = contacts_engine.get_contact_dossier(decoded)
    if not dossier:
        raise HTTPException(status_code=404, detail="Contact not found")
    return dossier


# ============================================================================
# Multi-Language Autonomous Translation
# ============================================================================
import translator_engine


@app.get("/api/translate/email/{email_id}")
async def translate_email_endpoint(email_id: str, target_lang: str = Query("English")):
    """Translate an email's subject and body to target language."""
    return translator_engine.translate_email(email_id, target_lang)


# ============================================================================
# Voice-to-Email Ghostwriter Engine
# ============================================================================
import dictation_engine


class GhostwriterRequest(BaseModel):
    raw_transcript: str
    tone: Optional[str] = "Executive Professional"
    recipient_hint: Optional[str] = ""


@app.post("/api/ghostwriter/polish")
async def polish_ghostwriter_endpoint(payload: GhostwriterRequest):
    """Transform informal voice dictation into a polished style-cloned email."""
    return dictation_engine.polish_dictated_voice_note(
        payload.raw_transcript,
        payload.tone or "Executive Professional",
        payload.recipient_hint or ""
    )


# ============================================================================
# Productivity Analytics & Burnout Engine
# ============================================================================
import analytics_engine


@app.get("/api/analytics/velocity")
async def get_velocity_analytics_endpoint():
    """Compute inbox velocity, focus hours saved, and burnout metrics."""
    return analytics_engine.calculate_productivity_telemetry()

# Autonomous Background Mail Watcher
# ============================================================================
watcher_state = {
    "enabled": True,
    "interval_seconds": 300,
    "last_sync": "Active",
    "last_new_count": 0,
    "is_running": False
}


@app.on_event("startup")
async def start_background_watcher():
    """Start autonomous background mail polling loop."""
    import asyncio
    from datetime import datetime

    async def _watcher_loop():
        watcher_state["is_running"] = True
        while True:
            await asyncio.sleep(watcher_state.get("interval_seconds", 300))
            if not watcher_state.get("enabled"):
                continue

            try:
                active_acc = account_manager.get_active_account()
                if not active_acc:
                    continue
                active_id = active_acc.get("id")
                cfg = config.load_config()

                # Strictly monitor ONLY the currently active mailbox (never both at a time)
                fetched = []
                if active_id == "iitm_smail":
                    smail_url = cfg.get("smail_script_url") or active_acc.get("smail_script_url")
                    iitm_imap_pw = active_acc.get("imap_password") or (cfg.get("imap_password") if cfg.get("mailbox_type") == "smail" else "")
                    if smail_url:
                        from mail_connector import fetch_from_apps_script
                        fetched = fetch_from_apps_script(
                            script_url=smail_url,
                            token=cfg.get("smail_token", "iitm_smail_secret_2026"),
                            limit=cfg.get("fetch_count", 15)
                        )
                    elif iitm_imap_pw:
                        connector = MailConnector(
                            host=active_acc.get("imap_host", "imap.gmail.com"),
                            port=active_acc.get("imap_port", 993),
                            user=active_acc.get("email", "am26m001@smail.iitm.ac.in"),
                            password=iitm_imap_pw,
                            use_ssl=True
                        )
                        fetched = connector.fetch_emails(limit=cfg.get("fetch_count", 15))
                elif active_id != "demo":
                    # Personal Gmail or other IMAP account
                    imap_user = active_acc.get("imap_user") or active_acc.get("email")
                    imap_pw = active_acc.get("imap_password")
                    if imap_user and imap_pw:
                        connector = MailConnector(
                            host=active_acc.get("imap_host", "imap.gmail.com"),
                            port=active_acc.get("imap_port", 993),
                            user=imap_user,
                            password=imap_pw,
                            use_ssl=True
                        )
                        fetched = connector.fetch_emails(limit=cfg.get("fetch_count", 15))

                if not fetched:
                    continue

                cached = storage.load_cached_emails()
                cached_ids = {e.get("id") for e in cached}
                new_emails = [e for e in fetched if e.get("id") not in cached_ids]

                if new_emails:
                    for em in new_emails:
                        em["ai_analysis"] = agent.analyze_email(em)
                        prio = em.get("ai_analysis", {}).get("priority", "Medium")
                        if prio in ["Critical", "High"] and (cfg.get("enable_mobile_alerts") or cfg.get("sms_alerts_enabled", True)):
                            try:
                                flat_data = dict(em)
                                flat_data["priority"] = prio
                                flat_data["summary"] = em.get("ai_analysis", {}).get("summary_tldr", "")
                                flat_data["category"] = em.get("ai_analysis", {}).get("category", "General")
                                flat_data["action_items"] = [a.get("task", "") if isinstance(a, dict) else str(a) for a in em.get("ai_analysis", {}).get("action_items", [])]
                                notifier.dispatch_urgent_alert(flat_data, force=False)
                            except Exception:
                                pass

                    storage.save_cached_emails(new_emails + cached)
                    watcher_state["last_new_count"] = len(new_emails)

                watcher_state["last_sync"] = datetime.now().strftime("%I:%M %p")
            except Exception as e:
                print(f"[Background Watcher Exception] {e}")

    async def _telegram_polling_loop():
        while True:
            await asyncio.sleep(6)
            try:
                cfg = config.load_config()
                token = cfg.get("telegram_bot_token")
                if token:
                    telegram_bridge.poll_updates_once(token, cfg.get("telegram_chat_id"))
            except Exception:
                pass

    asyncio.create_task(_watcher_loop())
    asyncio.create_task(_telegram_polling_loop())


@app.get("/api/watcher/status")
async def get_watcher_status():
    """Return autonomous background watcher state and telemetry."""
    return watcher_state


@app.post("/api/watcher/configure")
async def configure_watcher(payload: WatcherConfigRequest):
    """Toggle watcher state or adjust polling frequency."""
    watcher_state["enabled"] = payload.enabled
    if payload.interval_seconds and payload.interval_seconds >= 30:
        watcher_state["interval_seconds"] = payload.interval_seconds
    return watcher_state


# ==============================================================================
# INNOVATION TRACK 1: OPPORTUNITY & ACADEMIC DEADLINE RADAR
# ==============================================================================
@app.get("/api/radar/opportunities")
async def get_radar_opportunities():
    """Scan active mailbox for internships, jobs, campus circulars, and academic deadlines."""
    emails = storage.load_cached_emails()
    active_acc = account_manager.load_accounts_data()
    active_id = active_acc.get("active_account_id", "personal_gmail")
    acc_name = "Active Mailbox"
    for acc in active_acc.get("accounts", []):
        if acc.get("id") == active_id:
            acc_name = acc.get("name", active_id)
            break

    opportunities = OpportunityRadarEngine.scan_opportunities(emails)
    return {
        "opportunities": opportunities,
        "count": len(opportunities),
        "account_id": active_id,
        "account_name": acc_name
    }


@app.post("/api/radar/add-to-calendar")
async def add_opportunity_to_calendar(payload: AddRadarToCalendarRequest):
    """Add opportunity deadline to the user's active calendar."""
    events = calendar_engine.load_calendar_events()
    new_event = {
        "id": f"radar_{payload.opportunity_id}_{len(events) + 1}",
        "title": f"🎯 [Deadline] {payload.title}",
        "start_time": f"{payload.deadline} (Deadline)",
        "end_time": f"{payload.deadline} 11:59 PM",
        "category": "Deadline / Opportunity",
        "location": payload.organization,
        "description": payload.details,
        "busy": True
    }
    events.insert(0, new_event)
    calendar_engine.save_calendar_events(events)
    return {"success": True, "event": new_event, "message": "Deadline synced to calendar!"}


# ==============================================================================
# INNOVATION TRACK 2: BILATERAL COMMITMENT LEDGER
# ==============================================================================
@app.get("/api/commitments/ledger")
async def get_commitments_ledger():
    """Analyze bilateral promises made by the user vs. promises made to the user."""
    emails = storage.load_cached_emails()
    ledger = CommitmentLedgerEngine.scan_commitments(emails)
    return ledger


@app.post("/api/commitments/nudge-draft")
async def generate_commitment_nudge(payload: NudgeCommitmentRequest):
    """Generate a polite follow-up nudge draft for an outstanding commitment."""
    emails = storage.load_cached_emails()
    ledger = CommitmentLedgerEngine.scan_commitments(emails)
    nudge = CommitmentLedgerEngine.generate_nudge_draft(payload.commitment_id, ledger)
    return nudge


# ==============================================================================
# INNOVATION TRACK 3: DUAL-HOST MORNING AUDIO SHOW (AI PODCAST)
# ==============================================================================
@app.get("/api/podcast/morning-show")
async def get_morning_show_podcast():
    """Generate a 2-minute dynamic dual-host morning briefing podcast script."""
    emails = storage.load_cached_emails()
    active_acc = account_manager.load_accounts_data()
    active_id = active_acc.get("active_account_id", "personal_gmail")
    acc_name = "Active Mailbox"
    for acc in active_acc.get("accounts", []):
        if acc.get("id") == active_id:
            acc_name = acc.get("name", active_id)
            break
    show = MorningShowPodcastEngine.generate_show(emails, active_account_name=acc_name)
    return show


# ==============================================================================
# INNOVATION TRACK 4: RECIPIENT REACTION SIMULATOR
# ==============================================================================
@app.post("/api/simulator/analyze")
async def simulate_recipient_reaction(payload: ReactionSimulateRequest):
    """Predict recipient friction, sentiment score, and generate persuasive rewrites."""
    result = ReactionSimulatorEngine.simulate_reaction(
        draft_body=payload.draft_body,
        recipient_email=payload.recipient_email or "",
        context_subject=payload.context_subject or ""
    )
    return result


# ==============================================================================
# SMS URGENT ALERTS ENGINE (TARGET: +91 9392709150)
# ==============================================================================
@app.get("/api/sms/outbox")
async def get_sms_outbox():
    """Return historical SMS dispatch records, delivery receipts, and current configuration."""
    cfg = config.load_config()
    outbox = notifier.load_sms_outbox()
    return {
        "success": True,
        "count": len(outbox),
        "target_phone": cfg.get("sms_recipient_phone", "+919392709150"),
        "sms_enabled": cfg.get("sms_alerts_enabled", True),
        "provider": cfg.get("sms_provider", "fast2sms"),
        "has_api_key": bool(cfg.get("sms_api_key")),
        "outbox": outbox
    }


@app.post("/api/sms/test")
async def send_test_sms(payload: SendTestSmsRequest):
    """Send an immediate test SMS to verify cellular delivery to the user's phone."""
    cfg = config.load_config()
    phone = payload.phone_number or cfg.get("sms_recipient_phone") or "+919392709150"
    msg = payload.message or (
        f"🚨 [URGENT MAIL ALERT]\n"
        f"From: DOST Office IIT Madras\n"
        f"Subj: Final Course Enrollment Verification\n"
        f"TLDR: Mandatory verification closes today at 5:00 PM.\n"
        f"Action: Verify enrolled courses on portal\n"
        f"- Antigravity AI"
    )
    result = notifier.send_sms_alert(phone_number=phone, message_text=msg, custom_cfg=cfg)
    return result


@app.post("/api/sms/configure")
async def configure_sms_endpoint(payload: ConfigUpdate):
    """Update SMS phone number, provider, and API credentials."""
    updates = {}
    if payload.sms_alerts_enabled is not None:
        updates["sms_alerts_enabled"] = payload.sms_alerts_enabled
    if payload.sms_recipient_phone is not None:
        updates["sms_recipient_phone"] = payload.sms_recipient_phone.strip()
    if payload.sms_provider is not None:
        updates["sms_provider"] = payload.sms_provider.strip().lower()
    if payload.sms_api_key is not None:
        updates["sms_api_key"] = payload.sms_api_key.strip()
    if payload.sms_twilio_account_sid is not None:
        updates["sms_twilio_account_sid"] = payload.sms_twilio_account_sid.strip()
    if payload.sms_twilio_auth_token is not None:
        updates["sms_twilio_auth_token"] = payload.sms_twilio_auth_token.strip()
    if payload.sms_twilio_from is not None:
        updates["sms_twilio_from"] = payload.sms_twilio_from.strip()
    if payload.sms_custom_url is not None:
        updates["sms_custom_url"] = payload.sms_custom_url.strip()

    config.save_config(updates)
    return {"success": True, "message": "SMS configuration updated successfully", "config": config.get_masked_config()}


# Mount static directory for Frontend UI
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

