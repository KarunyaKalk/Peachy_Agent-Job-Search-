# Peachy - AI Job Application Agent

An autonomous, human-in-the-loop AI agent that discovers relevant job postings across multiple platforms, tailors resumes per job description with zero hallucinations, scores ATS compatibility, pre-fills application forms with safety pauses, dispatches personalized cold outreach, generates STAR interview prep packs, and logs a transparent audit trail.

---

## Technical Overview and Architecture

Peachy is built for reliability, security, and real-world usability. The system strictly operates under human-in-the-loop safety standards:

1. Human Approval Guard: Submissions and form fills pause automatically before final dispatch for explicit user confirmation.
2. Fact-Guard Verification Engine: Performs secondary diff verification ensuring zero invented skills, companies, dates, or credentials when tailoring resumes against your Master Profile.
3. Multi-Source Aggregation: Combines official APIs (Adzuna) with rate-limited Playwright scrapers (Wellfound, Haveloc) and a compliant LinkedIn manual-assist single URL importer.
4. Production Infrastructure: Orchestrated via Docker Compose (PostgreSQL 16, Redis 7, FastAPI, Celery worker with pre-installed Playwright Chromium binaries, and React Vite frontend).

---

## Directory of Required API Keys and Services

To enable full production capabilities, obtain API keys from the following portals:

| Service / API | Portal URL | Usage in Peachy |
| :--- | :--- | :--- |
| **Anthropic Claude API** | https://console.anthropic.com/ | Intelligently rephrases work accomplishments and generates STAR interview prep packs |
| **Adzuna Developer API** | https://developer.adzuna.com/ | Aggregates structured job postings with salary details and application links |
| **Hunter.io API** | https://hunter.io/api | Enriches hiring manager and talent lead email addresses via domain search |
| **SendGrid API / SMTP** | https://sendgrid.com/ | Dispatches personalized cold email outreach with CAN-SPAM opt-out lines |
| **Telegram Bot API** | https://t.me/BotFather | Sends instant webhook notifications when scrapers encounter CAPTCHAs or rate limits |

*Note: If any API keys are omitted or left blank, Peachy automatically operates in standalone mode using built-in deterministic fallback engines.*

---

## Environment Variables Configuration

Create a `.env` file in the root directory using the template below:

```ini
# Core Backend Settings
PROJECT_NAME="Peachy AI Job Agent"
ENVIRONMENT="production"
SECRET_KEY="replace_with_a_secure_random_32_character_string"

# Database & Redis Credentials
DATABASE_URL="postgresql://peachy:peachy_secure_password@db:5432/peachy_db"
REDIS_URL="redis://redis:6379/0"

# LLM & AI API Keys
ANTHROPIC_API_KEY="sk-ant-api03-your-anthropic-api-key"
LLM_MODEL="claude-3-5-sonnet-20241022"

# Job Aggregator & Scraping Keys
ADZUNA_APP_ID="your_adzuna_app_id"
ADZUNA_APP_KEY="your_adzuna_app_key"

# Contact Finder & Email Outreach Keys
HUNTER_API_KEY="your_hunter_api_key"
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
FROM_EMAIL="your_verified_sender@example.com"

# CAPTCHA & Security Webhook Alerts
TELEGRAM_WEBHOOK_URL="https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>"
EMAIL_WEBHOOK_URL="https://hooks.zapier.com/hooks/catch/your_webhook_id"

# CORS and Allowed Origins
CORS_ORIGINS="https://karunyakalk.github.io,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
VITE_API_BASE_URL="http://localhost:8000"
```

---

## Quickstart Deployment Guide

### Option 1: One-Command Docker Deployment (Recommended)

Run the single-command container stack via Docker Compose:

```bash
# Clone the repository
git clone https://github.com/KarunyaKalk/Peachy_Agent-Job-Search-.git
cd Peachy_Agent-Job-Search-

# Launch all 5 container services (PostgreSQL, Redis, FastAPI, Celery Worker, React Vite)
docker compose up --build -d

# Verify container status
docker compose ps
```

Access services locally:
- Frontend Web Interface: http://localhost:5173
- Backend REST API Specs: http://localhost:8000/api/docs
- PostgreSQL Database: `localhost:5432`
- Redis Task Queue: `localhost:6379`

To stop containers:
```bash
docker compose down
```

---

### Option 2: Manual Local Setup (Development Mode)

#### 1. Backend Setup

```bash
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Install Playwright Chromium browser binaries
playwright install --with-deps chromium

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite local dev server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Completed System Modules Summary

- Module 1: Foundation, JWT Authentication, and Responsive Dashboard Shell
- Module 2: Master Profile, Experience Bullets, and Alternate Phrasing Variants
- Module 3: Multi-Source Job Aggregator Engine (Adzuna, Wellfound, Haveloc, LinkedIn)
- Module 4: Resume Tailoring Engine & Fact-Guard Claim Audit Verification
- Module 5: Human Approval Review Queue & Playwright Application Pre-filling
- Module 6: Hunter.io Contact Finder, Claude Cold Email Generator & SendGrid Outreach
- Module 7: Interview Prep Pack & Interactive STAR Answer Checklist
- Module 8: Central Settings, Filterable Audit Log Feed, CAPTCHA Alerting & Polish Pass

---

## Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/           # Database setup, Security, System configuration
│   │   ├── models/         # SQLAlchemy DB models (User, Profile, JobSeen, TailoredResume, Application, ColdEmail, PrepPack, Settings, AuditLog)
│   │   ├── schemas/        # Pydantic schemas for data validation
│   │   ├── services/       # Scrapers, MatchScorer, Claude Tailor, FactGuard, ContactFinder, InterviewPrep, NotificationService
│   │   ├── routers/        # FastAPI REST endpoints (auth, profile, jobs, tailoring, applications, cold_email, interview_prep, settings, audit)
│   │   └── main.py         # Application entrypoint & APScheduler initialization
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, Profile, Mascot, TailoredResumeModal, PrepPackModal, AuditFeed
│   │   ├── context/        # AuthContext & PeachyEventContext
│   │   ├── pages/          # Dashboard, Profile, Jobs, Review Queue, Applications, Tailored Resumes, Cold Email, Interview Prep, Settings
│   │   ├── services/       # Axios API client & mockApi engine
│   │   └── types/          # TypeScript interfaces
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment to GitHub Pages
├── render.yaml              # Render Cloud Infrastructure IaC blueprint
├── docker-compose.yml       # Production 5-container orchestration
└── README.md
```

---

## Troubleshooting & Operational Recovery

### 1. Playwright CAPTCHA / Bot Block Warnings
- Behavior: Scraper logs `status="captcha_blocked"` in audit trail and pauses.
- Resolution: Peachy intentionally avoids aggressive retries to protect IP reputation. Configure `TELEGRAM_WEBHOOK_URL` in Settings to receive instant notifications when bot detection is encountered.

### 2. API Quota Limits
- Behavior: Anthropic or Hunter.io API returns 429 status codes.
- Resolution: Peachy automatically switches to built-in deterministic fallback engines so user workflows remain functional without throwing application crashes.

### 3. Render Database Connections & Free-Tier Wakeups
- Behavior: Deployed backend takes 30-60 seconds on initial cold request.
- Resolution: Render free-tier web services sleep after 15 minutes of inactivity. The standalone client engine (`mockApi.ts`) guarantees GitHub Pages visitors can test all features immediately while the hosted backend wakes up.

---

## Live Deployment Links

- Deployed GitHub Pages App: https://KarunyaKalk.github.io/Peachy_Agent-Job-Search-
- Hosted REST API Documentation: https://peachy-backend-api.onrender.com/api/docs
- Source Code Repository: https://github.com/KarunyaKalk/Peachy_Agent-Job-Search-

---

## License

Distributed under the MIT License. See LICENSE for more information.
