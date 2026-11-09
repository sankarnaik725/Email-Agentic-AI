"""Two-Way Remote Mobile Telegram Bridge for Antigravity Mail AI.
Enables full remote management of your inbox via Telegram:
- /briefing: Get daily executive briefing
- /urgent: List high/critical priority emails
- /ask <query>: Ask Nova questions about your inbox
- /reply <email_id> <text>: Draft or send replies
- /status: Watcher and IMAP status
"""

import os
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional, List
from datetime import datetime

import config
import storage
from companion_agent import companion

logger = logging.getLogger("mail_agent.telegram_bridge")

TELEGRAM_API_BASE = "https://api.telegram.org/bot"


def send_message(token: str, chat_id: str, text: str, parse_mode: str = "HTML") -> bool:
    """Send text message to Telegram chat."""
    if not token or not chat_id:
        return False
    try:
        url = f"{TELEGRAM_API_BASE}{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {e}")
        return False


def execute_remote_command(command_text: str) -> str:
    """Process incoming command from Telegram and return response string."""
    text = command_text.strip()
    parts = text.split(maxsplit=1)
    cmd = parts[0].lower() if parts else ""
    args = parts[1] if len(parts) > 1 else ""

    emails = storage.load_cached_emails()

    if cmd in ["/start", "/help"]:
        return (
            "🤖 <b>Antigravity Mail AI — Remote Mobile Hub</b>\n\n"
            "Control your inbox anywhere from your phone:\n"
            "• <code>/briefing</code> — Executive briefing of your inbox\n"
            "• <code>/urgent</code> — View all urgent / high priority emails\n"
            "• <code>/ask &lt;query&gt;</code> — Ask Nova anything about your mail\n"
            "• <code>/status</code> — Live background watcher status\n"
            "• <code>/declutter</code> — Summary of newsletter clutter\n"
            "• <code>/help</code> — Show this command menu"
        )

    elif cmd == "/briefing":
        urgent = [e for e in emails if e.get("ai_analysis", {}).get("priority") in ["Critical", "High"]]
        unread = [e for e in emails if e.get("is_unread", False)]
        lines = [
            f"📋 <b>Executive Briefing ({datetime.now().strftime('%d %b %I:%M %p')})</b>",
            f"📊 <b>Total Mails:</b> {len(emails)} | <b>Unread:</b> {len(unread)} | <b>Urgent:</b> {len(urgent)}",
            ""
        ]
        if urgent:
            lines.append("🚨 <b>Top Urgent Items:</b>")
            for u in urgent[:3]:
                sender = u.get("sender_name") or u.get("sender_email", "Unknown")
                lines.append(f"• <b>{u.get('subject', 'No Subject')}</b> (from {sender})")
                tldr = u.get("ai_analysis", {}).get("summary_tldr", "")
                if tldr:
                    lines.append(f"  <i>{tldr}</i>")
        else:
            lines.append("✨ <i>No pending high or critical priority alerts.</i>")

        return "\n".join(lines)

    elif cmd == "/urgent":
        urgent = [e for e in emails if e.get("ai_analysis", {}).get("priority") in ["Critical", "High"]]
        if not urgent:
            return "✨ <b>Zero Urgent Emails:</b> All clear right now, bro!"
        lines = [f"🚨 <b>{len(urgent)} Urgent Email(s) Requiring Attention:</b>\n"]
        for u in urgent:
            lines.append(f"• <b>{u.get('subject')}</b>")
            lines.append(f"  ID: <code>{u.get('id')}</code> | From: {u.get('sender_name') or u.get('sender_email')}")
            lines.append(f"  Summary: {u.get('ai_analysis', {}).get('summary_tldr', 'N/A')}\n")
        return "\n".join(lines)

    elif cmd == "/status":
        cfg = config.load_config()
        mb = cfg.get("mailbox_type", "demo").upper()
        user = cfg.get("imap_user", "Demo User")
        return (
            f"⚡ <b>System Telemetry & Status:</b>\n\n"
            f"• <b>Mailbox Type:</b> {mb}\n"
            f"• <b>Active User:</b> {user}\n"
            f"• <b>Total Synced:</b> {len(emails)} messages\n"
            f"• <b>Mobile Push:</b> {'Enabled' if cfg.get('enable_mobile_alerts') else 'Disabled'}\n"
            f"• <b>Time:</b> {datetime.now().strftime('%I:%M %p, %d %b %Y')}"
        )

    elif cmd == "/declutter":
        from declutter_engine import analyze_inbox_declutter
        res = analyze_inbox_declutter()
        return (
            f"🧹 <b>Newsletter & Clutter Report:</b>\n\n"
            f"• Total Automated Senders: <b>{res.get('total_senders')}</b>\n"
            f"• Clutter Emails: <b>{res.get('total_clutter_emails')}</b>\n"
            f"• Time Saved by Sweeping: <b>{res.get('estimated_time_saved_minutes')} mins</b>\n\n"
            f"Access your Web Dashboard at <code>http://127.0.0.1:8000</code> to 1-click sweep!"
        )

    elif cmd == "/ask":
        if not args:
            return "⚠️ Please provide a question, e.g. <code>/ask Any emails from professor regarding project?</code>"
        res = companion.chat(args, emails)
        clean_reply = res.get("reply", "No answer found.").replace("<", "&lt;").replace(">", "&gt;")
        return f"🤖 <b>Nova AI Response:</b>\n\n{clean_reply}"

    else:
        # Default fallback: treat raw message as question to Nova
        res = companion.chat(text, emails)
        clean_reply = res.get("reply", "I didn't quite get that.").replace("<", "&lt;").replace(">", "&gt;")
        return f"🤖 <b>Nova AI:</b>\n\n{clean_reply}"


last_update_id = 0


def poll_updates_once(token: str, chat_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Poll updates once from Telegram Long Polling API."""
    global last_update_id
    if not token:
        return []
    try:
        url = f"{TELEGRAM_API_BASE}{token}/getUpdates?offset={last_update_id + 1}&timeout=2"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if not data.get("ok"):
                return []
            updates = data.get("result", [])
            responses = []
            for u in updates:
                uid = u.get("update_id", 0)
                if uid > last_update_id:
                    last_update_id = uid
                msg = u.get("message") or u.get("channel_post")
                if msg and "text" in msg:
                    from_chat = str(msg.get("chat", {}).get("id", ""))
                    # If chat_id restriction is configured, honor it
                    if chat_id and from_chat != str(chat_id):
                        continue
                    text = msg.get("text", "")
                    reply_text = execute_remote_command(text)
                    send_message(token, from_chat, reply_text)
                    responses.append({"chat_id": from_chat, "command": text, "response": reply_text})
            return responses
    except Exception as e:
        logger.debug(f"Telegram polling check: {e}")
        return []
