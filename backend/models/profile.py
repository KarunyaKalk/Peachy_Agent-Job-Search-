from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class MasterProfile(Base):
    __tablename__ = "master_profiles"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), default="Karunya")
    email = Column(String(255), default="user@example.com")
    phone = Column(String(50), default="+1 (555) 019-2831")
    location = Column(String(255), default="San Francisco, CA (Open to Remote)")
    linkedin_url = Column(String(550), default="https://linkedin.com/in/peachy-user")
    github_url = Column(String(550), default="https://github.com/peachy-user")
    portfolio_url = Column(String(550), default="https://peachy-user.dev")
    summary = Column(Text, default="Results-driven Senior Full Stack & AI Software Engineer with 6+ years of experience building high-throughput web applications, scalable REST/GraphQL microservices, and LLM-powered autonomous workflow automation systems.")
    
    # Categorized skills: {"Frontend": ["React", "TypeScript", "Tailwind CSS"], "Backend": ["Python", "FastAPI", "PostgreSQL", "Celery", "Redis"], "AI & Automation": ["Gemini API", "Playwright", "LLMs", "LangChain"]}
    skills_json = Column(JSON, default=dict)
    
    # List of experience dicts with bullet point variants per role:
    # [{"company": "Tech Corp", "role": "Senior Software Engineer", "dates": "2022 - Present", "location": "Remote", "bullets": ["Built real-time agent system..."], "variants": {"leadership": ["Led 5 engineers..."], "performance": ["Reduced latency by 40%..."]}}]
    experience_json = Column(JSON, default=list)
    
    # List of projects: [{"title": "Peachy Agent", "description": "AI job agent", "technologies": ["FastAPI", "React", "Gemini API"], "link": "https://..."}]
    projects_json = Column(JSON, default=list)
    
    # List of education: [{"degree": "B.S. Computer Science", "institution": "University of California", "year": "2020", "gpa": "3.8"}]
    education_json = Column(JSON, default=list)
    
    # List of certifications: ["AWS Certified Solutions Architect", "Google Cloud Professional ML Engineer"]
    certifications_json = Column(JSON, default=list)
    
    # Extracted keyword fingerprint (feeds Module 2 job match scoring & Module 4 ATS checker)
    keyword_fingerprint = Column(JSON, default=list)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class JobPreference(Base):
    __tablename__ = "job_preferences"

    id = Column(Integer, primary_key=True, index=True)
    target_roles = Column(JSON, default=lambda: ["Software Engineer", "Full Stack Engineer", "AI Engineer", "Backend Engineer"])
    seniority = Column(JSON, default=lambda: ["Mid-Level", "Senior", "Lead"])
    location_types = Column(JSON, default=lambda: ["Remote", "Hybrid"])
    preferred_cities = Column(JSON, default=lambda: ["San Francisco, CA", "New York, NY", "Austin, TX"])
    salary_floor = Column(Integer, default=130000)
    industries_include = Column(JSON, default=lambda: ["AI / Tech", "Developer Tools", "SaaS", "FinTech"])
    industries_exclude = Column(JSON, default=lambda: ["Crypto / Web3", "Gambling"])
    company_sizes = Column(JSON, default=lambda: ["Seed (1-10)", "Growth (11-50)", "Mid-size (51-200)", "Enterprise (200+)"])
    exclude_keywords = Column(JSON, default=lambda: ["Unpaid", "Clearance Required", "PHP", "Legacy"])
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
