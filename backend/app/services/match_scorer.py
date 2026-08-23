from typing import List, Optional
from app.models.profile import MasterProfile, JobPreferences


class MatchScorer:
    """
    Computes a 0-100 relevance score for a job posting by comparing its text,
    location, and compensation against the user's Master Profile & JobPreferences.
    """

    @staticmethod
    def calculate_relevance(
        title: str,
        company: str,
        location: str,
        jd_text: str,
        salary_min: Optional[float],
        salary_max: Optional[float],
        profile: MasterProfile,
        preferences: Optional[JobPreferences] = None,
    ) -> int:
        score = 50.0  # Base starting score

        title_lower = title.lower()
        jd_lower = (title + " " + jd_text).lower()

        # 1. Target Role Title Match (Up to +25 points)
        target_roles = preferences.target_roles if preferences else ["Software Engineer"]
        role_matched = False
        for target in target_roles:
            target_clean = target.lower()
            if target_clean in title_lower:
                score += 25.0
                role_matched = True
                break
            else:
                # Partial word match (e.g. "Full Stack" in "Senior Full Stack Dev")
                words = [w for w in target_clean.split() if len(w) > 3]
                if words and any(w in title_lower for w in words):
                    score += 15.0
                    role_matched = True
                    break
        if not role_matched:
            score += 5.0

        # 2. Skill Keyword Overlap Match (Up to +25 points)
        profile_skills = [s.name.lower() for s in (profile.skills or []) if len(s.name) > 1]
        if profile_skills:
            matched_skills_count = sum(1 for skill in profile_skills if skill in jd_lower)
            match_ratio = matched_skills_count / min(len(profile_skills), 10)
            score += min(match_ratio * 25.0, 25.0)
        else:
            # Baseline if no skills added yet
            score += 10.0

        # 3. Preferred Location Match (Up to +15 points)
        preferred_locs = preferences.preferred_locations if preferences else ["Remote"]
        loc_lower = location.lower()
        if any(p_loc.lower() in loc_lower or ("remote" in p_loc.lower() and "remote" in loc_lower) for p_loc in preferred_locs):
            score += 15.0
        else:
            score += 5.0

        # 4. Salary Floor Match (Up to +10 points)
        salary_floor = preferences.salary_floor if preferences else 120000
        if salary_min or salary_max:
            cmp_salary = salary_max or salary_min or 0
            if cmp_salary >= salary_floor:
                score += 10.0
            elif cmp_salary < salary_floor * 0.8:
                score -= 15.0  # Penalty for compensation significantly below floor

        # 5. Excluded Keywords Penalty (-30 points if matched)
        excluded_keywords = [k.lower() for k in (preferences.excluded_keywords if preferences else [])]
        if any(kw in jd_lower for kw in excluded_keywords):
            score -= 30.0

        # Clamp score between 10 and 99
        final_score = int(round(score))
        return max(10, min(final_score, 99))
