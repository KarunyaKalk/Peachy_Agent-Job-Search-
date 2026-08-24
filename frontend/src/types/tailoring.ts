export interface FactGuardFlag {
  field: string;
  claim: string;
  status: 'verified' | 'flagged';
  reason: string;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface TailoredExperience {
  id?: number;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  bullets: string[];
}

export interface TailoredProject {
  id?: number;
  title: string;
  description?: string;
  tech_stack?: string;
  start_date?: string;
  end_date?: string;
  bullets?: string[];
}

export interface TailoredEducation {
  id?: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_date?: string;
  gpa?: string;
  honors?: string;
}

export interface TailoredCertification {
  id?: number;
  name: string;
  issuer?: string;
  issue_date?: string;
}

export interface SectionVisibility {
  summary: boolean;
  skills: boolean;
  experiences: boolean;
  projects: boolean;
  education: boolean;
  certifications?: boolean;
}

export interface TailoredJson {
  contact?: ContactInfo;
  summary: string;
  skills: string[];
  experiences: TailoredExperience[];
  projects?: TailoredProject[];
  education?: TailoredEducation[];
  certifications?: TailoredCertification[];
  visibility?: SectionVisibility;
}

export interface TailoredResume {
  id: number;
  user_id: number;
  job_id: number;
  version_number: number;
  summary?: string;
  tailored_json: TailoredJson;
  fact_guard_flags: FactGuardFlag[];
  status: 'draft' | 'approved' | 'finalized' | 'rejected';
  created_at: string;
  updated_at: string;
}
