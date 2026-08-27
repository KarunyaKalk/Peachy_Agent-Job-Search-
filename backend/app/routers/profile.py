from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
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
from app.schemas.profile_parser import (
    ResumeParseResponse,
    ApplyParsedResumeRequest,
)
from app.services.resume_parser_service import ResumeParserService

router = APIRouter(prefix="/profile", tags=["profile"])
parser_service = ResumeParserService()



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


# --- Resume Upload & Auto-Fill Endpoints ---
@router.post("/upload-resume", response_model=ResumeParseResponse)
async def upload_resume_and_extract(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Accepts PDF or DOCX file upload, extracts text, calls Claude API Fact-Guard
    parsing, and returns extracted schema + ambiguities side-by-side with current profile.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        raw_text = parser_service.extract_text(contents, file.filename)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from file: {str(e)}")

    extracted_data, ambiguities = await parser_service.parse_resume_document(raw_text)
    current_profile = _get_or_create_profile(db, current_user.id)

    return ResumeParseResponse(
        extracted_data=extracted_data,
        current_profile=current_profile,
        ambiguities=ambiguities,
        raw_text_snippet=raw_text[:300] + "..." if len(raw_text) > 300 else raw_text,
    )


@router.post("/apply-parsed-resume", response_model=MasterProfileResponse)
def apply_parsed_resume_data(
    payload: ApplyParsedResumeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Applies user-reviewed and accepted resume fields into Master Profile DB.
    Merges scalar fields and appends/updates list entities (skills, experience, projects, ed, certs).
    """
    profile = _get_or_create_profile(db, current_user.id)

    # 1. Update Contact Summary if provided
    if payload.contact_summary:
        for field, val in payload.contact_summary.dict(exclude_unset=True).items():
            if val is not None and str(val).strip() != "":
                setattr(profile, field, val)

    # 2. Add/Merge Skills
    if payload.skills:
        existing_skills = {(s.category.lower(), s.name.lower()): s for s in (profile.skills or [])}
        for sk in payload.skills:
            key = (sk.category.lower(), sk.name.lower())
            if key not in existing_skills:
                new_skill = Skill(
                    profile_id=profile.id,
                    category=sk.category or "General",
                    name=sk.name,
                    proficiency=sk.proficiency,
                )
                db.add(new_skill)

    # 3. Add/Merge Work Experiences
    if payload.experiences:
        for exp in payload.experiences:
            # Check if matching company and role already exists
            existing_exp = db.query(WorkExperience).filter(
                WorkExperience.profile_id == profile.id,
                WorkExperience.company.ilike(exp.company),
                WorkExperience.role.ilike(exp.role),
            ).first()

            if not existing_exp:
                new_exp = WorkExperience(
                    profile_id=profile.id,
                    company=exp.company,
                    role=exp.role,
                    location=exp.location,
                    start_date=exp.start_date,
                    end_date=exp.end_date,
                    is_current=exp.is_current,
                    description=exp.description,
                    display_order=exp.display_order,
                )
                db.add(new_exp)
                db.commit()
                db.refresh(new_exp)

                if exp.bullets:
                    for b in exp.bullets:
                        new_bullet = ExperienceBullet(
                            experience_id=new_exp.id,
                            content=b.content,
                            impact_category=b.impact_category,
                            display_order=b.display_order,
                        )
                        db.add(new_bullet)
            else:
                # Merge new bullets into existing role if unique
                existing_bullet_texts = {b.content.lower() for b in (existing_exp.bullets or [])}
                if exp.bullets:
                    for b in exp.bullets:
                        if b.content.lower() not in existing_bullet_texts:
                            new_bullet = ExperienceBullet(
                                experience_id=existing_exp.id,
                                content=b.content,
                                impact_category=b.impact_category,
                                display_order=b.display_order,
                            )
                            db.add(new_bullet)

    # 4. Add/Merge Projects
    if payload.projects:
        existing_projects = {p.title.lower() for p in (profile.projects or [])}
        for proj in payload.projects:
            if proj.title.lower() not in existing_projects:
                new_proj = Project(
                    profile_id=profile.id,
                    title=proj.title,
                    description=proj.description,
                    technologies=proj.technologies,
                    project_url=proj.project_url,
                    start_date=proj.start_date,
                    end_date=proj.end_date,
                )
                db.add(new_proj)

    # 5. Add/Merge Education
    if payload.education:
        existing_edu = {(e.institution.lower(), e.degree.lower()) for e in (profile.education or [])}
        for edu in payload.education:
            key = (edu.institution.lower(), edu.degree.lower())
            if key not in existing_edu:
                new_edu = Education(
                    profile_id=profile.id,
                    institution=edu.institution,
                    degree=edu.degree,
                    field_of_study=edu.field_of_study,
                    start_date=edu.start_date,
                    end_date=edu.end_date,
                    gpa_or_honors=edu.gpa_or_honors,
                )
                db.add(new_edu)

    # 6. Add/Merge Certifications
    if payload.certifications:
        existing_certs = {c.name.lower() for c in (profile.certifications or [])}
        for cert in payload.certifications:
            if cert.name.lower() not in existing_certs:
                new_cert = Certification(
                    profile_id=profile.id,
                    name=cert.name,
                    issuing_organization=cert.issuing_organization,
                    issue_date=cert.issue_date,
                    expiration_date=cert.expiration_date,
                    credential_id=cert.credential_id,
                    credential_url=cert.credential_url,
                )
                db.add(new_cert)

    db.commit()
    db.refresh(profile)
    return profile

