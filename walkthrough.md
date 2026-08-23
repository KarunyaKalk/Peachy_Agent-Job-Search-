# Walkthrough - Production Deployment Architecture (Render & GitHub Pages)

We have completed the deployment architecture setup for **Peachy** on **Render** and **GitHub Pages**.

---

## 🏗️ Architecture Deliverables

### 1. Render Blueprint Manifest (`render.yaml`)
- **[render.yaml](file:///Users/karunya/Peachy%20Agent/render.yaml)**: Infrastructure-as-Code specification creating 4 dedicated cloud services:
  1. **`peachy-backend-api`**: FastAPI Web REST API (Free Tier web service).
  2. **`peachy-postgres`**: Managed PostgreSQL Database (Free Tier).
  3. **`peachy-redis`**: Managed Redis Instance (Free Tier).
  4. **`peachy-celery-worker`**: Dedicated Always-On Celery Worker & Beat (`starter` paid tier, ~$7/mo) executing Playwright web scrapers and recurring scans every 6 hours without free-tier sleeping.

### 2. Playwright Chromium Dockerfile (`backend/Dockerfile`)
- **[backend/Dockerfile](file:///Users/karunya/Peachy%20Agent/backend/Dockerfile)**:
  - Multi-stage Docker container based on `python:3.11-slim`.
  - Installs system libraries (`libpq-dev`, `build-essential`, `curl`).
  - **CRITICAL**: Installs Playwright Chromium browser binaries and OS dependencies:
    `RUN playwright install --with-deps chromium`
  - Ensures Wellfound and Haveloc scrapers run cleanly in cloud production.

### 3. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- **[.github/workflows/deploy.yml](file:///Users/karunya/Peachy%20Agent/.github/workflows/deploy.yml)**:
  - Automated CI/CD pipeline triggering on `push` to `main`.
  - Injects `VITE_API_BASE_URL: https://peachy-backend-api.onrender.com` during `npm run build`.
  - Deploys static production assets directly to `gh-pages`.

### 4. Backend CORS & Frontend API Binding
- **[backend/app/main.py](file:///Users/karunya/Peachy%20Agent/backend/app/main.py)**: Configured CORS middleware reading `CORS_ORIGINS` environment variable to explicitly allow `https://karunyakalk.github.io` and local dev origins.
- **[frontend/src/services/api.ts](file:///Users/karunya/Peachy%20Agent/frontend/src/services/api.ts)**: Configured `getApiBaseUrl()` defaulting to `https://peachy-backend-api.onrender.com` over HTTPS.

---

## 📋 Render One-Click Deployment Guide

To launch your backend services on Render:
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** ➔ Select **Blueprint**.
3. Connect your GitHub repository: `KarunyaKalk/Peachy_Agent-Job-Search-`.
4. Render will automatically detect `render.yaml` and provision:
   - `peachy-backend-api` (Web Service)
   - `peachy-postgres` (Database)
   - `peachy-redis` (Key-Value)
   - `peachy-celery-worker` (Background Worker)
5. On the Render Dashboard, add your environment secrets under `peachy-backend-api` & `peachy-celery-worker`:
   - `ANTHROPIC_API_KEY`: Your Anthropic API Key
   - `SECRET_KEY`: Random 32+ byte string
   - `HAVELOC_EMAIL` & `HAVELOC_PASSWORD`: Credentials for Haveloc scraper

---

## ⚡ Verification Results
- `npm run build` completed with zero TypeScript errors (`built in 1.34s`).
- Pushed architecture artifacts to GitHub `main` (`commit ebcf727`).
- Published production build to `gh-pages` branch.
