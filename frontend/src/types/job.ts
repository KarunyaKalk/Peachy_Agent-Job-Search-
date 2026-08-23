export interface Job {
  id: number;
  user_id: number;
  dedup_hash: string;
  title: string;
  company: string;
  location: string;
  jd_text: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  seniority?: string;
  source_platform: string;
  posted_date?: string;
  apply_url: string;
  relevance_score: number;
  is_saved: boolean;
  is_discarded: boolean;
  created_at: string;
}

export interface JobScanResult {
  scanned_roles: string[];
  total_found: number;
  new_jobs_added: number;
  deduplicated_count: number;
  discarded_filtered: number;
  jobs: Job[];
}

export interface JobFilterParams {
  view_mode?: 'all' | 'saved' | 'discarded';
  source_platform?: 'Adzuna' | 'Wellfound' | 'Haveloc' | 'LinkedIn';
  search?: string;
  min_score?: number;
}
