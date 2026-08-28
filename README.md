# Peachy — Personal AI Job-Application Agent Web App

Peachy is a personal AI job-application agent web app built with Python FastAPI, React TypeScript, Tailwind CSS, PostgreSQL, Celery, Redis, Playwright, and the Google Gemini API.

---

## Deployment Architecture

- **Frontend**: React + TypeScript + Vite static build deployed to **GitHub Pages**.
- **Backend Web Service**: FastAPI Docker container deployed to **Render**.
- **Database**: PostgreSQL instance on Render.
- **Task Broker & Worker**: Render Key Value (Redis-compatible) broker + separate Render **Background Worker** service.
- **Browser Automation**: Playwright with `playwright install --with-deps chromium` built into the Dockerfile.

---

## Local Development (Dockerized)

Run all services locally via docker-compose:

```bash
docker-compose up --build
```

- **Frontend UI**: `http://localhost:5173`
- **FastAPI API**: `http://localhost:8000`
- **API Docs (Swagger)**: `http://localhost:8000/docs`

---

## Key Modules & Features

1. **Design System & Theme**:
   - Soft off-white light mode & warm dark espresso mode (`prefers-color-scheme` + manual toggle).
   - Interactive inline SVG mascot ("Peachy") with 4 animated states (`idle`, `attention`, `speaking`, `idle_chat`) driven by a React Pub/Sub Event Bus.
2. **Module 1: Master Profile & Auto-Fill**:
   - Structured master profile with editable experience bullet variants.
   - **Upload Resume to Auto-Fill button** with side-by-side Review & Merge Modal.
   - Job Search Preferences panel.
3. **Module 2: Job Discovery Engine**:
   - Aggregator APIs (Adzuna) + Playwright scrapers (Wellfound, Haveloc) + LinkedIn single-URL manual parser.
   - Match scoring (0-100) and deduplication.
4. **Module 3: Resume Tailoring & Fact-Guard**:
   - Truthful bullet rephrasing via Gemini API.
   - **Fact-Guard diff check** flagging untraceable claims.
   - ATS-safe PDF generator using WeasyPrint with ReportLab fallback.
5. **Module 4: ATS Score Checker**:
   - Built-in scoring pipeline with auto-revision loop (<89 score).
   - Standalone ATS Resume Checker tool with 2-column matched vs missing keyword breakdown.
6. **Module 5: Application Review & Submission**:
   - Kanban board (`Not Applied`, `Ready to Apply`, `Applied`, `Under Review`, `Interview`, `Rejected`, `Offer`).
   - Playwright form-fill preview pausing before final submit for human approval click.
7. **Module 6: Cold Email Outreach**:
   - Contact discovery via Hunter.io / Apollo.io APIs.
   - Gemini cold email draft generator with CAN-SPAM opt-out line.
   - **Send Real Test Email button** verifying production dispatch to user's address.
8. **Module 7: Interview Prep Assistant**:
   - Technical and behavioral questions with STAR format answers based on real resume bullets.
   - Interactive preparation checklist.
9. **Module 8: Settings & Audit Feed**:
   - Scan frequency, ATS thresholds, daily caps, platform toggles, activity feed.
