"""AI Companion Agent ("Nova"): An autonomous, friendly conversational AI partner
that has full access to the user's mailbox, talks like a trusted friend/wingman,
and directly executes user commands (send real replies, mark emails read/unread,
schedule events, summarize threads, and filter intelligence).
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
import urllib.parse

from storage import (
    load_cached_emails,
    save_cached_emails,
    get_email_by_id,
    update_email_read_status,
    record_sent_reply,
    update_action_item_status,
)
import config
from mail_connector import MailConnector
import style_cloner
import attachment_analyzer
import calendar_engine
import followup_watchdog
import declutter_engine

DATA_DIR = Path(__file__).resolve().parent / "data"
COMPANION_HISTORY_FILE = DATA_DIR / "companion_history.json"


def load_companion_history() -> List[Dict[str, Any]]:
    """Load conversation history between user and Nova."""
    if not COMPANION_HISTORY_FILE.exists():
        return []
    try:
        with open(COMPANION_HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Error loading companion history: {e}")
        return []


def save_companion_history(messages: List[Dict[str, Any]]) -> None:
    """Save conversation history to disk."""
    try:
        temp_file = COMPANION_HISTORY_FILE.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(messages, f, indent=2, ensure_ascii=False)
        temp_file.replace(COMPANION_HISTORY_FILE)
    except Exception as e:
        print(f"Error saving companion history: {e}")


def clear_companion_history() -> None:
    """Clear conversation history."""
    if COMPANION_HISTORY_FILE.exists():
        try:
            COMPANION_HISTORY_FILE.unlink()
        except Exception:
            pass


class CompanionAgent:
    """Autonomous AI Friend with full mailbox access and tool execution."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = model_name
        self.client = None
        self._init_gemini_client()

    def _init_gemini_client(self):
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini client for Companion: {e}")
                self.client = None
        else:
            self.client = None

    def set_api_key(self, api_key: str):
        self.api_key = api_key
        self._init_gemini_client()

    def chat(self, user_message: str, incoming_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Process conversational query or command from the user, execute actions,
        and respond like a smart, warm friend.
        """
        user_msg = user_message.strip()
        emails = load_cached_emails()

        # Step 1: Detect explicit commands and execute them
        action_result = self._parse_and_execute_command(user_msg, emails)

        # Refresh cached emails in case actions (mark read, reply) changed them
        emails = load_cached_emails()

        # Step 2: Formulate conversational response
        if self.client:
            try:
                response_payload = self._generate_ai_response(user_msg, emails, action_result, incoming_history)
                if response_payload:
                    return response_payload
            except Exception as e:
                print(f"[Companion Gemini Chat Error] {e}")

        # Fallback to high-EQ Intelligent Heuristic Companion Engine
        return self._generate_heuristic_response(user_msg, emails, action_result)

    def _parse_and_execute_command(self, text: str, emails: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Identify actionable commands (reply, mark read, compose, schedule) and execute them."""
        lower = text.lower().strip()
        cfg = config.load_config()

        # ---------------------------------------------------------------------
        # Command 1: Reply to email ("reply to Marcus saying...", "tell Alex...")
        # ---------------------------------------------------------------------
        reply_match = re.search(
            r"(?:reply to|respond to|send reply to|tell|let)\s+([\w\s.@]+?)\s+(?:saying|that|with message|with text|to say|and say)\s+(.+)",
            lower,
            re.IGNORECASE
        )
        if reply_match:
            target_name = reply_match.group(1).strip()
            reply_body = reply_match.group(2).strip()
            
            # Clean up user voice / speech prefix
            reply_body = re.sub(r'^(that|saying|to tell him|to tell her)\s+', '', reply_body, flags=re.IGNORECASE)
            # Capitalize first letter
            reply_body = reply_body[0].upper() + reply_body[1:] if reply_body else "Acknowledged."

            matched_email = self._find_matching_email(target_name, emails)
            if matched_email:
                eid = matched_email.get("id")
                to_email = matched_email.get("sender_email")
                sender_name = matched_email.get("sender_name", target_name)
                subject = matched_email.get("subject", "Reply")

                # Format polite closing if missing
                full_body = reply_body
                if not any(k in full_body.lower() for k in ["thanks", "regards", "santhosh", "best"]):
                    full_body += f"\n\nBest regards,\nSanthosh"

                # Send via SMTP or Demo
                if not cfg.get("demo_mode") and cfg.get("imap_user") and cfg.get("imap_password"):
                    connector = MailConnector(
                        host=cfg.get("imap_host", "imap.gmail.com"),
                        port=cfg.get("imap_port", 993),
                        user=cfg.get("imap_user"),
                        password=cfg.get("imap_password"),
                        use_ssl=cfg.get("imap_use_ssl", True)
                    )
                    send_res = connector.send_email_smtp(to_email=to_email, subject=subject, body_text=full_body)
                    success = send_res.get("success", False)
                    status_note = f"Dispatched via Gmail SMTP to {to_email}" if success else f"Failed: {send_res.get('error')}"
                else:
                    success = True
                    status_note = f"Dispatched (Demo mode) to {to_email}"

                if success:
                    record_sent_reply(eid, to_email, subject, full_body, mode="send")

                return {
                    "action_type": "reply_email",
                    "success": success,
                    "target_email_id": eid,
                    "target_recipient": f"{sender_name} <{to_email}>",
                    "subject": subject,
                    "body": full_body,
                    "status_note": status_note,
                    "raw_command": text
                }

        # ---------------------------------------------------------------------
        # Command 2: Mark read ("mark all security alerts as read", "mark all read")
        # ---------------------------------------------------------------------
        if "mark" in lower and "read" in lower and "unread" not in lower:
            # Check if all
            if any(k in lower for k in ["all", "everything", "all emails", "all mail", "whole inbox"]):
                count = 0
                for em in emails:
                    if em.get("is_unread"):
                        update_email_read_status(em.get("id"), False)
                        count += 1
                return {
                    "action_type": "mark_read_all",
                    "success": True,
                    "count": count,
                    "summary": f"Marked all {count} emails as read"
                }

            # Check if security or Google alerts
            if any(k in lower for k in ["security", "google", "alert", "password"]):
                matched_ids = []
                for em in emails:
                    subj = em.get("subject", "").lower()
                    sndr = em.get("sender_name", "").lower() + " " + em.get("sender_email", "").lower()
                    if any(k in subj + sndr for k in ["security", "google", "alert", "password", "recovery"]):
                        update_email_read_status(em.get("id"), False)
                        matched_ids.append(em.get("subject"))
                return {
                    "action_type": "mark_read_filtered",
                    "filter": "Security & Google alerts",
                    "success": True,
                    "count": len(matched_ids),
                    "summary": f"Marked {len(matched_ids)} security/account alert emails as read",
                    "affected_subjects": matched_ids[:3]
                }

            # Check specific sender
            target_search = re.search(r"mark\s+(?:email\s+from\s+|from\s+)?([\w\s]+?)\s+(?:as\s+)?read", lower)
            if target_search:
                query = target_search.group(1).replace("email", "").strip()
                matched = self._find_matching_email(query, emails)
                if matched:
                    update_email_read_status(matched.get("id"), False)
                    return {
                        "action_type": "mark_read_single",
                        "success": True,
                        "email_id": matched.get("id"),
                        "subject": matched.get("subject"),
                        "summary": f"Marked '{matched.get('subject')}' as read"
                    }

        # ---------------------------------------------------------------------
        # Command 3: Mark unread
        # ---------------------------------------------------------------------
        if "mark" in lower and "unread" in lower:
            target_search = re.search(r"mark\s+(?:email\s+from\s+|from\s+)?([\w\s]+?)\s+(?:as\s+)?unread", lower)
            if target_search:
                query = target_search.group(1).replace("email", "").strip()
                matched = self._find_matching_email(query, emails)
                if matched:
                    update_email_read_status(matched.get("id"), True)
                    return {
                        "action_type": "mark_unread_single",
                        "success": True,
                        "email_id": matched.get("id"),
                        "subject": matched.get("subject"),
                        "summary": f"Marked '{matched.get('subject')}' as unread"
                    }

        # ---------------------------------------------------------------------
        # Command 4: Compose new standalone email
        # ("send email to alex@company.com subject Hi body Hello Alex...")
        # ---------------------------------------------------------------------
        compose_match = re.search(
            r"(?:send|compose)\s+(?:an?\s+)?email\s+to\s+([^\s]+@[^\s]+)\s+(?:with\s+subject|subject)\s+(.+?)\s+(?:and\s+body|body|saying)\s+(.+)",
            text,
            re.IGNORECASE
        )
        if compose_match:
            to_addr = compose_match.group(1).strip()
            subject = compose_match.group(2).strip()
            body_txt = compose_match.group(3).strip()

            if not cfg.get("demo_mode") and cfg.get("imap_user") and cfg.get("imap_password"):
                connector = MailConnector(
                    host=cfg.get("imap_host", "imap.gmail.com"),
                    port=cfg.get("imap_port", 993),
                    user=cfg.get("imap_user"),
                    password=cfg.get("imap_password"),
                    use_ssl=cfg.get("imap_use_ssl", True)
                )
                res = connector.send_email_smtp(to_email=to_addr, subject=subject, body_text=body_txt)
                success = res.get("success", False)
                status_note = f"Dispatched via Gmail SMTP to {to_addr}" if success else f"Error: {res.get('error')}"
            else:
                success = True
                status_note = f"[Demo Simulation] Dispatched to {to_addr}"

            return {
                "action_type": "compose_email",
                "success": success,
                "target_recipient": to_addr,
                "subject": subject,
                "body": body_txt,
                "status_note": status_note
            }

        # ---------------------------------------------------------------------
        # Command 5: Schedule Google Calendar Event
        # ---------------------------------------------------------------------
        if any(k in lower for k in ["schedule", "add to calendar", "calendar event"]):
            target_search = re.search(r"(?:schedule|calendar)\s+(?:with|for|from)?\s*([\w\s]+)", lower)
            target = target_search.group(1).strip() if target_search else "Meeting"
            matched = self._find_matching_email(target, emails) if target != "Meeting" else (emails[0] if emails else None)
            
            cal_title = f"Meeting: {matched.get('subject')}" if matched else f"Meeting with {target}"
            cal_details = f"Scheduled via Nova AI Companion from email: {matched.get('snippet', '')}" if matched else "Scheduled via Nova AI Companion"
            
            # Formulate Google Calendar link for tomorrow 10am
            gcal_url = (
                f"https://calendar.google.com/calendar/render?action=TEMPLATE"
                f"&text={urllib.parse.quote(cal_title)}"
                f"&details={urllib.parse.quote(cal_details)}"
            )
            return {
                "action_type": "schedule_event",
                "success": True,
                "title": cal_title,
                "gcal_url": gcal_url,
                "summary": f"Created Google Calendar event link for '{cal_title}'"
            }

        # ---------------------------------------------------------------------
        # Command 6: Ghost Follow-up Watchdog ("who hasn't replied to me?", "followups")
        # ---------------------------------------------------------------------
        if any(k in lower for k in ["haven't replied", "havent replied", "not replied", "waiting on", "follow up", "followup", "pending reply"]):
            followups = followup_watchdog.scan_and_stage_followup_nudges()
            names = [f.get("recipient_name") for f in followups]
            return {
                "action_type": "check_followups",
                "success": True,
                "followups_count": len(followups),
                "summary": f"Scanned pending inquiries: {len(followups)} threads awaiting replies ({', '.join(names[:3])}). Nudge drafts staged in Draft Queue!"
            }

        # ---------------------------------------------------------------------
        # Command 7: Inbox Declutter & Newsletter Sweep ("declutter", "sweep newsletters")
        # ---------------------------------------------------------------------
        if any(k in lower for k in ["declutter", "clean newsletter", "sweep", "unsubscribe"]):
            declutter_data = declutter_engine.analyze_inbox_declutter()
            top_sender = declutter_data.get("senders", [{}])[0].get("sender_email", "")
            return {
                "action_type": "inbox_declutter",
                "success": True,
                "total_clutter": declutter_data.get("total_clutter_emails", 0),
                "top_sender": top_sender,
                "summary": f"Identified {declutter_data.get('total_senders')} automated distribution senders ({declutter_data.get('total_clutter_emails')} emails). Declutter Hub ready to sweep!"
            }

        # ---------------------------------------------------------------------
        # Command 8: Personal Writing Style Profile ("my style", "writing style", "voice profile")
        # ---------------------------------------------------------------------
        if any(k in lower for k in ["my style", "writing style", "voice profile", "sound like me"]):
            profile = style_cloner.load_style_profile()
            return {
                "action_type": "view_style_profile",
                "success": True,
                "tone": profile.get("tone"),
                "formality": profile.get("formality_score"),
                "summary": f"Your learned writing voice: {profile.get('tone')}. Trained on {profile.get('emails_analyzed')} sent messages."
            }

        # ---------------------------------------------------------------------
        # Command 9: Attachment Analysis ("analyze attachment", "read pdf")
        # ---------------------------------------------------------------------
        if any(k in lower for k in ["attachment", "analyze attachment", "read pdf", "check document"]):
            email_with_att = next((e for e in emails if e.get("attachments")), emails[0] if emails else None)
            if email_with_att:
                analysis = attachment_analyzer.analyze_attachment(email_with_att.get("id"), 0)
                return {
                    "action_type": "analyze_attachment",
                    "success": True,
                    "filename": analysis.get("filename"),
                    "summary": f"Extracted insights for attachment '{analysis.get('filename')}': {analysis.get('summary')}"
                }

        # ---------------------------------------------------------------------
        # Command 10: Two-Way Calendar Conflict Check ("check conflict", "calendar clash")
        # ---------------------------------------------------------------------
        if any(k in lower for k in ["conflict", "calendar clash", "am i free", "check schedule"]):
            conflict_res = calendar_engine.check_slot_conflict("Tomorrow at 3:00 PM", "Proposed Meeting")
            return {
                "action_type": "calendar_conflict_check",
                "success": True,
                "has_conflict": conflict_res.get("has_conflict"),
                "summary": conflict_res.get("recommendation")
            }

        return None

    def _find_matching_email(self, query: str, emails: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Find the most relevant email matching a sender name, keyword, or query."""
        q = query.lower().strip()
        if not q or not emails:
            return None

        # Clean words
        q_words = [w for w in re.findall(r"\w+", q) if w not in ["email", "the", "from", "to", "about", "a", "an", "mr", "ms"]]

        # 1. Exact or partial match on sender name
        for em in emails:
            sender_name = em.get("sender_name", "").lower()
            if any(w in sender_name for w in q_words):
                return em

        # 2. Match on sender email
        for em in emails:
            sender_email = em.get("sender_email", "").lower()
            if any(w in sender_email for w in q_words):
                return em

        # 3. Match on subject
        for em in emails:
            subject = em.get("subject", "").lower()
            if any(w in subject for w in q_words):
                return em

        return emails[0] if emails else None

    def _generate_ai_response(
        self,
        user_msg: str,
        emails: List[Dict[str, Any]],
        action_result: Optional[Dict[str, Any]],
        incoming_history: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[Dict[str, Any]]:
        """Use Gemini to craft a warm, clever friend response taking actions into account."""
        # Build inbox summary snapshot
        inbox_digest = []
        for i, em in enumerate(emails[:10], 1):
            ai = em.get("ai_analysis", {})
            inbox_digest.append(
                f"{i}. [ID: {em.get('id')}] From: {em.get('sender_name')} <{em.get('sender_email')}> | "
                f"Subject: {em.get('subject')} | Priority: {ai.get('priority', 'Medium')} | "
                f"Unread: {em.get('is_unread', True)} | Summary: {ai.get('summary_tldr', em.get('snippet', ''))[:120]}"
            )

        system_instruction = f"""You are "Nova", Santhosh's loyal, sharp, charismatic AI best friend and autonomous executive mail companion.
Personality:
- You talk like a real, supportive friend ("bro", "man", "Santhosh", "got your back", "done deal").
- You are witty, upbeat, warm, and highly capable—not robotic or corporate.
- You have complete access to Santhosh's mailbox and you actually execute his commands in real-time.
- If an action was just executed, you report the result enthusiastically and let him know it's taken care of.
- Keep your answers natural, concise, and easy to read. Use bullet points or bold text when summarizing emails.

User's Mailbox Snapshot (First 10 items):
{chr(10).join(inbox_digest)}

Current Action Executed by system:
{json.dumps(action_result) if action_result else "None (Conversational / inquiry request)"}
"""

        prompt = f"""User message: "{user_msg}"

Respond to Santhosh directly as Nova his AI friend. If you mention specific emails, provide their ID in citations.
Output your response as JSON:
{{
  "reply": "Your conversational response as Nova...",
  "citations": [
    {{"id": "email_id", "subject": "Email Subject", "sender": "Sender Name"}}
  ]
}}
"""

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[system_instruction, prompt],
            config={"response_mime_type": "application/json"}
        )

        if not response or not response.text:
            return None

        res_data = json.loads(response.text)
        reply_text = res_data.get("reply", "")
        citations = res_data.get("citations", [])

        # If action was taken, ensure action details are attached
        actions_list = [action_result] if action_result else []

        return {
            "reply": reply_text,
            "actions_taken": actions_list,
            "citations": citations,
            "speech_text": re.sub(r'[*_#`]', '', reply_text)
        }

    def _generate_heuristic_response(
        self,
        user_msg: str,
        emails: List[Dict[str, Any]],
        action_result: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """High-EQ Heuristic conversational generator when Gemini is not connected."""
        q_lower = user_msg.lower().strip()
        actions_list = [action_result] if action_result else []
        citations = []

        # Case A: An action was executed
        if action_result:
            act_type = action_result.get("action_type")
            if act_type == "reply_email":
                target = action_result.get("target_recipient")
                subject = action_result.get("subject")
                reply_text = (
                    f"Boom! 🚀 Handled, bro. I just dispatched that reply to **{target}** regarding *\"{subject}\"*.\n\n"
                    f"**Message sent:**\n> \"{action_result.get('body')}\"\n\n"
                    f"Status: {action_result.get('status_note')}. You're all set! Anything else you want me to take care of?"
                )
                citations.append({
                    "id": action_result.get("target_email_id"),
                    "subject": subject,
                    "sender": target
                })
                return {
                    "reply": reply_text,
                    "actions_taken": actions_list,
                    "citations": citations,
                    "speech_text": f"Handled, bro! I just dispatched that reply to {target}."
                }

            elif act_type == "mark_read_all":
                count = action_result.get("count", 0)
                reply_text = f"Consider it done! ✨ I just marked all **{count} emails** as read. Your inbox is clean and organized, Santhosh!"
                return {
                    "reply": reply_text,
                    "actions_taken": actions_list,
                    "citations": [],
                    "speech_text": f"Consider it done! I just marked all {count} emails as read."
                }

            elif act_type == "mark_read_filtered":
                count = action_result.get("count", 0)
                filter_name = action_result.get("filter", "alerts")
                reply_text = f"All wiped clean, man! 🛡️ Marked **{count} {filter_name}** as read so they stop cluttering your view."
                return {
                    "reply": reply_text,
                    "actions_taken": actions_list,
                    "citations": [],
                    "speech_text": f"All wiped clean, man! Marked {count} {filter_name} as read."
                }

            elif act_type == "mark_read_single":
                subj = action_result.get("subject", "email")
                reply_text = f"Gotcha! Marked *\"{subj}\"* as read. What's next on our agenda?"
                return {
                    "reply": reply_text,
                    "actions_taken": actions_list,
                    "citations": [{"id": action_result.get("email_id"), "subject": subj}],
                    "speech_text": f"Marked {subj} as read."
                }

            elif act_type == "mark_unread_single":
                subj = action_result.get("subject", "email")
                reply_text = f"Done, flipped *\"{subj}\"* back to unread so you won't forget it later, bro!"
                return {
                    "reply": reply_text,
                    "actions_taken": actions_list,
                    "citations": [{"id": action_result.get("email_id"), "subject": subj}],
                    "speech_text": f"Marked {subj} as unread."
                }

            elif act_type == "compose_email":
                to_addr = action_result.get("target_recipient")
                subj = action_result.get("subject")
                reply_text = (
                    f"Done and dispatched! ✉️ Sent that brand new email to **{to_addr}** with subject *\"{subj}\"*.\n"
                    f"Status: {action_result.get('status_note')}."
                )
                return {
                    "reply": reply_text,
                    "actions_taken": actions_list,
                    "citations": [],
                    "speech_text": f"Sent that brand new email to {to_addr}."
                }

            elif act_type == "schedule_event":
                gcal = action_result.get("gcal_url")
                title = action_result.get("title")
                reply_text = (
                    f"I set up that calendar slot for you, bro! 📅\n\n"
                    f"**Event**: {title}\n\n"
                    f"👉 [Click here to confirm & add to Google Calendar]({gcal})\n\n"
                    f"Let me know if you want me to reply to the sender and let them know!"
                )
                return {
                    "reply": reply_text,
                    "actions_taken": actions_list,
                    "citations": [],
                    "speech_text": f"I set up that calendar slot for you! Link is ready in the chat."
                }

        # Case B: Inquiries / Chatting with your friend
        # 1. Greetings & "What's good?" / Catch me up
        if any(k in q_lower for k in ["hey", "hello", "hi", "what's up", "whats up", "what's good", "yo", "sup", "bro", "how are you", "catch me up", "what happened"]):
            unread_count = sum(1 for e in emails if e.get("is_unread"))
            critical_count = sum(1 for e in emails if e.get("ai_analysis", {}).get("priority") in ["Critical", "High"])
            
            reply_parts = [
                f"Yo Santhosh! Good to see you, bro! 👋\n\n"
                f"I've got eyes on your entire inbox right now ({len(emails)} emails synced, **{unread_count} unread**, **{critical_count} urgent**).\n\n"
                f"Here's what stands out today:"
            ]
            for em in emails[:3]:
                ai = em.get("ai_analysis", {})
                prio = ai.get("priority", "Medium")
                tldr = ai.get("summary_tldr", em.get("snippet", ""))[:90]
                reply_parts.append(f"- **{em.get('sender_name')}**: *\"{em.get('subject')}\"* — {tldr}...")
                citations.append({"id": em.get("id"), "subject": em.get("subject"), "sender": em.get("sender_name")})

            reply_parts.append("\nWhat do you want me to tackle? I can reply to anyone, mark stuff as read, or hunt down job updates!")
            reply_text = "\n".join(reply_parts)
            return {
                "reply": reply_text,
                "actions_taken": [],
                "citations": citations,
                "speech_text": f"Yo Santhosh! Good to see you bro. You have {unread_count} unread emails and {critical_count} urgent items. Ready whenever you are!"
            }

        # 2. Jobs / Placements / Careers
        if any(k in q_lower for k in ["job", "career", "placement", "unstop", "naukri", "interview", "shortlist", "hire"]):
            job_emails = []
            for em in emails:
                txt = (em.get("subject", "") + " " + em.get("sender_name", "") + " " + em.get("body_plain", "")).lower()
                if any(w in txt for w in ["job", "career", "naukri", "unstop", "shortlist", "interview", "engineer", "developer", "intern", "hiring"]):
                    job_emails.append(em)

            if job_emails:
                reply_parts = [f"Checked your career radar, bro! Found **{len(job_emails)} job & career updates**:\n"]
                for em in job_emails[:4]:
                    ai = em.get("ai_analysis", {})
                    tldr = ai.get("summary_tldr", em.get("snippet", ""))
                    reply_parts.append(f"💼 **{em.get('sender_name')}** — *{em.get('subject')}*\n> {tldr}\n")
                    citations.append({"id": em.get("id"), "subject": em.get("subject"), "sender": em.get("sender_name")})
                reply_parts.append("Want me to reply to any of them or mark them as reviewed?")
                reply_text = "\n".join(reply_parts)
            else:
                reply_text = "I checked all your emails, Santhosh—no new job offers or interview requests in the latest sync. I'll keep monitoring in the background!"

            return {
                "reply": reply_text,
                "actions_taken": [],
                "citations": citations,
                "speech_text": f"Checked your career radar, Santhosh! Found {len(job_emails)} job updates."
            }

        # 3. Finances / Money / Invoices
        if any(k in q_lower for k in ["money", "finance", "bill", "invoice", "balance", "cost", "nse", "statement", "pay"]):
            fin_emails = []
            for em in emails:
                ai = em.get("ai_analysis", {})
                cat = str(ai.get("category", "")).lower()
                amounts = ai.get("key_entities", {}).get("amounts", [])
                txt = (em.get("subject", "") + " " + em.get("sender_name", "")).lower()
                if "finance" in cat or amounts or any(w in txt for w in ["nse", "invoice", "balance", "securities", "tax", "bill"]):
                    fin_emails.append((em, amounts))

            if fin_emails:
                reply_parts = [f"Here's the financial breakdown across your mailbox, man: 💳\n"]
                for em, amounts in fin_emails[:4]:
                    amt_str = f" ({', '.join(amounts)})" if amounts else ""
                    reply_parts.append(f"- **{em.get('sender_name')}**: *{em.get('subject')}*{amt_str}\n  Date: {em.get('date_display')}")
                    citations.append({"id": em.get("id"), "subject": em.get("subject"), "sender": em.get("sender_name")})
                reply_parts.append("\nEverything looks logged. Want me to open the Finance Hub for the full transaction ledger?")
                reply_text = "\n".join(reply_parts)
            else:
                reply_text = "No pending unpaid bills or red flags spotted in your inbox today, bro! Looking clean."

            return {
                "reply": reply_text,
                "actions_taken": [],
                "citations": citations,
                "speech_text": "Here is your financial breakdown, bro."
            }

        # 4. Urgent / What should I do first?
        if any(k in q_lower for k in ["urgent", "priority", "critical", "what should i do", "what first", "tasks"]):
            urgent_emails = [e for e in emails if e.get("ai_analysis", {}).get("priority") in ["Critical", "High"]]
            if not urgent_emails:
                urgent_emails = emails[:3]

            reply_parts = [f"Here is what needs your immediate attention, bro: 🚨\n"]
            for i, em in enumerate(urgent_emails[:3], 1):
                ai = em.get("ai_analysis", {})
                acts = ai.get("action_items", [])
                task_str = f" → **Task**: {acts[0].get('task')}" if acts else ""
                reply_parts.append(f"**{i}. {em.get('subject')}** ({em.get('sender_name')}){task_str}")
                citations.append({"id": em.get("id"), "subject": em.get("subject"), "sender": em.get("sender_name")})

            reply_parts.append("\nTell me what to reply or what action to take and I'll execute it right now!")
            reply_text = "\n".join(reply_parts)
            return {
                "reply": reply_text,
                "actions_taken": [],
                "citations": citations,
                "speech_text": "Here is what needs your immediate attention, Santhosh."
            }

        # 5. Fallback: Search across inbox with friend tone
        words = [w for w in re.findall(r"\w+", q_lower) if len(w) > 2 and w not in ["what", "how", "tell", "show", "can", "you", "does", "any", "the"]]
        matched = []
        for em in emails:
            txt = (em.get("subject", "") + " " + em.get("sender_name", "") + " " + em.get("snippet", "") + " " + em.get("body_plain", "")).lower()
            score = sum(1 for w in words if w in txt)
            if score > 0:
                matched.append((score, em))

        matched.sort(key=lambda x: x[0], reverse=True)
        top = [m[1] for m in matched[:4]] if matched else emails[:3]

        reply_parts = [f"Got your back, Santhosh! Here's what I found related to *\"{user_msg}\"*:\n"]
        for em in top:
            ai = em.get("ai_analysis", {})
            tldr = ai.get("summary_tldr", em.get("snippet", ""))[:110]
            reply_parts.append(f"- **{em.get('sender_name')}** — *{em.get('subject')}*\n  _{tldr}_")
            citations.append({"id": em.get("id"), "subject": em.get("subject"), "sender": em.get("sender_name")})

        reply_parts.append("\nNeed me to reply, mark anything, or dig deeper? Just give the word!")
        reply_text = "\n".join(reply_parts)

        return {
            "reply": reply_text,
            "actions_taken": [],
            "citations": citations,
            "speech_text": f"Here is what I found in your inbox, Santhosh."
        }


# Global Singleton Instance
companion = CompanionAgent()
