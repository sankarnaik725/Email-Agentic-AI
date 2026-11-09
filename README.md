<<<<<<< HEAD
# ✦ Antigravity Mail AI — Autonomous Email Triage, Summarization & Action Agent

An intelligent, autonomous AI Mail Agent designed to access your mailbox, read incoming emails, generate executive-level TL;DR summaries, categorize messages by semantic intent and urgency, extract actionable to-do items, detect invoices and financial figures, and produce context-aware smart reply drafts.

---

## 🌟 Key Features

### 1. 📬 Universal Mail Connector (IMAP + SSL & Demo Mailbox)
- **Real IMAP Connection**: Compatible with **Gmail**, **Outlook / Office 365**, **Yahoo**, **iCloud**, and custom private IMAP servers.
- **Secure SSL/TLS**: Safe connection handling with credential masking.
- **Instant Demo Mode**: Includes 10 realistic, diverse sample emails (incidents, invoices, SOC 2 compliance, meetings, personal notes, newsletters, promotions, and phishing attacks) so you can test and explore immediately without entering personal credentials.

### 2. 🧠 Hybrid AI Intelligence Engine
- **Cloud Tier**: Powered by **Google Gemini** (`gemini-2.5-flash` via `google-genai` SDK) for deep semantic comprehension, multi-sentence executive summaries, and intelligent drafts.
- **Local Fallback Tier**: High-precision built-in **NLP Heuristic Rule Engine** that guarantees 100% functionality out of the box even when offline or before setting up an API key.

### 3. 🏷️ Multi-Tier Categorization & Priority Scoring
- **Categories**:
  - 🚨 `Urgent / Incident`
  - ⚡ `Action Required`
  - 💼 `Work & Projects`
  - 💳 `Finance & Billing`
  - 📅 `Meeting / Scheduling`
  - ☕ `Personal`
  - 📰 `Newsletters & Tech`
  - 🏷️ `Promotions / Marketing`
  - 🛡️ `Spam / Suspicious`
- **Priority Scoring**: Real-time score from **1 to 100** (`Critical`, `High`, `Medium`, `Low`).

### 4. ⚡ Action Items Extraction & Interactive Checklists
- Automatically identifies deliverables, required reviews, and deadlines.
- Features interactive checkmarks that persist completion state.

### 5. 💰 Financial & Entity Intelligence
- Automatically detects monetary amounts (e.g., `$1,450.00`), invoice renewal dates, meeting times, and sender organizations.

### 6. ✍️ Context-Aware Smart Replies & Tone Adjuster
- Generates 3 ready-to-send draft options per email.
- Tone customizer: *Professional*, *Brief*, *Friendly*, or *Firm*.
- One-click copy to clipboard or simulated dispatch.

### 7. 🛡️ Phishing & Threat Shield
- Flags credential harvesting attempts, suspicious urgency language, and malicious external links with a prominent warning banner.

### 8. 📱 Direct Cellular SMS Alert Gateway (+91 Direct Route)
- Routes **Critical** and **High Urgency** emails directly as real-time SMS to mobile phones.
- Built-in support for **Fast2SMS** (direct Indian carrier route), **Twilio SMS**, and Custom Gateways.
- Atomic outbox queue with delivery receipts and character-optimized payload formatting.

### 9. 🎯 Opportunity & Academic Deadline Radar
- Scans college and enterprise communications for internships, hackathons, academic circulars, course deadlines, and job notices.
- One-click direct synchronization to Google Calendar.

### 10. 🤝 Bilateral Commitment Ledger
- Analyzes implicit commitments: promises made by the user vs. promises made to the user.
- Automatic polite follow-up nudge draft generation.

### 11. 🎙️ Dual-Host Morning Audio Show (AI Podcast)
- Dynamic 2-minute morning briefing voiced by two distinct AI hosts (*Alex* & *Nova*).
- Live pitch-shifted speech synthesis synchronized with real-time teleprompter transcript.

### 12. 🔬 Recipient Reaction Simulator
- Predicts friction score (1-100) and recipient sentiment before you hit send.
- Provides 1-click persuasive rewrites tailored to improve response probability.

### 13. 🎓 Multi-Account Isolation & IITM Smail Gateway
- 1-click switching between Personal Gmail, IIT Madras Smail (`am26m001@smail.iitm.ac.in`), and Demo mailboxes with strictly isolated local caches.
- Integrated Google Apps Script bridge bypassing Google App Password blocks on enterprise student domains.
---

## 🚀 Quick Start Guide

### 1. Start the Interactive Web Dashboard
Run the following in PowerShell / Terminal:

```bash
.venv\Scripts\python.exe agent.py
```
This starts the local web server and opens your browser at:
👉 **`http://127.0.0.1:8000`**

### 2. Run in Terminal CLI Mode
To run a fast, headless terminal triage without opening a browser:

```bash
.venv\Scripts\python.exe agent.py --cli
```

---

## ⚙️ Configuration (Optional)

You can configure settings either through the **Settings modal in the Web UI** or via `.env`:

### Option A: Via the Web Dashboard
Click the **Settings** icon (top right) in the web app:
- Enter your **Gemini API Key** (Get free from [Google AI Studio](https://aistudio.google.com/)).
- Switch between **Demo Mailbox** and **Live IMAP**.
- Test your IMAP connection with instant diagnostics.

### Option B: Via `.env` File
Create a `.env` file based on `.env.example`:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# IMAP Configuration (for Gmail, Outlook, etc.)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your_email@gmail.com
IMAP_PASSWORD=your_16_char_app_password

# Set to false to connect to real mailbox
DEMO_MODE=true
FETCH_COUNT=15
```

> **Note for Gmail Users**:
> Use a 16-character **App Password**, NOT your personal password:
> 1. Go to your **Google Account** > **Security**.
> 2. Enable **2-Step Verification** if not already on.
> 3. Search for **App passwords** > Create one labeled "Mail Agent".
> 4. Use the 16-letter code as `IMAP_PASSWORD`.

---

## 📁 Project Architecture

```
c:\Users\SANTHOSH\Desktop\Projects\mail\
├── agent.py               # Main entry point (Web server & CLI triage)
├── server.py              # FastAPI REST backend
├── ai_agent.py            # AI Engine (Gemini API + NLP Fallback)
├── mail_connector.py      # IMAP SSL client & Demo mailbox
├── storage.py             # Local JSON cache & persistence
├── config.py              # Configuration & credential manager
├── requirements.txt       # Frozen Python dependencies
├── .env.example           # Environment template
└── static/                # Luxury Web Dashboard
    ├── index.html         # Modern 3-column UI structure
    ├── style.css          # Dark obsidian luxury design system
    └── app.js             # Client interactivity & state
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↓` or `j` | Next email in list |
| `↑` or `k` | Previous email in list |
| `e` | Open Executive Daily Briefing |
| `/` | Focus search bar |
=======
# Email-Agentic-AI
>>>>>>> 2cd2b920b0b182aaed822a7a7f6f6a8650cfe051
