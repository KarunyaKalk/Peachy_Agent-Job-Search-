# Peachy - AI Job Application Agent

An autonomous, human-in-the-loop AI agent that discovers relevant job postings, tailors resumes per job description with zero hallucinations, scores ATS compatibility, and prepares personalized application assets.

---

## Overview

Peachy is a personal AI job-application assistant built for reliability, security, and real-world usability. Peachy operates under strict safety and compliance standards:

1. Human-in-the-Loop Approval: Every application flow pauses before submission for explicit user confirmation.
2. Fact-Guard Verification Engine: Ensures zero invented skills, companies, dates, or credentials when tailoring resumes against your Master Profile.
3. Multi-Source Job Aggregation: Combines official APIs (Adzuna) with rate-limited Playwright scrapers (Wellfound, Haveloc) and a compliant LinkedIn manual-assist single URL importer.
4. Interactive Mascot Assistant: Peachy mascot acts as a persistent guide across every page, alerting users to job matches and resume tailoring updates.

---

## Progress and Completed Modules (Days 1-5)

### Build Pipeline Status

- Day 1: Project Scaffolding, JWT Auth and App Shell [Completed]
- Day 2: Master Profile and Bullet Variants Model [Completed]
- Days 3-4: Multi-Source Job Discovery Engine [Completed]
- Day 5: Resume Tailoring Engine and Fact-Guard Audit [Completed]
- Mascot: Interactive Peachy Mascot and Event Bus [Completed]
- Deployment: Render Cloud Infrastructure and GitHub Pages Setup [Completed]
- Day 6: PDF Rendering and In-App Resume Editor [Upcoming]

---

### Module Breakdown

#### Day 1 - Foundation and Authentication
- Full-Stack Architecture: Python FastAPI backend, React TypeScript Tailwind CSS frontend, Docker Compose orchestration.
- Single-User JWT Authentication: Secure signup, login, and bearer token state management.
- Modern Application Shell: Responsive sidebar navigation, agent status indicator, human approval guard badge, and theme tokens.

#### Day 2 - Master Profile and Bullet Variants
- Structured Resume Database: Single source of truth for contact details, summary, categorized skills, work history, projects, education, and certifications.
- Bullet Variants Engine: Allows storing alternate phrasing variants for any work experience bullet point to highlight specific focus areas (Scale and Performance, Backend Emphasis, Leadership).
- Job Search Preferences: Target role titles, seniority toggles, work mode selectors (Remote/Hybrid), salary floor input, and negative keyword auto-exclude filters.

#### Days 3-4 - Multi-Source Job Discovery Engine
- Adzuna REST API Integration: Sources structured postings with salary ranges, company names, and direct application links.
- Wellfound Playwright Scraper: Rate-limited startup job scraper with randomized delays and User-Agent spoofing.
- Haveloc Portal Scraper: Playwright scraper for institution/campus career portals using authenticated user sessions.
- LinkedIn Manual-Assist Mode: Compliant single-URL paste importer that fetches and parses individual job descriptions without risking bot bans.
- Match Scoring Engine: Calculates a 0-100 relevance score for every job based on title match, skill overlap, location, and salary floor.
- APScheduler Worker: Runs automated background job discovery across all sources every 6 hours.

#### Day 5 - Resume Tailoring Engine and Fact-Guard Audit
- Claude API (Anthropic) Integration: Engineered prompts sending target job descriptions, Master Profile, and Bullet Variants to Claude 3.5 Sonnet to rephrase and reorder existing accomplishments without inventing facts.
- Fact-Guard Diff Engine: Automated secondary verification pass comparing tailored output against Master Profile. Marks authentic claims as verified and flags unverified skills/claims as flagged with explanation text.
- Structured Versioning: Stores structured tailored resume records linked to jobs with versioning (v1, v2) and approval status.
- Tailored Resume UI Modal: Interactive viewport with step-by-step progress loading, Fact-Guard alert list, and diff preview.

#### Interactive Peachy Mascot and Event Bus
- Modular SVG Component: Custom vector illustration featuring a peach mascot with stem, glasses, blue tie, briefcase, and waving arm.
- Multi-State Animation Engine: Idle bobbing, attention-seeking bounce and arm wave, speaking popovers, and contextual page nudges.
- Global Event Bus: Decoupled pub/sub event context listening to real application events (Job Scan Discovered, Resume Tailored).

---

## Tech Stack and Architecture

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Responsive dashboard, mascot, and interactive editor UI |
| **Backend** | Python 3.11, FastAPI, Pydantic v2 | High-performance async REST API |
| **Database** | PostgreSQL 16 (SQLite for local dev) | SQLAlchemy ORM with portable schemas |
| **LLM Engine** | Anthropic Claude API (claude-3-5-sonnet) | Intelligent JD parsing and resume tailoring |
| **Browser Automation** | Playwright Async Chromium | Rate-limited scraping (Wellfound, Haveloc) |
| **Task Scheduler** | APScheduler / Celery | Background recurring multi-source job scans |
| **Cloud Hosting** | Render (Backend API, Postgres, Celery Worker) | Always-on HTTPS production backend |
| **Static Deployment** | GitHub Pages | Frontend static asset hosting |

---

## Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/           # Config, Security, Database setup
│   │   ├── models/         # SQLAlchemy DB models (User, Profile, JobSeen, TailoredResume)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # Adzuna, Wellfound, Haveloc, LinkedIn, MatchScorer, Claude and FactGuard
│   │   ├── routers/        # FastAPI REST endpoints (auth, profile, jobs, tailoring)
│   │   └── main.py         # FastAPI entrypoint and scheduler initialization
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, Profile components, Mascot, TailoredResumeModal
│   │   ├── context/        # AuthContext and PeachyEventContext
│   │   ├── pages/          # Dashboard, Master Profile, Job Feed, Applications, Settings
│   │   ├── services/       # Axios API client and mock fallback engine
│   │   └── types/          # TypeScript interfaces
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
