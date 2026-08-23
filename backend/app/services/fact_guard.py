from typing import List, Dict, Any
from app.models.profile import MasterProfile


class FactGuardService:
    """
    Automated Fact-Guard Engine.
    Diffs generated tailored content against the Master Profile to detect and flag
    any claim, skill, or metric not traceable to truthful source content.
    """

    @staticmethod
    def audit_tailored_resume(
        tailored_data: Dict[str, Any], master_profile: MasterProfile
    ) -> List[Dict[str, Any]]:
        flags = []

        # 1. Master Profile Baseline Collections
        master_skills = {s.name.lower(): s.name for s in (master_profile.skills or [])}
        master_companies = {e.company.lower(): e.company for e in (master_profile.experiences or [])}
        
        # Collect all master bullet texts & variants
        master_bullet_texts = []
        for exp in (master_profile.experiences or []):
            for bullet in (exp.bullets or []):
                master_bullet_texts.append(bullet.content.lower())
                for var in (bullet.variants or []):
                    master_bullet_texts.append(var.variant_text.lower())

        # 2. Audit Skills
        tailored_skills = tailored_data.get("skills", [])
        for skill_item in tailored_skills:
            skill_name = skill_item if isinstance(skill_item, str) else skill_item.get("name", "")
            if not skill_name:
                continue

            s_lower = skill_name.lower()
            if s_lower in master_skills or any(ms in s_lower or s_lower in ms for ms in master_skills):
                flags.append({
                    "field": "skills",
                    "claim": skill_name,
                    "status": "verified",
                    "reason": "Skill directly traceable to Master Profile skills inventory."
                })
            else:
                flags.append({
                    "field": "skills",
                    "claim": skill_name,
                    "status": "flagged",
                    "reason": f"Skill '{skill_name}' is not listed in your Master Profile inventory. Please confirm accuracy."
                })

        # 3. Audit Experiences & Bullets
        tailored_exps = tailored_data.get("experiences", [])
        for exp in tailored_exps:
            company = exp.get("company", "")
            if company and company.lower() in master_companies:
                flags.append({
                    "field": "company",
                    "claim": f"{exp.get('role')} at {company}",
                    "status": "verified",
                    "reason": "Employer and position verified against Master Profile history."
                })
            elif company:
                flags.append({
                    "field": "company",
                    "claim": f"{exp.get('role')} at {company}",
                    "status": "flagged",
                    "reason": f"Employer '{company}' does not match your Master Profile experience history."
                })

            bullets = exp.get("bullets", [])
            for bullet_text in bullets:
                b_lower = bullet_text.lower()
                
                # Check for direct or fuzzy word overlap with master bullets
                matched = any(
                    mb in b_lower or b_lower in mb or FactGuardService._word_overlap_ratio(mb, b_lower) > 0.4
                    for mb in master_bullet_texts
                )

                if matched:
                    flags.append({
                        "field": "bullets",
                        "claim": bullet_text[:60] + "...",
                        "status": "verified",
                        "reason": "Bullet claim verified as an authentic rephrasing of your Master Profile experience."
                    })
                else:
                    flags.append({
                        "field": "bullets",
                        "claim": bullet_text[:60] + "...",
                        "status": "flagged",
                        "reason": "Tailored bullet claim contains phrasing not directly found in master bullets. Requires manual review."
                    })

        return flags

    @staticmethod
    def _word_overlap_ratio(text1: str, text2: str) -> float:
        words1 = set(w for w in text1.split() if len(w) > 3)
        words2 = set(w for w in text2.split() if len(w) > 3)
        if not words1 or not words2:
            return 0.0
        intersection = words1.intersection(words2)
        return len(intersection) / float(min(len(words1), len(words2)))
