export interface BulletVariant {
  id?: number;
  bullet_id?: number;
  variant_text: string;
  tag?: string;
}

export interface ExperienceBullet {
  id?: number;
  experience_id?: number;
  content: string;
  impact_category?: string;
  display_order?: number;
  variants?: BulletVariant[];
}

export interface WorkExperience {
  id?: number;
  profile_id?: number;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  display_order?: number;
  bullets?: ExperienceBullet[];
}

export interface Skill {
  id?: number;
  profile_id?: number;
  category: string;
  name: string;
  proficiency?: string;
}

export interface Project {
  id?: number;
  profile_id?: number;
  title: string;
  description?: string;
  technologies?: string;
  project_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface Education {
  id?: number;
  profile_id?: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa_or_honors?: string;
}

export interface Certification {
  id?: number;
  profile_id?: number;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface JobPreferences {
  id?: number;
  profile_id?: number;
  target_roles: string[];
  seniority_levels: string[];
  job_types: string[];
  work_modes: string[];
  preferred_locations: string[];
  salary_floor: number;
  salary_currency: string;
  included_industries: string[];
  excluded_industries: string[];
  company_sizes: string[];
  excluded_keywords: string[];
}

export interface MasterProfile {
  id: number;
  user_id: number;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  summary?: string;
  skills: Skill[];
  experiences: WorkExperience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  preferences: JobPreferences;
}
