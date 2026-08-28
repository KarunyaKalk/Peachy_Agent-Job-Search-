export interface MasterProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  summary: string;
  skills_json: Record<string, string[]>;
  experience_json: Array<{
    company: string;
    role: string;
    dates: string;
    location: string;
    bullets: string[];
    variants?: Record<string, string[]>;
  }>;
  projects_json: Array<{
    title: string;
    description: string;
    technologies: string[];
    link: string;
  }>;
  education_json: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  certifications_json: string[];
  keyword_fingerprint?: string[];
}

export interface JobPreference {
  id: number;
  target_roles: string[];
  seniority: string[];
  location_types: string[];
  preferred_cities: string[];
  salary_floor: number;
  industries_include: string[];
  industries_exclude: string[];
  company_sizes: string[];
  exclude_keywords: string[];
}

export interface Job {
  id: number;
  dedup_hash: string;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  seniority?: string;
  job_type: string;
  full_jd_text: string;
  source_platform: string;
  apply_url: string;
  posted_date?: string;
  match_score: number;
  is_hidden: boolean;
  created_at: string;
}

export interface TailoredResume {
  id: number;
  job_id?: number;
  version_number: number;
  tailored_text: string;
  structured_data: MasterProfile;
  pdf_filename?: string;
  ats_score: number;
  ats_breakdown: {
    overall_score?: number;
    breakdown?: {
      keyword_match: number;
      formatting_structure: number;
      section_completeness: number;
    };
    matched_keywords?: string[];
    missing_keywords?: string[];
    formatting_issues?: string[];
    structure_issues?: string[];
  };
  fact_check_passed: boolean;
  fact_check_flags: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

export interface Application {
  id: number;
  job_id: number;
  resume_id?: number;
  status: 'Not Applied' | 'Ready to Apply' | 'Applied' | 'Under Review' | 'Interview' | 'Rejected' | 'Offer';
  submission_type: string;
  notes: string;
  applied_at?: string;
  created_at: string;
  updated_at: string;
  job_title?: string;
  company?: string;
  match_score?: number;
}

export interface OutreachLog {
  id: number;
  job_id?: number;
  recipient_email: string;
  recipient_name: string;
  recipient_title: string;
  subject: string;
  body: string;
  status: string;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  source: string;
  status: string;
  details: string;
  metadata_json: Record<string, any>;
  timestamp: string;
}

export interface UserSettings {
  id: number;
  scan_frequency_hours: number;
  ats_threshold: number;
  auto_revise_target_score: number;
  daily_app_cap: number;
  daily_email_cap: number;
  platform_toggles: Record<string, boolean>;
  dark_mode: boolean;
}

export interface ATSCheckResult {
  overall_score: number;
  breakdown: {
    keyword_match: number;
    formatting_structure: number;
    section_completeness: number;
  };
  matched_keywords: string[];
  missing_keywords: string[];
  formatting_issues: string[];
  structure_issues: string[];
}
