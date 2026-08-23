# 🍑 Peachy — AI Job Application Agent

> **An autonomous, human-in-the-loop AI agent that discovers relevant job postings, tailors resumes per job description with zero hallucinations, scores ATS compatibility, and prepares personalized application assets.**

---

## 🌟 Overview

**Peachy** is a personal AI job-application assistant built for reliability, security, and real-world usability. Unlike naive auto-apply bots that risk account bans or fabricate qualifications, Peachy operates under strict safety and compliance standards:

1. **Human-in-the-Loop Approval**: Every application flow pauses before submission for explicit user confirmation.
2. **Fact-Guard Verification Engine**: Ensures zero invented skills, companies, dates, or credentials when tailoring resumes against your Master Profile.
3. **Multi-Source Job Aggregation**: Combines official APIs (Adzuna) with rate-limited Playwright scrapers (Wellfound, Haveloc) and a compliant LinkedIn manual-assist single URL importer.

---

## 🚀 Progress & Completed Modules (Days 1–5)

```
Peachy Build Pipeline
├── Day 1: Project Scaffolding, JWT Auth & App Shell ........ [DONE ✅]
├── Day 2: Master Profile & Bullet Variants Model .......... [DONE ✅]
├── Days 3-4: Multi-Source Job Discovery Engine ............. [DONE ✅]
├── Day 5: Resume Tailoring & Fact-Guard Audit ............ [DONE ✅]
├── Day 6: PDF Rendering & In-App Resume Editor ............ [UPCOMING ⏳]
└── Days 7-14: ATS Scoring, Submissions, Email & Prep ...... [UPCOMING ⏳]
```

### Module Highlights

#### 🔐 Day 1 — Foundation & Authentication
- **Full-Stack Architecture**: Python FastAPI backend + React TypeScript Tailwind CSS frontend + Docker Compose orchestration.
- **Single-User JWT Auth**: Secure signup, login, and bearer token state management.
- **Modern App Shell**: Responsive sidebar navigation, agent status indicator, human approval guard badge, and theme tokens.

#### 👤 Day 2 — Master Profile & Bullet Variants
- **Structured Resume Database**: Single source of truth for contact details, summary, categorized skills, work history, projects, education, and certifications.
- **Bullet Variants Engine**: Allows storing alternate phrasing variants for any work experience bullet point to highlight specific focus areas (e.g. *Scale & Performance*, *Backend Emphasis*, *Leadership*).
- **Job Search Preferences**: Target role titles, seniority toggles, work mode selectors (Remote/Hybrid), salary floor input, and negative keyword auto-exclude filters.

#### 🔍 Days 3–4 — Multi-Source Job Discovery Engine
- **Adzuna REST API Integration**: Sources structured postings with salary ranges, company names, and direct application links.
- **Wellfound Playwright Scraper**: Rate-limited startup job scraper with randomized delays (`random.uniform(2.0, 4.5)`) and User-Agent spoofing.
- **Haveloc Portal Scraper**: Playwright scraper for institution/campus career portals using authenticated user sessions.
- **LinkedIn Manual-Assist Mode**: Compliant single-URL paste importer (`POST /api/jobs/linkedin-import`) that fetches and parses individual JDs without risking LinkedIn bot bans.
- **Match Scoring Engine**: Calculates a 0–100 relevance score for every job based on title match, skill overlap, location, and salary floor.
- **APScheduler Worker**: Runs automated background job discovery across all sources every 6 hours.

#### 📄 Day 5 — Resume Tailoring Engine & Fact-Guard Audit
- **Claude API (Anthropic) Integration**: Engineered prompts sending target JDs + Master Profile + Bullet Variants to `claude-3-5-sonnet-20241022` to rephrase and reorder existing accomplishments without inventing facts.
- **Fact-Guard Diff Engine**: Automated secondary verification pass comparing tailored output against Master Profile. Marks authentic claims as `verified` (green badge) and flags unverified skills/claims as `flagged` (red alert badge) with explanation text.
- **Structured Versioning**: Stores structured tailored resume records linked to jobs (`tailored_resumes` table) with versioning (`v1`, `v2`) and approval status.
- **Tailored Resume UI Modal**: Interactive viewport with step-by-step progress loading, Fact-Guard alert list, and diff preview.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons | Responsive dashboard & interactive editor UI |
| **Backend** | Python 3.11, FastAPI, Pydantic v2 | High-performance async REST API |
| **Database** | PostgreSQL 16 (SQLite for local dev) | SQLAlchemy ORM with portable schemas |
| **LLM Engine** | Anthropic Claude API (`claude-3-5-sonnet-20241022`) | Intelligent JD parsing & resume tailoring |
| **Browser Automation** | Playwright Async Chromium | Rate-limited scraping (Wellfound, Haveloc) |
| **Task Scheduler** | APScheduler | Background recurring multi-source job scans |
| **Containerization** | Docker, Docker Compose | Multi-container environment |

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/           # Config, Security, Database setup
│   │   ├── models/         # SQLAlchemy DB models (User, Profile, JobSeen, TailoredResume)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # Adzuna, Wellfound, Haveloc, LinkedIn, MatchScorer, Claude & FactGuard
│   │   ├── routers/        # FastAPI REST endpoints (auth, profile, jobs, tailoring)
│   │   └── main.py         # FastAPI entrypoint & scheduler initialization
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, Profile section components, TailoredResumeModal
│   │   ├── context/        # AuthContext for JWT management
│   │   ├── pages/          # Dashboard, Master Profile, Job Feed, Applications, Settings
│   │   ├── services/       # Axios API client (auth, profile, jobs, tailoring)
│   │   └── types/          # TypeScript interfaces
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
├── README.md
└── walkthrough.md
```

---

## ⚡ Quickstart Setup Guide

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in your API credentials:

```bash
cp .env.example .env
```

Key variables:
- `SECRET_KEY`: Random 32+ byte string for JWT token generation.
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude resume tailoring.
- `ADZUNA_APP_ID` & `ADZUNA_APP_KEY`: Optional Adzuna job aggregator keys (service falls back gracefully if not set).
- `HAVELOC_EMAIL` & `HAVELOC_PASSWORD`: Credentials for Haveloc campus portal scraper.

### 2. Run via Docker Compose

Launch the full stack (Frontend + Backend + PostgreSQL + Redis):

```bash
docker-compose up --build
```

Access the applications:
- **Frontend Dashboard**: `http://localhost:5173` (or `http://localhost:3000`)
- **FastAPI OpenAPI Documentation**: `http://localhost:8000/api/docs`

---

## 🧪 Local Manual Setup (Alternative)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.
