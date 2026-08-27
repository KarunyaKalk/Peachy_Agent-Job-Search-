export interface ExtractedCategory {
  technical_skills: string[];
  tools: string[];
  soft_skills: string[];
  certifications: string[];
  role_titles: string[];
}

export interface ResumeCheckerResponse {
  overall_ats_score: number;
  keyword_match_score: number;
  formatting_score: number;
  completeness_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  resume_keywords: ExtractedCategory;
  jd_keywords: ExtractedCategory;
  recommendations: string[];
  resume_preview_text?: string;
  jd_preview_text?: string;
}

export interface ResumeCheckerRequest {
  resume_text?: string;
  resume_source?: 'master_profile' | 'uploaded_text' | 'tailored_resume';
  jd_text?: string;
  jd_url?: string;
  job_id?: number;
}
