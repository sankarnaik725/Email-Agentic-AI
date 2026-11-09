"""Multi-Account Manager for AI Mail Agent.
Enables seamless switching between multiple Gmail / IMAP mailboxes,
college accounts, and simulation profiles with per-account caching.
"""

import os
import json
import imaplib
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import config

DATA_DIR = Path(__file__).resolve().parent / "data"
ACCOUNTS_FILE = DATA_DIR / "accounts.json"
CACHE_FILE = DATA_DIR / "inbox_cache.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_default_accounts() -> Dict[str, Any]:
    """Generate default accounts based on current config."""
    cfg = config.load_config()
    current_imap_user = cfg.get("imap_user") or "dhanavathsanthosh1916@gmail.com"
    current_imap_pw = cfg.get("imap_password") or ""
    current_type = cfg.get("mailbox_type", "imap")
    is_demo = cfg.get("demo_mode", False)

    active_id = "demo" if is_demo else ("iitm_smail" if current_type == "smail" else "personal_gmail")

    return {
        "active_account_id": active_id,
        "accounts": [
            {
                "id": "personal_gmail",
                "name": "Santhosh Dhanavath (Personal)",
                "email": current_imap_user,
                "type": "Gmail IMAP/SMTP",
                "badge": "Gmail IMAP",
                "avatar": "SD",
                "color": "#ea4335",
                "imap_host": cfg.get("imap_host", "imap.gmail.com"),
                "imap_port": cfg.get("imap_port", 993),
                "imap_user": current_imap_user,
                "imap_password": current_imap_pw,
                "is_default": True,
                "removable": False
            },
            {
                "id": "iitm_smail",
                "name": "IIT Madras Smail",
                "email": "am26m001@smail.iitm.ac.in",
                "type": "Google Apps Script Gateway",
                "badge": "IITM",
                "avatar": "🎓",
                "color": "#f59e0b",
                "is_default": False,
                "removable": False
            },
            {
                "id": "demo",
                "name": "Simulated Executive Mailbox",
                "email": "demo-executive@antigravity.ai",
                "type": "Synthetic Stream",
                "badge": "Simulation",
                "avatar": "🚀",
                "color": "#6366f1",
                "is_default": False,
                "removable": False
            }
        ]
    }


def load_accounts_data() -> Dict[str, Any]:
    """Load accounts registry from accounts.json or generate defaults."""
    if not ACCOUNTS_FILE.exists():
        data = get_default_accounts()
        save_accounts_data(data)
        return data

    try:
        with open(ACCOUNTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict) or "accounts" not in data:
                data = get_default_accounts()
                save_accounts_data(data)
            return data
    except Exception as e:
        print(f"Error loading {ACCOUNTS_FILE}: {e}")
        data = get_default_accounts()
        save_accounts_data(data)
        return data


def save_accounts_data(data: Dict[str, Any]) -> None:
    """Save accounts registry atomically."""
    temp_file = ACCOUNTS_FILE.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    temp_file.replace(ACCOUNTS_FILE)


def list_accounts() -> Dict[str, Any]:
    """List all accounts with sensitive credentials masked for API output."""
    data = load_accounts_data()
    active_id = data.get("active_account_id", "personal_gmail")
    accounts_out = []

    # Get cached email count for active account
    active_count = 0
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                c_emails = json.load(f)
                active_count = len(c_emails) if isinstance(c_emails, list) else 0
        except Exception:
            pass

    for acc in data.get("accounts", []):
        is_active = (acc["id"] == active_id)
        
        # Check per-account cache count if not active
        acc_count = active_count if is_active else 0
        if not is_active:
            acc_cache = DATA_DIR / f"inbox_cache_{acc['id']}.json"
            if acc_cache.exists():
                try:
                    with open(acc_cache, "r", encoding="utf-8") as f:
                        c_list = json.load(f)
                        acc_count = len(c_list) if isinstance(c_list, list) else 0
                except Exception:
                    pass

        has_password = bool(acc.get("imap_password"))
        status = "Online" if is_active else ("Connected" if has_password or acc["id"] == "demo" else "Needs Setup")

        accounts_out.append({
            "id": acc["id"],
            "name": acc.get("name", "Account"),
            "email": acc.get("email", ""),
            "type": acc.get("type", "Gmail IMAP/SMTP"),
            "badge": acc.get("badge", "Gmail"),
            "avatar": acc.get("avatar", "G"),
            "color": acc.get("color", "#ea4335"),
            "is_active": is_active,
            "status": status,
            "removable": acc.get("removable", True),
            "email_count": acc_count,
            "has_password": has_password
        })

    return {
        "current_account_id": active_id,
        "active_account_id": active_id,
        "accounts": accounts_out
    }


def get_active_account() -> Optional[Dict[str, Any]]:
    """Retrieve full active account record including credentials."""
    data = load_accounts_data()
    active_id = data.get("active_account_id", "personal_gmail")
    for acc in data.get("accounts", []):
        if acc["id"] == active_id:
            return acc
    return data.get("accounts", [None])[0]


def test_gmail_credentials(email: str, app_password: str, host: str = "imap.gmail.com", port: int = 993) -> Tuple[bool, str]:
    """Verify Gmail IMAP credentials against Google IMAP server."""
    clean_pw = app_password.replace(" ", "").strip()
    clean_user = email.strip()

    if not clean_user or not clean_pw:
        return False, "Email address and 16-character Google App Password are required."

    try:
        client = imaplib.IMAP4_SSL(host, port, timeout=12)
        client.login(clean_user, clean_pw)
        status, folder_data = client.select("INBOX", readonly=True)
        count_str = folder_data[0].decode() if folder_data and folder_data[0] else "0"
        client.logout()
        return True, f"Successfully authenticated with Gmail! (INBOX accessible: {count_str} messages)"
    except imaplib.IMAP4.error as e:
        err = str(e)
        if "AUTHENTICATIONFAILED" in err or "Username and Password not accepted" in err:
            return False, "Google authentication failed. Please ensure you generated a 16-character App Password (not your normal Google account password) with 2-Step Verification turned on."
        return False, f"IMAP authentication error: {err}"
    except Exception as e:
        return False, f"Could not connect to {host}:{port}: {str(e)}"


def switch_account(account_id: str) -> Dict[str, Any]:
    """Switch active account, persisting current cache and restoring the target account's cache."""
    data = load_accounts_data()
    old_active_id = data.get("active_account_id")
    target_acc = None

    for acc in data.get("accounts", []):
        if acc["id"] == account_id:
            target_acc = acc
            break

    if not target_acc:
        raise ValueError(f"Account with ID '{account_id}' does not exist.")

    # 1. Stash current active inbox cache to per-account cache file
    if old_active_id and CACHE_FILE.exists():
        try:
            old_cache_path = DATA_DIR / f"inbox_cache_{old_active_id}.json"
            with open(CACHE_FILE, "r", encoding="utf-8") as f_in:
                cached_data = json.load(f_in)
            with open(old_cache_path, "w", encoding="utf-8") as f_out:
                json.dump(cached_data, f_out, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Warning: Failed to backup cache for {old_active_id}: {e}")

    # 2. Update active account in accounts.json
    data["active_account_id"] = account_id
    save_accounts_data(data)

    # 3. Update config.json and runtime settings with strict account isolation
    cfg_updates: Dict[str, Any] = {}
    if target_acc["id"] == "demo":
        cfg_updates = {
            "demo_mode": True,
            "mailbox_type": "demo",
            "imap_user": "",
            "imap_password": ""
        }
    elif target_acc["id"] == "iitm_smail":
        cfg_updates = {
            "demo_mode": False,
            "mailbox_type": "smail",
            "imap_user": "",
            "imap_password": "",
            "smail_script_url": target_acc.get("smail_script_url", "")
        }
    else:
        # Standard Gmail or IMAP account
        cfg_updates = {
            "demo_mode": False,
            "mailbox_type": "imap",
            "imap_user": target_acc.get("imap_user") or target_acc.get("email"),
            "imap_password": target_acc.get("imap_password", ""),
            "imap_host": target_acc.get("imap_host", "imap.gmail.com"),
            "imap_port": target_acc.get("imap_port", 993),
            "imap_use_ssl": True
        }

    config.save_config(cfg_updates)

    # 4. Restore the target account's cached emails if present
    target_cache_path = DATA_DIR / f"inbox_cache_{account_id}.json"
    restored_count = 0
    if target_cache_path.exists():
        try:
            with open(target_cache_path, "r", encoding="utf-8") as f_in:
                target_cache_data = json.load(f_in)
            with open(CACHE_FILE, "w", encoding="utf-8") as f_out:
                json.dump(target_cache_data, f_out, indent=2, ensure_ascii=False)
            restored_count = len(target_cache_data) if isinstance(target_cache_data, list) else 0
        except Exception as e:
            print(f"Warning: Failed to restore cache for {account_id}: {e}")
    else:
        # Target account has no cached emails yet: strictly clear CACHE_FILE to []
        # so previous account emails NEVER bleed into this account!
        empty_list = []
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f_out:
                json.dump(empty_list, f_out)
            with open(target_cache_path, "w", encoding="utf-8") as f_out:
                json.dump(empty_list, f_out)
        except Exception as e:
            print(f"Error initializing empty cache for {account_id}: {e}")
        restored_count = 0

    return {
        "success": True,
        "account_id": account_id,
        "name": target_acc.get("name"),
        "email": target_acc.get("email"),
        "restored_cached_emails": restored_count
    }


def add_gmail_account(
    name: str,
    email: str,
    app_password: str,
    imap_host: str = "imap.gmail.com",
    imap_port: int = 993,
    switch_now: bool = True
) -> Dict[str, Any]:
    """Validate and add a new Gmail account to the accounts registry."""
    clean_email = email.strip().lower()
    clean_name = name.strip() or clean_email.split("@")[0].capitalize()
    clean_pw = app_password.replace(" ", "").strip()

    if not clean_email or "@" not in clean_email:
        raise ValueError("A valid email address is required.")
    if not clean_pw:
        raise ValueError("A 16-character Google App Password is required.")

    # Test IMAP credentials first
    success, msg = test_gmail_credentials(clean_email, clean_pw, host=imap_host, port=imap_port)
    if not success:
        raise ValueError(msg)

    data = load_accounts_data()

    # Check if this email is already registered
    existing_acc = None
    for acc in data.get("accounts", []):
        if acc.get("email", "").lower() == clean_email:
            existing_acc = acc
            break

    # Generate initials for avatar
    parts = clean_name.split()
    if len(parts) >= 2:
        avatar = (parts[0][0] + parts[1][0]).upper()
    elif len(clean_name) >= 2:
        avatar = clean_name[:2].upper()
    else:
        avatar = "G"

    account_id = existing_acc["id"] if existing_acc else f"gmail_{re.sub(r'[^a-zA-Z0-9]', '_', clean_email.split('@')[0])}"

    new_acc = {
        "id": account_id,
        "name": clean_name,
        "email": clean_email,
        "type": "Gmail IMAP/SMTP",
        "badge": "Gmail",
        "avatar": avatar,
        "color": "#ea4335" if "gmail" in clean_email else "#3b82f6",
        "imap_host": imap_host,
        "imap_port": imap_port,
        "imap_user": clean_email,
        "imap_password": clean_pw,
        "is_default": False,
        "removable": True
    }

    if existing_acc:
        # Update existing
        existing_acc.update(new_acc)
    else:
        data.setdefault("accounts", []).append(new_acc)

    save_accounts_data(data)

    if switch_now:
        switch_account(account_id)

    return {
        "success": True,
        "account": {
            "id": account_id,
            "name": clean_name,
            "email": clean_email,
            "badge": "Gmail",
            "avatar": avatar,
            "is_active": switch_now
        },
        "message": f"Successfully connected '{clean_name}' ({clean_email})!"
    }


def remove_account(account_id: str) -> Dict[str, Any]:
    """Remove a user-added account."""
    data = load_accounts_data()
    acc_list = data.get("accounts", [])
    target = None

    for acc in acc_list:
        if acc["id"] == account_id:
            target = acc
            break

    if not target:
        raise ValueError("Account not found.")

    if not target.get("removable", True):
        raise ValueError("Cannot remove default system mailbox.")

    # Remove target
    data["accounts"] = [a for a in acc_list if a["id"] != account_id]

    # If it was the active account, switch to personal_gmail or first available
    was_active = (data.get("active_account_id") == account_id)
    if was_active:
        fallback_id = data["accounts"][0]["id"] if data["accounts"] else "personal_gmail"
        data["active_account_id"] = fallback_id
        save_accounts_data(data)
        switch_account(fallback_id)
    else:
        save_accounts_data(data)

    # Clean up cache file if exists
    acc_cache = DATA_DIR / f"inbox_cache_{account_id}.json"
    if acc_cache.exists():
        try:
            acc_cache.unlink()
        except Exception:
            pass

    return {
        "success": True,
        "removed_account_id": account_id,
        "active_account_id": data.get("active_account_id")
    }
