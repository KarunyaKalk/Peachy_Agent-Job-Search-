import re
import io
from typing import Dict, Any, List, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pdfplumber
from backend.services.gemini_service import gemini_service

class ATSChecker:
    @staticmethod
    def extract_text_and_audit_pdf(pdf_bytes: bytes) -> Tuple[str, List[str], List[str]]:
        """
        Extract text via pdfplumber and flag structural parseability issues
        (e.g., tables, images, multi-column bounding boxes).
        """
        text = ""
        structure_issues = []
        formatting_issues = []
        
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                if len(pdf.pages) == 0:
                    structure_issues.append("PDF appears empty or corrupted.")
                    return "", structure_issues, formatting_issues
                    
                for idx, page in enumerate(pdf.pages):
                    page_text = page.extract_text() or ""
                    text += page_text + "\n"
                    
                    # Audit tables
                    tables = page.extract_tables()
                    if tables:
                        structure_issues.append(f"Page {idx+1}: Contains {len(tables)} table layout(s) which can confuse ATS parsers.")
                        
                    # Audit images
                    if len(page.images) > 0:
                        structure_issues.append(f"Page {idx+1}: Contains graphic image elements which ATS cannot read.")
                        
                    # Audit multi-column heuristics (comparing element x-coordinates)
                    words = page.extract_words()
                    if words:
                        x0_coords = [w["x0"] for w in words]
                        mid_page = page.width / 2.0
                        left_col = sum(1 for x in x0_coords if x < mid_page - 20)
                        right_col = sum(1 for x in x0_coords if x > mid_page + 20)
                        if left_col > 20 and right_col > 20:
                            structure_issues.append(f"Page {idx+1}: Possible multi-column text layout detected.")
        except Exception as e:
            formatting_issues.append(f"PDF extraction warning: {str(e)}")
            
        return text.strip(), structure_issues, formatting_issues

    @staticmethod
    def compute_keyword_overlap(resume_text: str, jd_text: str) -> Tuple[float, List[str], List[str]]:
        """
        Compute TF-IDF cosine similarity score (0-100) and extract matched/missing keywords.
        """
        if not resume_text.strip() or not jd_text.strip():
            return 50.0, [], ["General technical skills"]

        # TF-IDF Cosine Similarity
        try:
            vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            score = round(min(100.0, similarity * 100 * 2.2), 1)
        except Exception:
            score = 75.0

        # Extract words for comparison
        jd_words = set(re.findall(r'\b[A-Za-z]{3,}\b', jd_text.lower()))
        resume_words = set(re.findall(r'\b[A-Za-z]{3,}\b', resume_text.lower()))
        
        common = [w.capitalize() for w in jd_words.intersection(resume_words) if len(w) > 3][:15]
        missing = [w.capitalize() for w in jd_words.difference(resume_words) if len(w) > 4][:10]

        return score, common, missing

    async def calculate_ats_score(self, resume_text: str, jd_text: str, pdf_bytes: Optional[bytes] = None) -> Dict[str, Any]:
        """
        Full ATS scoring pipeline:
        - Structural & formatting parseability check (30%)
        - Keyword & TF-IDF match (40%)
        - Section completeness (30%)
        """
        structure_issues = []
        formatting_issues = []
        
        if pdf_bytes:
            extracted_pdf_text, s_issues, f_issues = self.extract_text_and_audit_pdf(pdf_bytes)
            if extracted_pdf_text:
                resume_text = extracted_pdf_text
            structure_issues.extend(s_issues)
            formatting_issues.extend(f_issues)

        # Keyword overlap
        kw_score, matched_kws, missing_kws = self.compute_keyword_overlap(resume_text, jd_text)
        
        # Call Gemini for AI-driven refinement if key present
        ai_result = await gemini_service.extract_keywords_from_jd_and_resume(resume_text, jd_text)
        if ai_result.get("matched_keywords"):
            matched_kws = list(set(matched_kws + ai_result["matched_keywords"]))
        if ai_result.get("missing_keywords"):
            missing_kws = list(set(missing_kws + ai_result["missing_keywords"]))

        # Structure score calculation
        structure_score = 100.0 - (len(structure_issues) * 15) - (len(formatting_issues) * 10)
        structure_score = max(40.0, min(100.0, structure_score))

        # Section completeness score calculation
        completeness_checks = ["experience", "education", "skills", "summary"]
        completeness_hits = sum(1 for section in completeness_checks if section in resume_text.lower())
        completeness_score = (completeness_hits / len(completeness_checks)) * 100.0

        # Composite overall score
        overall_score = round(
            (kw_score * 0.40) + (structure_score * 0.30) + (completeness_score * 0.30),
            1
        )

        return {
            "overall_score": overall_score,
            "breakdown": {
                "keyword_match": round(kw_score, 1),
                "formatting_structure": round(structure_score, 1),
                "section_completeness": round(completeness_score, 1)
            },
            "matched_keywords": matched_kws[:12],
            "missing_keywords": missing_kws[:10],
            "formatting_issues": formatting_issues,
            "structure_issues": structure_issues
        }

    async def auto_revise_loop(self, master_profile: Dict[str, Any], jd_text: str, target_score: int = 89) -> Tuple[Dict[str, Any], Dict[str, Any], int]:
        """
        Auto-revise loop: if score < 89, send missing keywords + feedback back to tailoring service,
        re-score, cap at 3 iterations, and present best result.
        """
        best_score_data = None
        best_tailored_profile = None
        iterations = 0

        current_profile = master_profile

        for i in range(1, 4):
            iterations = i
            tailored = await gemini_service.tailor_resume(current_profile, jd_text)
            
            # Format text for scoring
            bullets_text = " ".join([
                b for exp in tailored.get("experience_json", []) for b in exp.get("bullets", [])
            ])
            skills_text = " ".join([
                s for cat, s_list in tailored.get("skills_json", {}).items() for s in s_list
            ])
            full_text = f"{tailored.get('summary', '')} {skills_text} {bullets_text}"

            score_data = await self.calculate_ats_score(full_text, jd_text)

            if best_score_data is None or score_data["overall_score"] > best_score_data["overall_score"]:
                best_score_data = score_data
                best_tailored_profile = tailored

            if score_data["overall_score"] >= target_score:
                break

            # Inject missing keywords into next iteration prompt guidance
            missing = score_data.get("missing_keywords", [])
            if missing and "skills_json" in tailored:
                cat = list(tailored["skills_json"].keys())[0] if tailored["skills_json"] else "Core Skills"
                tailored["skills_json"].setdefault(cat, []).extend(missing[:3])
                current_profile = tailored

        return best_tailored_profile, best_score_data, iterations

ats_checker = ATSChecker()
