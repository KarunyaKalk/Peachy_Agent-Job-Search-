import os
import json
import httpx
from typing import Dict, Any, List
from app.models.profile import MasterProfile
from app.models.job import JobSeen
from app.models.tailored_resume import TailoredResume


class InterviewPrepService:
    """
    Claude API Interview Prep Pack Engine.
    Generates company context, technical questions, behavioral STAR answers,
    and key skills based on target JD + Master Profile accomplishments.
    """

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.model = os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")

    async def generate_prep_pack(
        self,
        master_profile: MasterProfile,
        job: JobSeen,
        tailored_resume: TailoredResume = None
    ) -> Dict[str, Any]:

        # Extract bullets for STAR story matching
        user_bullets = []
        for exp in (master_profile.experiences or []):
            for b in (exp.bullets or []):
                user_bullets.append(f"{exp.role} @ {exp.company}: {b.content}")

        if self.api_key:
            try:
                result = await self._call_claude_api(job, master_profile, user_bullets)
            except Exception as e:
                print(f"[Interview Prep Warning] Claude API call failed: {e}. Using fallback generator.")
                result = self._generate_fallback_pack(job, master_profile)
        else:
            result = self._generate_fallback_pack(job, master_profile)

        return result

    async def _call_claude_api(
        self, job: JobSeen, master_profile: MasterProfile, user_bullets: List[str]
    ) -> Dict[str, Any]:
        prompt = f"""
You are an expert interview coach for Peachy AI Agent.

### TARGET ROLE & COMPANY:
Title: {job.title}
Company: {job.company}
Job Description:
{job.jd_text}

### CANDIDATE ACCOMPLISHMENTS (Truth Baseline):
{json.dumps(user_bullets, indent=2)}

### INSTRUCTIONS:
Generate a comprehensive, highly tailored Interview Prep Pack matching this schema EXACTLY:
{{
  "company_overview": "2-3 sentence overview of company background, engineering priorities, and culture.",
  "key_skills_to_highlight": ["Skill 1", "Skill 2", ...],
  "technical_questions": [
    {{
      "id": "tech_1",
      "question": "Likely technical question derived from JD requirements...",
      "topic": "Topic/Category",
      "expected_answer": "Concise key points to cover in your technical response...",
      "notes": "",
      "is_completed": false
    }}
  ],
  "behavioral_questions": [
    {{
      "id": "beh_1",
      "question": "Likely behavioral question (e.g. Tell me about a time you led a complex architecture)...",
      "competency": "Leadership / Problem Solving",
      "star_answer": {{
        "situation": "Specific context from candidate's real experience...",
        "task": "The challenge or objective required...",
        "action": "Concrete actions candidate took...",
        "result": "Quantifiable impact achieved..."
      }},
      "notes": "",
      "is_completed": false
    }}
  ]
}}

Make sure to provide 5 technical questions and 5 behavioral questions with complete STAR answers.
Return ONLY valid JSON matching this schema.
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
                    "max_tokens": 2500,
                    "temperature": 0.3,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=30.0,
            )

            if resp.status_code == 200:
                res_data = resp.json()
                content_text = res_data["content"][0]["text"]
                json_start = content_text.find("{")
                json_end = content_text.rfind("}") + 1
                if json_start != -1 and json_end != -1:
                    return json.loads(content_text[json_start:json_end])

            raise ValueError(f"Claude API status {resp.status_code}: {resp.text}")

    def _generate_fallback_pack(
        self, job: JobSeen, master_profile: MasterProfile
    ) -> Dict[str, Any]:
        """High-signal fallback interview prep pack with STAR answers."""
        
        company = job.company
        title = job.title

        company_overview = (
            f"{company} is a high-growth technology leader focusing on scalable cloud infrastructure, "
            f"modern software architecture, and developer productivity. Interviews emphasize deep technical "
            f"problem-solving, clean code design, and collaborative engineering execution."
        )

        key_skills = ["System Architecture", "API Design", "Distributed Systems", "Database Optimization", "Team Collaboration"]

        technical_questions = [
          {
            "id": "tech_1",
            "question": f"How would you design a high-concurrency event processing pipeline for {company}'s core services?",
            "topic": "System Design & Scale",
            "expected_answer": "Discuss decoupled microservices, message queueing (Kafka/Redis), database indexing, horizontal scaling, and sub-50ms latency guarantees.",
            "notes": "",
            "is_completed": False
          },
          {
            "id": "tech_2",
            "question": "Walk me through how you optimize complex SQL queries and prevent database bottlenecks.",
            "topic": "Database Optimization",
            "expected_answer": "Explain EXPLAIN ANALYZE execution plans, composite B-Tree indexes, connection pooling, read replicas, and caching strategy.",
            "notes": "",
            "is_completed": False
          },
          {
            "id": "tech:3",
            "question": "How do you enforce type safety and robust API contracts between frontend and backend?",
            "topic": "API Design",
            "expected_answer": "Cover Pydantic v2 schemas, OpenAPI specs, TypeScript strict mode, and automated integration contracts.",
            "notes": "",
            "is_completed": False
          },
          {
            "id": "tech_4",
            "question": "What is your approach to handling error boundaries and resilient state management in React?",
            "topic": "Frontend Architecture",
            "expected_answer": "Discuss React error boundaries, fallback UI components, normalized state management, and optimistic UI updates.",
            "notes": "",
            "is_completed": False
          },
          {
            "id": "tech_5",
            "question": "How do you secure JWT authentication tokens and prevent XSS/CSRF vulnerabilities?",
            "topic": "Security & Auth",
            "expected_answer": "Discuss HTTP-only secure cookies, short-lived JWT expiration, refresh token rotation, and Content Security Policies.",
            "notes": "",
            "is_completed": False
          }
        ]

        behavioral_questions = [
          {
            "id": "beh_1",
            "question": "Tell me about a time you led a major architectural migration under a tight deadline.",
            "competency": "Leadership & Scale",
            "star_answer": {
              "situation": f"While working on high-throughput backend services, legacy HTTP polling created server memory bottlenecks.",
              "task": "I was tasked with redesigning the real-time event pipeline to support over 100k active concurrent clients.",
              "action": "I architected a decoupled WebSocket and Redis pub-sub messaging architecture with zero downtime.",
              "result": "Reduced event distribution latency to sub-50ms and eliminated server memory spikes by 75%."
            },
            "notes": "",
            "is_completed": False
          },
          {
            "id": "beh_2",
            "question": "Describe a scenario where you resolved a technical disagreement with a team member.",
            "competency": "Collaboration & Communication",
            "star_answer": {
              "situation": "Our team was split between GraphQL vs REST for a new public developer API.",
              "task": "I needed to align stakeholders around performance, security, and developer ergonomics.",
              "action": "I created a rapid benchmark prototype comparing payload size, caching, and rate limiting.",
              "result": "The team unanimously agreed on a structured REST API with OpenAPI documentation, delivering 2 weeks ahead of schedule."
            },
            "notes": "",
            "is_completed": False
          },
          {
            "id": "beh_3",
            "question": "Give an example of how you handle production incidents or high-severity bugs.",
            "competency": "Crisis Management & Resilience",
            "star_answer": {
              "situation": "A database lock escalation caused intermittent 504 timeouts during peak traffic.",
              "task": "Identify root cause immediately and restore service SLA within 15 minutes.",
              "action": "Inspected slow query logs, applied missing composite index, and implemented automated fallback caching.",
              "result": "Restored 99.99% uptime SLA and published a blameless post-mortem with preventative monitoring alerts."
            },
            "notes": "",
            "is_completed": False
          },
          {
            "id": "beh_4",
            "question": "How do you prioritize technical debt versus shipping new product features?",
            "competency": "Product Mindset",
            "star_answer": {
              "situation": "Rapid feature iteration led to code duplication across core application modules.",
              "task": "Balance refactoring with ongoing sprint commitments.",
              "action": "Introduced modular utility abstractions and allocated 20% of sprint capacity to refactoring technical debt.",
              "result": "Improved developer velocity by 30% and decreased bug reports on core features."
            },
            "notes": "",
            "is_completed": False
          },
          {
            "id": "beh_5",
            "question": "Why do you want to join our engineering team at this stage?",
            "competency": "Company Alignment",
            "star_answer": {
              "situation": f"Following {company}'s growth and product innovations in {title} domain.",
              "task": "Contribute my expertise in full-stack cloud architecture to high-impact initiatives.",
              "action": "Researched company engineering culture, recent product releases, and technical goals.",
              "result": "Ready to hit the ground running on day one with immediate contributions to core architecture."
            },
            "notes": "",
            "is_completed": False
          }
        ]

        return {
            "company_overview": company_overview,
            "key_skills_to_highlight": key_skills,
            "technical_questions": technical_questions,
            "behavioral_questions": behavioral_questions
        }
