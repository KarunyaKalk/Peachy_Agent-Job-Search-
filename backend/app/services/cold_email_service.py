import os
import json
import httpx
from typing import Dict, Any, Optional

from app.models.profile import MasterProfile
from app.models.job import JobSeen
from app.models.tailored_resume import TailoredResume


class ColdEmailService:
    """
    Claude API (Anthropic) Personalized Cold Email Generator.
    Generates tailored, high-converting 3-paragraph outreach emails using
    job description context, candidate achievements, and contact's name & title.
    """

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.model = os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")

    async def generate_cold_email(
        self,
        master_profile: MasterProfile,
        job: JobSeen,
        tailored_resume: Optional[TailoredResume],
        contact_name: str,
        contact_title: str
    ) -> Dict[str, str]:
        """
        Generates personalized cold email subject line and body via Claude API.
        """
        candidate_name = getattr(getattr(master_profile, "user", None), "full_name", "") or "Karunya Kalkhundiya"
        candidate_summary = master_profile.summary or "Senior Engineer"

        # Gather top achievements
        top_bullets = []
        if tailored_resume and tailored_resume.tailored_json:
            exps = tailored_resume.tailored_json.get("experiences", [])
            if exps and len(exps) > 0:
                top_bullets = exps[0].get("bullets", [])[:2]

        if not top_bullets and master_profile.experiences:
            for exp in master_profile.experiences[:1]:
                top_bullets = [b.content for b in (exp.bullets or [])][:2]

        if not top_bullets:
            top_bullets = [
                "Architected high-concurrency microservices and real-time event streaming pipelines handling 100k+ clients.",
                "Optimized cloud infrastructure and backend API contracts to improve application throughput."
            ]

        if self.api_key:
            try:
                result = await self._call_claude_email_api(
                    candidate_name=candidate_name,
                    candidate_summary=candidate_summary,
                    top_bullets=top_bullets,
                    job_title=job.title,
                    company_name=job.company,
                    contact_name=contact_name,
                    contact_title=contact_title
                )
                return result
            except Exception as e:
                print(f"[Claude Cold Email Warning] Call failed: {e}. Utilizing fallback generator.")

        return self._generate_fallback_email(
            candidate_name=candidate_name,
            job_title=job.title,
            company_name=job.company,
            contact_name=contact_name,
            contact_title=contact_title,
            top_bullets=top_bullets
        )

    async def _call_claude_email_api(
        self,
        candidate_name: str,
        candidate_summary: str,
        top_bullets: list,
        job_title: str,
        company_name: str,
        contact_name: str,
        contact_title: str
    ) -> Dict[str, str]:
        prompt = f"""
You are an elite executive recruiter and cold outreach copywriter. Write a concise, high-converting 3-paragraph cold email from candidate {candidate_name} to {contact_name} ({contact_title} at {company_name}).

TARGET JOB: {job_title} at {company_name}
CANDIDATE SUMMARY: {candidate_summary}
TOP ACHIEVEMENTS:
{json.dumps(top_bullets, indent=2)}

INSTRUCTIONS:
1. Write a punchy, non-spammy subject line.
2. Paragraph 1: Personalized hook greeting {contact_name} by name, acknowledging their role as {contact_title}, and expressing interest in the {job_title} role at {company_name}.
3. Paragraph 2: Highlight 2 concrete achievements from the provided top achievements showing direct value alignment.
4. Paragraph 3: Low-friction CTA asking for a quick 10-minute call or code sample preview.
5. Output MUST be valid JSON only matching this schema:
{{
  "subject": "Subject line text here",
  "body": "Email body text here..."
}}
"""
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.model,
                    "max_tokens": 1000,
                    "temperature": 0.3,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=20.0,
            )

            if resp.status_code == 200:
                res_data = resp.json()
                content_text = res_data["content"][0]["text"]
                json_start = content_text.find("{")
                json_end = content_text.rfind("}") + 1
                if json_start != -1 and json_end != -1:
                    return json.loads(content_text[json_start:json_end])

            raise ValueError(f"Claude API returned status {resp.status_code}: {resp.text}")

    def _generate_fallback_email(
        self,
        candidate_name: str,
        job_title: str,
        company_name: str,
        contact_name: str,
        contact_title: str,
        top_bullets: list
    ) -> Dict[str, str]:
        first_name = contact_name.split()[0] if contact_name else "Hiring Manager"
        bullets_text = "\n".join([f"• {b}" for b in top_bullets[:2]])

        subject = f"{job_title} position — {candidate_name} x {company_name}"
        body = f"""Hi {first_name},

I hope this week is treating you well! I saw that {company_name} is expanding engineering efforts for the {job_title} position. Given your leadership as {contact_title}, I wanted to reach out directly.

I'm a Senior Engineer specializing in high-performance full-stack systems and cloud microservices. A few relevant highlights from my experience:

{bullets_text}

I've put together a tailored ATS resume specifically aligned with {company_name}'s architecture. Would you have 10 minutes next Tuesday for a brief chat or to review a live code sample?

Best regards,

{candidate_name}
KarunyaKalk | github.com/KarunyaKalk
"""
        return {"subject": subject, "body": body}
