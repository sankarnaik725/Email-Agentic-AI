"""Configuration manager for AI Mail Agent."""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CONFIG_FILE = DATA_DIR / "config.json"
ENV_FILE = BASE_DIR / ".env"

DATA_DIR.mkdir(parents=True, exist_ok=True)
load_dotenv(ENV_FILE)

DEFAULT_CONFIG = {
    "mailbox_type": "demo",  # "demo", "smail", or "imap"
    "smail_script_url": os.getenv("SMAIL_SCRIPT_URL", ""),
    "smail_token": os.getenv("SMAIL_TOKEN", "iitm_smail_secret_2026"),
    "imap_host": os.getenv("IMAP_HOST", "imap.gmail.com"),
    "imap_port": int(os.getenv("IMAP_PORT", "993")),
    "imap_user": os.getenv("IMAP_USER", ""),
    "imap_password": os.getenv("IMAP_PASSWORD", ""),
    "imap_use_ssl": True,
    "gemini_api_key": os.getenv("GEMINI_API_KEY", ""),
    "gemini_model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    "demo_mode": os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes"),
    "fetch_count": int(os.getenv("FETCH_COUNT", "15")),
    "auto_triage": True,
    "enable_mobile_alerts": os.getenv("ENABLE_MOBILE_ALERTS", "true").lower() in ("true", "1", "yes"),
    "telegram_bot_token": os.getenv("TELEGRAM_BOT_TOKEN", ""),
    "telegram_chat_id": os.getenv("TELEGRAM_CHAT_ID", ""),
    "whatsapp_webhook_url": os.getenv("WHATSAPP_WEBHOOK_URL", ""),
    "notify_min_priority": os.getenv("NOTIFY_MIN_PRIORITY", "High"),  # "Critical", "High", "Medium", "All"
    "notify_on_sync": True,
    # SMS Alert Gateway Configuration
    "sms_alerts_enabled": os.getenv("SMS_ALERTS_ENABLED", "true").lower() in ("true", "1", "yes"),
    "sms_recipient_phone": os.getenv("SMS_RECIPIENT_PHONE", "+919392709150"),
    "sms_provider": os.getenv("SMS_PROVIDER", "fast2sms"),  # "fast2sms", "twilio", "custom_gateway", "outbox"
    "sms_api_key": os.getenv("SMS_API_KEY", ""),
    "sms_twilio_account_sid": os.getenv("SMS_TWILIO_ACCOUNT_SID", ""),
    "sms_twilio_auth_token": os.getenv("SMS_TWILIO_AUTH_TOKEN", ""),
    "sms_twilio_from": os.getenv("SMS_TWILIO_FROM", ""),
    "sms_custom_url": os.getenv("SMS_CUSTOM_URL", "")
}


def load_config() -> dict:
    """Load config from json, falling back to environment and defaults."""
    config = dict(DEFAULT_CONFIG)

    # Environment defaults
    if os.getenv("IMAP_USER"):
        config["imap_user"] = os.getenv("IMAP_USER")
    if os.getenv("IMAP_PASSWORD"):
        config["imap_password"] = os.getenv("IMAP_PASSWORD")
    if os.getenv("IMAP_HOST"):
        config["imap_host"] = os.getenv("IMAP_HOST")
    if os.getenv("SMAIL_SCRIPT_URL"):
        config["smail_script_url"] = os.getenv("SMAIL_SCRIPT_URL")
    if os.getenv("TELEGRAM_BOT_TOKEN"):
        config["telegram_bot_token"] = os.getenv("TELEGRAM_BOT_TOKEN")
    if os.getenv("TELEGRAM_CHAT_ID"):
        config["telegram_chat_id"] = os.getenv("TELEGRAM_CHAT_ID")
    if os.getenv("WHATSAPP_WEBHOOK_URL"):
        config["whatsapp_webhook_url"] = os.getenv("WHATSAPP_WEBHOOK_URL")

    # Saved config file takes precedence (active user runtime selection)
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                config.update(saved)
        except Exception as e:
            print(f"Error loading {CONFIG_FILE}: {e}")

    # Gemini API Key can come from environment or config
    if os.getenv("GEMINI_API_KEY") and not config.get("gemini_api_key"):
        config["gemini_api_key"] = os.getenv("GEMINI_API_KEY")

    # Determine mailbox_type and demo_mode properly
    selected_type = config.get("mailbox_type", "demo")
    if selected_type == "imap":
        config["demo_mode"] = False if (config.get("imap_user") and config.get("imap_password")) else True
    elif selected_type == "smail":
        config["demo_mode"] = False
        config["mailbox_type"] = "smail"
    else:
        config["demo_mode"] = True
        config["mailbox_type"] = "demo"

    return config


def save_config(new_config: dict) -> dict:
    """Save config updates to data/config.json."""
    current = load_config()
    current.update(new_config)

    # Don't save empty/masked passwords or tokens over existing ones unless explicitly given
    if "imap_password" in new_config and (not new_config["imap_password"] or "••" in new_config["imap_password"]):
        if current.get("imap_password"):
            new_config["imap_password"] = current["imap_password"]

    if "telegram_bot_token" in new_config and ("••" in str(new_config["telegram_bot_token"])):
        if current.get("telegram_bot_token"):
            new_config["telegram_bot_token"] = current["telegram_bot_token"]

    if "gemini_api_key" in new_config and ("••" in str(new_config["gemini_api_key"])):
        if current.get("gemini_api_key"):
            new_config["gemini_api_key"] = current["gemini_api_key"]

    if "sms_api_key" in new_config and ("••" in str(new_config["sms_api_key"])):
        if current.get("sms_api_key"):
            new_config["sms_api_key"] = current["sms_api_key"]

    if "sms_twilio_auth_token" in new_config and ("••" in str(new_config["sms_twilio_auth_token"])):
        if current.get("sms_twilio_auth_token"):
            new_config["sms_twilio_auth_token"] = current["sms_twilio_auth_token"]

    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(current, f, indent=2)

    # If Gemini API key is provided, also update env
    if new_config.get("gemini_api_key") and "••" not in new_config["gemini_api_key"]:
        os.environ["GEMINI_API_KEY"] = new_config["gemini_api_key"]

    return current


def get_masked_config() -> dict:
    """Return config with sensitive passwords/keys masked for client UI."""
    cfg = load_config()
    masked = dict(cfg)
    if masked.get("imap_password"):
        masked["imap_password"] = "••••••••••••••••"
        masked["has_imap_password"] = True
    else:
        masked["has_imap_password"] = False

    if masked.get("gemini_api_key"):
        key = masked["gemini_api_key"]
        if len(key) > 8:
            masked["gemini_api_key"] = key[:4] + "••••" + key[-4:]
        else:
            masked["gemini_api_key"] = "••••••••"
        masked["has_gemini_key"] = True
    else:
        masked["has_gemini_key"] = False

    if masked.get("telegram_bot_token"):
        tok = masked["telegram_bot_token"]
        if len(tok) > 10:
            masked["telegram_bot_token"] = tok[:4] + "••••••••" + tok[-4:]
        else:
            masked["telegram_bot_token"] = "••••••••"
        masked["has_telegram_bot_token"] = True
    else:
        masked["has_telegram_bot_token"] = False

    if masked.get("sms_api_key"):
        sk = str(masked["sms_api_key"])
        if len(sk) > 8:
            masked["sms_api_key"] = sk[:3] + "••••••••" + sk[-3:]
        else:
            masked["sms_api_key"] = "••••••••"
        masked["has_sms_api_key"] = True
    else:
        masked["has_sms_api_key"] = False

    return masked
