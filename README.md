# Peachy - AI Job Application Agent

An autonomous, human-in-the-loop AI agent that discovers relevant job postings, tailors resumes per job description with zero hallucinations, scores ATS compatibility, pre-fills application forms with hard pause safeguards, tracks applications via a Kanban dashboard, enriches hiring contacts, and drafts personalized cold outreach emails.

---

## Overview

Peachy is a personal AI job-application assistant built for reliability, security, and real-world usability. Peachy operates under strict safety and compliance standards:

1. Human-in-the-Loop Approval: Every application submission flow hard-pauses before final submission for explicit user confirmation.
2. Fact-Guard Verification Engine: Ensures zero invented skills, companies, dates, or credentials when tailoring resumes against your Master Profile.
3. Multi-Source Job Aggregation: Combines official APIs (Adzuna) with rate-limited Playwright scrapers (Wellfound, Haveloc) and a compliant LinkedIn manual-assist single URL importer.
4. ATS-Safe PDF Generation and Structured Editor: WeasyPrint and Jinja2 single-column ATS resume generator with version history and structured JSON editing.
5. Legitimate Contact Enrichment and Outreach: Hunter.io domain contact discovery (no LinkedIn scraping), Claude AI personalized cold email drafting, SendGrid/SMTP delivery, daily capping (15/day), and CAN-SPAM opt-out line enforcement.
6. Interactive Mascot Assistant: Peachy mascot acts as a persistent guide across every page, alerting users to job matches and application updates.

---

## Progress and Completed Modules

### Build Pipeline Status

- Module 1: Project Scaffolding, JWT Auth, and App Shell [Completed]
- Module 2: Master Profile, Bullet Variants, and Job Preferences [Completed]
- Module 3: Multi-Source Job Discovery Engine and Match Scoring [Completed]
- Module 4: Resume Tailoring Engine and Fact-Guard Verification [Completed]
- Module 5: WeasyPrint ATS PDF Generator and Structured In-App Editor [Completed]
- Module 5: Application Review Queue, Playwright Pre-Fill with Hard Pause, and Kanban Dashboard [Completed]
- Module 6: Hunter.io Contact Enrichment, Claude Cold Email Generator, SendGrid/SMTP Delivery, Daily Capping (15/day), and Outreach Log [Completed]
- Mascot: Interactive Peachy Mascot Component and Global Event Bus [Completed]

---

### Module Breakdown

#### Module 1 - Foundation and Authentication
- Full-Stack Architecture: Python FastAPI backend, React TypeScript Tailwind CSS frontend, Docker Compose orchestration.
- Single-User JWT Authentication: Secure signup, login, and bearer token state management.
- Modern Application Shell: Responsive sidebar navigation, agent status indicator, human approval guard badge, and theme tokens.

#### Module 2 - Master Profile and Bullet Variants
- Structured Resume Database: Single source of truth for contact details, summary, categorized skills, work history, projects, education, and certifications.
- Bullet Variants Engine: Allows storing alternate phrasing variants for any work experience bullet point to highlight specific focus areas (Scale and Performance, Backend Emphasis, Leadership).
- Job Search Preferences: Target role titles, seniority toggles, work mode selectors (Remote/Hybrid), salary floor input, and negative keyword auto-exclude filters.

#### Module 3 - Multi-Source Job Discovery Engine
- Adzuna REST API Integration: Sources structured postings with salary ranges, company names, and direct application links.
- Wellfound Playwright Scraper: Rate-limited startup job scraper with randomized delays and User-Agent spoofing.
- Haveloc Portal Scraper: Playwright scraper for institution/campus career portals using authenticated user sessions.
- LinkedIn Manual-Assist Mode: Compliant single-URL paste importer that fetches and parses individual job descriptions without risking bot bans.
- Match Scoring Engine: Calculates a 0-100 relevance score for every job based on title match, skill overlap, location, and salary floor.
- APScheduler Worker: Runs automated background job discovery across all sources every 6 hours.

#### Module 4 - Resume Tailoring Engine and Fact-Guard Audit
- Claude API (Anthropic) Integration: Engineered prompts sending target job descriptions, Master Profile, and Bullet Variants to Claude 3.5 Sonnet to rephrase and reorder existing accomplishments without inventing facts.
- Fact-Guard Diff Engine: Automated secondary verification pass comparing tailored output against Master Profile. Marks authentic claims as verified and flags unverified skills/claims as flagged with explanation text.
- Structured Versioning: Stores structured tailored resume records linked to jobs with versioning (v1, v2) and approval status.
- Tailored Resume UI Modal: Interactive viewport with step-by-step progress loading, Fact-Guard alert list, and diff preview.

#### Module 5 - ATS PDF Generator, Review Queue, and Kanban Dashboard
- ATS-Safe Jinja2 HTML/CSS Template: Standard fonts, single-column layout, semantic headings, no tables, text boxes, or images.
- WeasyPrint PDF Rendering Engine: Generates downloadable ATS-safe PDF resumes directly from tailored JSON data.
- Structured In-App Resume Editor: Enables reordering bullet points, modifying wording, and toggling sections prior to finalizing a version.
- Version History Storage: Retains complete version history per job, re-downloadable and viewable anytime from job details.
- Review Queue Page: Centralized queue displaying JD summary, match score, ATS breakdown, tailored preview, with Approve, Reject, and Edit actions.
- Playwright Form Automation with Hard Pause: Automatically pre-fills application forms (Wellfound, Haveloc, LinkedIn Easy Apply) with applicant info and attached PDF resume, hard-pausing right before the submit button with a live screenshot preview for user confirmation.
- 6-Column Kanban Dashboard: Tracks applications through Ready to Apply, Applied, Under Review, Interview, Offer, and Rejected stages.

#### Module 6 - Cold Email Outreach Engine
- Hunter.io Contact Enrichment: Queries company domain records to find hiring managers, recruiters, and engineering leads with verified email addresses and confidence scores (0-100%). Zero direct scraping of LinkedIn.
- Claude AI Cold Email Generator: Generates personalized 3-paragraph outreach emails combining recipient contact info, target job requirements, and candidate accomplishments.
- SendGrid / SMTP Delivery Integration: Dispatches approved emails from candidate's identity via SendGrid Web API or SMTP.
- Daily Send Cap (15/day): Enforces a configurable daily send limit to maintain sender reputation and keep outreach personal.
- CAN-SPAM Opt-Out Compliance: Automatically appends an unsubscribe footer line to every outbound cold email.
- Outreach Audit Log: Tracks all sent emails in an `outreach` database table with recipient details, sent dates, and email body inspection.

#### Interactive Peachy Mascot and Event Bus
- Modular SVG Component: Custom vector illustration featuring a peach mascot with stem, glasses, blue tie, briefcase, and waving arm.
- Multi-State Animation Engine: Idle bobbing, attention-seeking bounce and arm wave, speaking popovers, and contextual page nudges.
- Global Event Bus: Decoupled pub/sub event context listening to real application events (Job Scan Discovered, Resume Tailored, Form Pre-Filled, Email Dispatched).

---

## Tech Stack and Architecture

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Responsive dashboard, mascot, editor, and cold email UI |
| **Backend** | Python 3.11, FastAPI, Pydantic v2 | High-performance async REST API |
| **Database** | PostgreSQL 16 (SQLite for local dev) | SQLAlchemy ORM with portable schemas |
| **LLM Engine** | Anthropic Claude API (claude-3-5-sonnet) | Intelligent JD parsing, resume tailoring, and cold email generation |
| **Contact Enrichment** | Hunter.io Domain Search API | Verified hiring manager email lookup with confidence scoring |
| **PDF Generator** | WeasyPrint & Jinja2 HTML/CSS | ATS-safe single-column PDF resume rendering |
| **Browser Automation** | Playwright Async Chromium | Rate-limited job scraping and pre-fill form automation with hard pause |
| **Email Delivery** | SendGrid v3 API / SMTP | Cold outreach dispatch with daily capping (15/day) |
| **Task Scheduler** | APScheduler | Background recurring multi-source job scans |
| **Cloud Hosting** | Render (Backend API, Postgres, Celery Worker) | Always-on HTTPS production backend |
| **Static Deployment** | GitHub Pages | Frontend static asset hosting |

---

## Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/           # Config, Security, Database setup
│   │   ├── models/         # SQLAlchemy DB models (User, Profile, JobSeen, TailoredResume, Application, ColdEmailDraft, Outreach)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # Adzuna, Wellfound, Haveloc, LinkedIn, MatchScorer, Claude, FactGuard, PDF, Submission, Hunter, ColdEmail, EmailDelivery
│   │   ├── templates/      # Jinja2 ATS-safe HTML/CSS resume template
│   │   ├── routers/        # FastAPI REST endpoints (auth, profile, jobs, tailoring, applications, cold_email)
│   │   └── main.py         # FastAPI entrypoint and scheduler initialization
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, Profile, Applications, Outreach, Mascot, TailoredResumeModal
│   │   ├── context/        # AuthContext and PeachyEventContext
│   │   ├── pages/          # Dashboard, Master Profile, Job Feed, Applications, Cold Email Hub, Settings
│   │   ├── services/       # Axios API client, mock engine, applications, outreach services
│   │   └── types/          # TypeScript interfaces (job, profile, tailoring, application, outreach)
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment to GitHub Pages
├── render.yaml              # Render Infrastructure-as-Code blueprint
├── docker-compose.yml
└── README.md
```

---

## Live Deployment Links

- Frontend Site: https://KarunyaKalk.github.io/Peachy_Agent-Job-Search-
- Backend API Documentation: https://peachy-backend-api.onrender.com/api/docs
- Source Code Repository: https://github.com/KarunyaKalk/Peachy_Agent-Job-Search-

---

## License

Distributed under the MIT License. See LICENSE for more information.
