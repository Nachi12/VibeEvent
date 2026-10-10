# JobShield — Forensic Recruitment Intelligence & Job Scam Detection

> **Hackathon MVP**: Real-time forensic screening of job postings to safeguard students and freshers from advance-fee recruitment fraud, lookalike placement schemes, unverified Telegram handlers, and deceptive compensation traps.

---

## 🎨 Color Palette & Design System
- **Paper**: `#F6F4F1` — Warm newsprint broadsheet canvas
- **Stone**: `#E4DED2` — Archival folio bars, calibration tracks, and metadata tags
- **Coral**: `#F95C4B` — High-visibility call to action (`EXAMINE EVIDENCE →`), fraud alerts, and risk highlights
- **Black**: `#000000` — High-contrast typography, double hairlines, and tactile offset shadows (`shadow-[4px_4px_0px_#000]`)

---

## 🛡️ Dual-Engine Architecture (Honest & Transparent)

1. **Deterministic Forensic Rule Engine (Zero Hallucination)**:
   - 6 transparent signature checks:
     - **Rule 01: Upfront Fee & Deposit Extortion** (supports `$`, `£`, `€`, and Indian context `₹`, `Rs`, `INR`, `UPI`, `GPay`, `PhonePe`, `Paytm`, `training fee`, `offer letter fee`).
     - **Rule 02: Unverified Contact Routing** (distinguishes high-risk exclusive Telegram redirection from benign WhatsApp interview updates).
     - **Rule 03: Public Webmail & Lookalike Corporate Domains** (flags `@gmail.com` or spoofed domains like `@tcs-campus-drive2026.com` when claiming corporate identity).
     - **Rule 04: Unrealistic Fresher Compensation** (flags $45+/hr or ₹5,000+/day for unskilled entry-level data entry).
     - **Rule 05: Artificial Urgency & Payment Pressure** ("pay today before 5pm", "limited seats remaining").
     - **Rule 06: Unverifiable Corporate Entity** (vague multinational claims without physical headquarters or website).
   - **Strict Score Capping**: Score is strictly capped at ≤ 68 when NO upfront payment demand is present. A score of 70–100 requires an actual financial extraction attempt.
   - **Dynamic Contextual Summaries**: Summaries are generated strictly from matched rules—never claiming fees when no fee rule was triggered.

2. **Anthropic Claude Sonnet AI Forensics (When API Key is Configured)**:
   - Prompt injection isolation via `<untrusted_job_posting_text>`.
   - Strict quote verification: only verbatim quotes matching the input text are cited as exact quotes; paraphrases are clearly marked.
   - **Honest UI Guarantee**: If no API key is provided, the UI explicitly operates in Deterministic Rule Engine mode and hides the Claude Citations tab so judges are never presented with simulated AI output.

---

## ⚡ Quick Start (Run Locally)

### 1. Configure Server Environment
Navigate to `jobshield/server`:
```bash
cd jobshield/server
cp .env.example .env
```

Edit `jobshield/server/.env`:
```env
# Anthropic API Key (Leave blank for Deterministic Mode, or provide key to enable Claude Sonnet)
ANTHROPIC_API_KEY=your_key_here

# Supported Sonnet Model
CLAUDE_MODEL=claude-3-5-sonnet-20241022

PORT=5001
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Run Backend and Frontend
In terminal 1 (Server):
```bash
cd jobshield/server
npm run dev
# Starts on http://localhost:5001
```

In terminal 2 (Frontend):
```bash
cd jobshield/client
npm run dev
# Starts on http://localhost:5173
```

Open your browser to `http://localhost:5173`.

---

## 🧪 Test Suite
Run the automated test suite verifying Indian UPI rules, scoring caps, and API endpoints:
```bash
cd jobshield/server
npm test
```
**14/14 tests passing** with 0 failures.

---

## 🎤 60-Second Live Event Demo Script (For Judges)

1. **The Hook (10 seconds)**:
   > *"Every placement season, students lose their savings to fake job postings demanding 'laptop deposits' or 'UPI offer letter verification fees'. JobShield provides instant forensic verification before students apply."*
2. **Exhibit A: The US Remote Scam (15 seconds)**:
   > *Click `Exhibit A: Registration Fee & Telegram` → Click `Examine Evidence`.*
   > *Point out the **Risk Score (98/100)**, the exact quotation of the $150 deposit, and the off-platform Telegram handle.*
3. **Exhibit D: The Indian Placement UPI Scam (15 seconds)**:
   > *Click `Exhibit D: Campus Placement Drive (Indian ₹4,999 UPI Scam)` → Click `Examine Evidence`.*
   > *Show that JobShield immediately catches the `₹4,999 UPI payment request`, the lookalike domain `@tcs-campus-drive2026.com`, and the offer letter pressure.*
4. **Exhibit C: Handling Ambiguity without Crying Wolf (10 seconds)**:
   > *Click `Exhibit C: Free Email & Vague Entity (Ambiguous)` → Click `Examine Evidence`.*
   > *Show that because NO fee was demanded, the score is capped at **36/100 (Caution)**, and the summary accurately talks about the free Gmail address without falsely claiming advance fees.*
5. **Ethics & Dual Mode (10 seconds)**:
   > *Explain the honest architecture: 100% explainable rule signatures running locally with zero hallucination, with optional Anthropic Claude Sonnet for deep contextual reasoning.*

---

## 🔒 Data Privacy & Disclosures
- **No Applicant Accounts**: Zero login or personal profiles required.
- **Incident Reports**: When reporting an anomaly via "Log Incident", only the job excerpt and category are recorded in ephemeral server memory for the current session.
