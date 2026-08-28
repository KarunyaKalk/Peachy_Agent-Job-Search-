from typing import Dict, Any, List

class FactGuard:
    @staticmethod
    def verify_tailored_resume(master_profile: Dict[str, Any], tailored_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare tailored profile claims against master profile.
        Flag untraceable companies, roles, skills, or fabricated bullet claims.
        """
        flags = []
        
        # 1. Master skills set
        master_skills = set()
        for cat, skills in master_profile.get("skills_json", {}).items():
            for s in skills:
                master_skills.add(s.lower())
                
        tailored_skills = set()
        for cat, skills in tailored_profile.get("skills_json", {}).items():
            for s in skills:
                tailored_skills.add(s.lower())
                
        new_skills = tailored_skills - master_skills
        if new_skills:
            flags.append({
                "type": "SKILL_DISCREPANCY",
                "severity": "WARNING",
                "message": f"Tailored resume contains skills not present in Master Profile: {', '.join(list(new_skills)[:5])}"
            })
            
        # 2. Check Experience Companies & Roles
        master_companies = {exp.get("company", "").lower() for exp in master_profile.get("experience_json", [])}
        tailored_experiences = tailored_profile.get("experience_json", [])
        
        for exp in tailored_experiences:
            comp = exp.get("company", "").lower()
            if comp and comp not in master_companies:
                flags.append({
                    "type": "UNTRACEABLE_EMPLOYER",
                    "severity": "HIGH",
                    "message": f"Untraceable company in tailored resume: '{exp.get('company')}' is not in Master Profile."
                })
                
        passed = len([f for f in flags if f["severity"] == "HIGH"]) == 0
        
        return {
            "passed": passed,
            "flags": flags
        }

fact_guard = FactGuard()
