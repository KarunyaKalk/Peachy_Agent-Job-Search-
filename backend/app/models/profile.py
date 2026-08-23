from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class MasterProfile(Base):
    __tablename__ = "master_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Contact Info
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    
    # Summary
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="profile")
    skills = relationship("Skill", back_populates="profile", cascade="all, delete-orphan")
    experiences = relationship("WorkExperience", back_populates="profile", cascade="all, delete-orphan", order_by="WorkExperience.display_order")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")
    education = relationship("Education", back_populates="profile", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="profile", cascade="all, delete-orphan")
    preferences = relationship("JobPreferences", back_populates="profile", uselist=False, cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("master_profiles.id"), nullable=False, index=True)
    category = Column(String, nullable=False, default="General")  # e.g., Languages, Frameworks, Cloud, Databases, Tools
    name = Column(String, nullable=False)
    proficiency = Column(String, nullable=True)  # Expert, Advanced, Intermediate

    profile = relationship("MasterProfile", back_populates="skills")


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("master_profiles.id"), nullable=False, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    location = Column(String, nullable=True)
    start_date = Column(String, nullable=False)  # e.g., "2021-03"
    end_date = Column(String, nullable=True)    # e.g., "2024-01" or NULL
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    profile = relationship("MasterProfile", back_populates="experiences")
    bullets = relationship("ExperienceBullet", back_populates="experience", cascade="all, delete-orphan", order_by="ExperienceBullet.display_order")


class ExperienceBullet(Base):
    __tablename__ = "experience_bullets"

    id = Column(Integer, primary_key=True, index=True)
    experience_id = Column(Integer, ForeignKey("work_experiences.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)  # Main/default bullet text
    impact_category = Column(String, nullable=True)  # Performance, Leadership, Architecture, Cost Reduction
    display_order = Column(Integer, default=0)

    experience = relationship("WorkExperience", back_populates="bullets")
    variants = relationship("BulletVariant", back_populates="bullet", cascade="all, delete-orphan")


class BulletVariant(Base):
    __tablename__ = "bullet_variants"

    id = Column(Integer, primary_key=True, index=True)
    bullet_id = Column(Integer, ForeignKey("experience_bullets.id"), nullable=False, index=True)
    variant_text = Column(Text, nullable=False)  # Alternate phrasing for specific JDs/roles
    tag = Column(String, nullable=True)  # e.g., "Backend Emphasis", "Leadership Focus", "AI/ML Focus"

    bullet = relationship("ExperienceBullet", back_populates="variants")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("master_profiles.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(String, nullable=True)  # Comma-separated list or JSON string
    project_url = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)

    profile = relationship("MasterProfile", back_populates="projects")


class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("master_profiles.id"), nullable=False, index=True)
    institution = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    field_of_study = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    gpa_or_honors = Column(String, nullable=True)

    profile = relationship("MasterProfile", back_populates="education")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("master_profiles.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    issuing_organization = Column(String, nullable=False)
    issue_date = Column(String, nullable=True)
    expiration_date = Column(String, nullable=True)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)

    profile = relationship("MasterProfile", back_populates="certifications")


class JobPreferences(Base):
    __tablename__ = "job_preferences"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("master_profiles.id"), unique=True, nullable=False, index=True)
    
    target_roles = Column(JSON, default=list)        # ["Senior Full Stack Engineer", "Backend Lead"]
    seniority_levels = Column(JSON, default=list)    # ["Mid-Level", "Senior", "Lead"]
    job_types = Column(JSON, default=list)           # ["Full-time", "Contract"]
    work_modes = Column(JSON, default=list)          # ["Remote", "Hybrid", "On-site"]
    preferred_locations = Column(JSON, default=list) # ["Remote", "San Francisco, CA", "New York, NY"]
    
    salary_floor = Column(Integer, default=120000)
    salary_currency = Column(String, default="USD")
    
    included_industries = Column(JSON, default=list) # ["AI/ML", "Fintech", "Developer Tools"]
    excluded_industries = Column(JSON, default=list) # ["Gambling", "Staffing Agencies"]
    company_sizes = Column(JSON, default=list)       # ["1-10", "11-50", "51-200", "201-500", "500+"]
    excluded_keywords = Column(JSON, default=list)   # ["unpaid", "clearance required", "contractor only"]

    profile = relationship("MasterProfile", back_populates="preferences")
