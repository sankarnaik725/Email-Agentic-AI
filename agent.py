"""AI Mail Agent: Main Entrypoint
Run `python agent.py` to launch the Interactive Web Dashboard.
Run `python agent.py --cli` to run the agent directly in terminal mode.
"""

import sys
import argparse
import webbrowser
import uvicorn

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def start_server(host: str = "127.0.0.1", port: int = 8000, open_browser: bool = True):
    """Launch FastAPI server with Uvicorn."""
    print("=" * 65)
    print("           ✨ AI MAIL AGENT - INTELLIGENT TRIAGE & DIGEST ✨")
    print("=" * 65)
    print(f"-> Web Dashboard URL: http://{host}:{port}")
    print(f"-> Documentation:     http://{host}:{port}/docs")
    print("=" * 65)

    if open_browser:
        import threading
        import time

        def _open():
            time.sleep(1.5)
            try:
                webbrowser.open(f"http://{host}:{port}")
            except Exception:
                pass

        threading.Thread(target=_open, daemon=True).start()

    uvicorn.run("server:app", host=host, port=port, reload=False, log_level="info")


def run_cli_mode():
    """Run CLI interactive agent in terminal."""
    import config
    import storage
    from mail_connector import MailConnector, get_demo_emails
    from ai_agent import AIAgent

    cfg = config.load_config()
    agent = AIAgent(api_key=cfg.get("gemini_api_key"))

    print("\n" + "=" * 60)
    print("   🤖 AI MAIL AGENT - CLI TRIAGE & EXECUTIVE BRIEFING")
    print("=" * 60)

    # Sync
    print(f"\n[+] Active Engine: {'Gemini AI (Cloud)' if agent.client else 'NLP Heuristics (Local Engine)'}")
    print(f"[+] Source: {'Simulated Demo Mailbox' if cfg.get('demo_mode') else 'Real IMAP Mailbox'}")
    print("[+] Syncing emails and running AI triage pipeline...")

    emails = []
    if not cfg.get("demo_mode") and cfg.get("imap_user") and cfg.get("imap_password"):
        try:
            connector = MailConnector(
                host=cfg.get("imap_host", "imap.gmail.com"),
                port=cfg.get("imap_port", 993),
                user=cfg.get("imap_user"),
                password=cfg.get("imap_password")
            )
            emails = connector.fetch_emails(limit=cfg.get("fetch_count", 10))
        except Exception as e:
            print(f"[!] IMAP fetch error: {e}. Falling back to demo emails.")
            emails = get_demo_emails()
    else:
        emails = get_demo_emails()

    for em in emails:
        em["ai_analysis"] = agent.analyze_email(em)

    storage.save_cached_emails(emails)
    print(f"[✓] Successfully analyzed {len(emails)} emails.\n")

    # Generate Briefing
    briefing = agent.generate_daily_briefing(emails)
    print("─" * 60)
    print(f"📋 EXECUTIVE DAILY BRIEFING ({briefing['generated_at']})")
    print("─" * 60)
    print(f"Summary: {briefing['executive_summary']}\n")

    print(f"🚨 Urgent Items ({briefing['urgent_count']}):")
    for item in briefing["urgent_items"]:
        print(f"  • [{item['priority'].upper()}] {item['subject']} (From: {item['sender']})")
        print(f"    TL;DR: {item['summary']}")

    print("\n" + "─" * 60)
    print("📥 CATEGORIZED INBOX")
    print("─" * 60)
    for i, em in enumerate(emails, 1):
        ai = em.get("ai_analysis", {})
        prio = ai.get("priority", "Medium")
        cat = ai.get("category", "General")
        print(f"\n[{i}] {em['subject']}")
        print(f"    From: {em['sender_name']} <{em['sender_email']}> | Date: {em.get('date_display', '')}")
        print(f"    Category: {cat} | Priority: {prio} (Score: {ai.get('priority_score', 50)}/100)")
        print(f"    AI Summary: {ai.get('summary_tldr', 'N/A')}")

        actions = ai.get("action_items", [])
        if actions:
            print("    Action Items:")
            for act in actions:
                print(f"      - [ ] {act['task']} (Deadline: {act.get('deadline', 'None')})")

        smart_replies = ai.get("smart_replies", [])
        if smart_replies:
            print(f"    Smart Reply Suggestion: \"{smart_replies[0]['label']}\"")


def main():
    parser = argparse.ArgumentParser(description="AI Mail Agent")
    parser.add_argument("--cli", action="store_true", help="Run in terminal CLI mode instead of web server")
    parser.add_argument("--port", type=int, default=8000, help="Web server port (default: 8000)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Web server host (default: 127.0.0.1)")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open browser on startup")
    args = parser.parse_args()

    if args.cli:
        run_cli_mode()
    else:
        start_server(host=args.host, port=args.port, open_browser=not args.no_browser)


if __name__ == "__main__":
    main()
