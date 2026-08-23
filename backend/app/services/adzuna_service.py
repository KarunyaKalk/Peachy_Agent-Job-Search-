import os
import random
import httpx
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.job import JobSeen
from app.models.profile import JobPreferences


class AdzunaJobDiscoveryService:
    def __init__(self):
        self.app_id = os.getenv("ADZUNA_APP_ID", "")
        self.app_key = os.getenv("ADZUNA_APP_KEY", "")

    async def scan_jobs_for_preferences(
        self, db: Session, user_id: int, preferences: JobPreferences
    ) -> Tuple[int, int, int, List[JobSeen]]:
        """
        Execute job scan based on user's target_roles and preferred_locations.
        Returns: (new_jobs_added, deduplicated_count, discarded_filtered, list_of_new_jobs)
        """
        target_roles = preferences.target_roles or ["Senior Full Stack Engineer", "Backend Engineer"]
        locations = preferences.preferred_locations or ["Remote", "San Francisco, CA"]
        salary_floor = preferences.salary_floor or 120000
        excluded_keywords = [k.lower() for k in (preferences.excluded_keywords or [])]

        raw_postings = []

        if self.app_id and self.app_key:
            # Query Adzuna live REST API
            async with httpx.AsyncClient() as client:
                for role in target_roles[:3]: # Scan top target roles
                    for loc in locations[:2]:
                        try:
                            url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
                            params = {
                                "app_id": self.app_id,
                                "app_key": self.app_key,
                                "results_per_page": 10,
                                "what": role,
                                "where": loc if loc != "Remote" else "",
                            }
                            resp = await client.get(url, params=params, timeout=8.0)
                            if resp.status_code == 200:
                                data = resp.json()
                                results = data.get("results", [])
                                for item in results:
                                    raw_postings.append(self._parse_adzuna_item(item, role))
                        except Exception as e:
                            print(f"[Adzuna API Warning] Request failed for {role}: {e}")
        else:
            # Generate realistic mock postings matching user preferences
            raw_postings = self._generate_mock_postings(target_roles, locations, salary_floor)

        new_jobs_added = 0
        deduplicated_count = 0
        discarded_filtered = 0
        added_jobs = []

        for item in raw_postings:
            title = item["title"]
            company = item["company"]
            location = item["location"]
            jd_text = item["jd_text"]
            apply_url = item["apply_url"]
            salary_min = item.get("salary_min")
            salary_max = item.get("salary_max")

            # 1. Deduplication check
            dedup_hash = JobSeen.generate_hash(apply_url, title, company)
            existing = db.query(JobSeen).filter(JobSeen.dedup_hash == dedup_hash).first()
            if existing:
                deduplicated_count += 1
                continue

            # 2. Excluded Keywords filter check
            jd_lower = (title + " " + jd_text).lower()
            if any(kw in jd_lower for kw in excluded_keywords):
                discarded_filtered += 1
                continue

            # 3. Salary floor filter check
            if salary_max and salary_max < salary_floor:
                discarded_filtered += 1
                continue

            # 4. Compute Relevance Score (0 - 100)
            score = self._compute_relevance_score(title, jd_text, target_roles, salary_min, salary_floor)

            new_job = JobSeen(
                user_id=user_id,
                dedup_hash=dedup_hash,
                title=title,
                company=company,
                location=location,
                jd_text=jd_text,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency="USD",
                seniority=item.get("seniority", "Senior"),
                source_platform="Adzuna",
                posted_date=item.get("posted_date", "Today"),
                apply_url=apply_url,
                relevance_score=score,
                is_saved=False,
                is_discarded=False,
            )

            db.add(new_job)
            added_jobs.append(new_job)
            new_jobs_added += 1

        db.commit()
        for j in added_jobs:
            db.refresh(j)

        return new_jobs_added, deduplicated_count, discarded_filtered, added_jobs

    def _parse_adzuna_item(self, item: Dict[str, Any], role_query: str) -> Dict[str, Any]:
        company_obj = item.get("company", {})
        company_name = company_obj.get("display_name", "Tech Company") if isinstance(company_obj, dict) else "Tech Company"
        
        loc_obj = item.get("location", {})
        loc_display = loc_obj.get("display_name", "Remote") if isinstance(loc_obj, dict) else "Remote"
        
        return {
            "title": item.get("title", role_query),
            "company": company_name,
            "location": loc_display,
            "jd_text": item.get("description", "High impact role building modern scalable web applications."),
            "salary_min": item.get("salary_min"),
            "salary_max": item.get("salary_max"),
            "apply_url": item.get("redirect_url", f"https://adzuna.com/job/{item.get('id', random.randint(1000, 9999))}"),
            "posted_date": item.get("created", "Just now")[:10],
            "seniority": "Senior"
        }

    def _compute_relevance_score(
        self, title: str, jd_text: str, target_roles: List[str], salary_min: Optional[float], salary_floor: int
    ) -> int:
        score = 75
        title_lower = title.lower()

        # Title match boost
        for target in target_roles:
            if target.lower() in title_lower or any(word in title_lower for word in target.lower().split()):
                score += 15
                break

        # Salary compliance boost
        if salary_min and salary_min >= salary_floor:
            score += 10

        return min(score, 99)

    def _generate_mock_postings(
        self, target_roles: List[str], locations: List[str], salary_floor: int
    ) -> List[Dict[str, Any]]:
        companies = [
          "Linear", "Supabase", "Anthropic", "Vercel", "Datadog",
          "Stripe", "Postman", "Retool", "Ramp", "OpenAI"
        ]

        tech_stacks = [
          "React, TypeScript, Node.js, GraphQL, PostgreSQL, Tailwind CSS",
          "Python, FastAPI, AsyncIO, PyTorch, LangChain, Redis, Docker",
          "Go, Kubernetes, Distributed Systems, Microservices, AWS",
          "Python, Django, PostgreSQL, Celery, React, AWS Lambda"
        ]

        mock_results = []
        for i, role in enumerate(target_roles[:4]):
            comp = companies[i % len(companies)]
            loc = locations[i % len(locations)]
            stack = tech_stacks[i % len(tech_stacks)]
            
            s_min = salary_floor + (i * 10000)
            s_max = s_min + 35000

            jd = (
                f"### Role Overview at {comp}\n"
                f"We are hiring a **{role}** to lead key initiatives across our engineering team. "
                f"In this position, you will build resilient cloud infrastructure and modern web applications.\n\n"
                f"### Core Tech Stack\n"
                f"{stack}\n\n"
                f"### Key Responsibilities\n"
                f"• Architect and ship scalable microservices with clean API contracts.\n"
                f"• Collaborate directly with product designers and frontend engineers.\n"
                f"• Optimize SQL queries and database indexes for high throughput applications.\n"
                f"• Participate in system architecture design and code reviews.\n\n"
                f"### Compensation & Benefits\n"
                f"• Base Salary: ${s_min:,} – ${s_max:,} USD\n"
                f"• Full health, dental, and vision coverage\n"
                f"• Remote stipend and annual learning budget"
            )

            mock_results.append({
                "title": f"{role}",
                "company": comp,
                "location": loc,
                "jd_text": jd,
                "salary_min": s_min,
                "salary_max": s_max,
                "apply_url": f"https://jobs.example.com/{comp.lower()}/{role.lower().replace(' ', '-')}-{i+100}",
                "posted_date": f"2026-08-{(22-i):02d}",
                "seniority": "Senior"
            })

        return mock_results
