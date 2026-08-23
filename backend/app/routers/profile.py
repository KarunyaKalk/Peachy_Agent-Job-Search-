from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.profile import (
    MasterProfile,
    Skill,
    WorkExperience,
    ExperienceBullet,
    BulletVariant,
    Project,
    Education,
    Certification,
    JobPreferences,
)
from app.schemas.profile import (
    MasterProfileResponse,
    ContactSummaryUpdate,
    SkillCreate,
    SkillResponse,
    WorkExperienceCreate,
    WorkExperienceResponse,
    ExperienceBulletCreate,
    ExperienceBulletResponse,
    BulletVariantCreate,
    BulletVariantResponse,
    ProjectCreate,
    ProjectResponse,
    EducationCreate,
    EducationResponse,
    CertificationCreate,
    CertificationResponse,
    JobPreferencesUpdate,
    JobPreferencesResponse,
)

router = APIRouter(prefix="/profile", tags=["profile"])


def _get_or_create_profile(db: Session, user_id: int) -> MasterProfile:
    profile = db.query(MasterProfile).filter(MasterProfile.user_id == user_id).first()
    if not profile:
        profile = MasterProfile(
            user_id=user_id,
            summary="Experienced Software Engineer focused on building scalable cloud systems and intuitive user products.",
            location="San Francisco, CA",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Initialize default job preferences
        prefs = JobPreferences(
            profile_id=profile.id,
            target_roles=["Senior Full Stack Engineer", "Backend Lead", "AI Software Engineer"],
            seniority_levels=["Senior", "Lead"],
            job_types=["Full-time"],
            work_modes=["Remote", "Hybrid"],
            preferred_locations=["Remote", "San Francisco, CA", "New York, NY"],
            salary_floor=140000,
            salary_currency="USD",
            included_industries=["Software & Tech", "AI/ML", "Fintech"],
            excluded_industries=["Staffing Agencies", "Gambling"],
            company_sizes=["11-50", "51-200", "201-500"],
            excluded_keywords=["unpaid", "contractor only", "clearance required"],
        )
        db.add(prefs)
        db.commit()
        db.refresh(profile)
    return profile


# --- Full Profile Endpoint ---
@router.get("", response_model=MasterProfileResponse)
def get_master_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Any:
    return _get_or_create_profile(db, current_user.id)


# --- Contact Info & Summary ---
@router.put("/contact", response_model=MasterProfileResponse)
def update_contact_summary(
    data: ContactSummaryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    for field, value in data.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


# --- Skills CRUD ---
@router.post("/skills", response_model=SkillResponse)
def create_skill(
    data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    skill = Skill(profile_id=profile.id, **data.dict())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user.id)
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.profile_id == profile.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return None


# --- Work Experience CRUD ---
@router.post("/experiences", response_model=WorkExperienceResponse)
def create_experience(
    data: WorkExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    exp_data = data.dict(exclude={"bullets"})
    experience = WorkExperience(profile_id=profile.id, **exp_data)
    db.add(experience)
    db.commit()
    db.refresh(experience)

    # Add initial bullets if provided
    if data.bullets:
        for b_data in data.bullets:
            bullet = ExperienceBullet(experience_id=experience.id, **b_data.dict())
            db.add(bullet)
        db.commit()
        db.refresh(experience)

    return experience


@router.put("/experiences/{exp_id}", response_model=WorkExperienceResponse)
def update_experience(
    exp_id: int,
    data: WorkExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    experience = db.query(WorkExperience).filter(
        WorkExperience.id == exp_id, WorkExperience.profile_id == profile.id
    ).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience entry not found")

    for field, value in data.dict(exclude={"bullets"}, exclude_unset=True).items():
        setattr(experience, field, value)
    db.commit()
    db.refresh(experience)
    return experience


@router.delete("/experiences/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    exp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user.id)
    experience = db.query(WorkExperience).filter(
        WorkExperience.id == exp_id, WorkExperience.profile_id == profile.id
    ).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience entry not found")
    db.delete(experience)
    db.commit()
    return None


# --- Experience Bullets CRUD ---
@router.post("/experiences/{exp_id}/bullets", response_model=ExperienceBulletResponse)
def create_bullet(
    exp_id: int,
    data: ExperienceBulletCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    experience = db.query(WorkExperience).filter(
        WorkExperience.id == exp_id, WorkExperience.profile_id == profile.id
    ).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience entry not found")

    bullet = ExperienceBullet(experience_id=experience.id, **data.dict())
    db.add(bullet)
    db.commit()
    db.refresh(bullet)
    return bullet


@router.put("/bullets/{bullet_id}", response_model=ExperienceBulletResponse)
def update_bullet(
    bullet_id: int,
    data: ExperienceBulletCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    bullet = db.query(ExperienceBullet).join(WorkExperience).filter(
        ExperienceBullet.id == bullet_id, WorkExperience.profile_id == profile.id
    ).first()
    if not bullet:
        raise HTTPException(status_code=404, detail="Bullet point not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(bullet, field, value)
    db.commit()
    db.refresh(bullet)
    return bullet


@router.delete("/bullets/{bullet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bullet(
    bullet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user.id)
    bullet = db.query(ExperienceBullet).join(WorkExperience).filter(
        ExperienceBullet.id == bullet_id, WorkExperience.profile_id == profile.id
    ).first()
    if not bullet:
        raise HTTPException(status_code=404, detail="Bullet point not found")
    db.delete(bullet)
    db.commit()
    return None


# --- Bullet Variants CRUD ---
@router.post("/bullets/{bullet_id}/variants", response_model=BulletVariantResponse)
def create_bullet_variant(
    bullet_id: int,
    data: BulletVariantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    bullet = db.query(ExperienceBullet).join(WorkExperience).filter(
        ExperienceBullet.id == bullet_id, WorkExperience.profile_id == profile.id
    ).first()
    if not bullet:
        raise HTTPException(status_code=404, detail="Bullet point not found")

    variant = BulletVariant(bullet_id=bullet.id, **data.dict())
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@router.delete("/variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bullet_variant(
    variant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user.id)
    variant = db.query(BulletVariant).join(ExperienceBullet).join(WorkExperience).filter(
        BulletVariant.id == variant_id, WorkExperience.profile_id == profile.id
    ).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Bullet variant not found")
    db.delete(variant)
    db.commit()
    return None


# --- Projects CRUD ---
@router.post("/projects", response_model=ProjectResponse)
def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    project = Project(profile_id=profile.id, **data.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user.id)
    project = db.query(Project).filter(Project.id == project_id, Project.profile_id == profile.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None


# --- Education CRUD ---
@router.post("/education", response_model=EducationResponse)
def create_education(
    data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    edu = Education(profile_id=profile.id, **data.dict())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


@router.delete("/education/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(
    edu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user.id)
    edu = db.query(Education).filter(Education.id == edu_id, Education.profile_id == profile.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    db.delete(edu)
    db.commit()
    return None


# --- Certifications CRUD ---
@router.post("/certifications", response_model=CertificationResponse)
def create_certification(
    data: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    cert = Certification(profile_id=profile.id, **data.dict())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.delete("/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certification(
    cert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user.id)
    cert = db.query(Certification).filter(Certification.id == cert_id, Certification.profile_id == profile.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return None


# --- Job Preferences Update ---
@router.put("/preferences", response_model=JobPreferencesResponse)
def update_job_preferences(
    data: JobPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    prefs = profile.preferences
    if not prefs:
        prefs = JobPreferences(profile_id=profile.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    for field, value in data.dict(exclude_unset=True).items():
        setattr(prefs, field, value)
    db.commit()
    db.refresh(prefs)
    return prefs
