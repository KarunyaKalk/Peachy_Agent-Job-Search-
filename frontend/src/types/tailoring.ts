export interface FactGuardFlag {
  field: string;
  claim: string;
  status: 'verified' | 'flagged';
  reason: string;
}

export interface TailoredExperience {
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  bullets: string[];
}

export interface TailoredJson {
  summary: string;
  skills: string[];
  experiences: TailoredExperience[];
}

export interface TailoredResume {
  id: number;
  user_id: number;
  job_id: number;
  version_number: number;
  summary?: string;
  tailored_json: TailoredJson;
  fact_guard_flags: FactGuardFlag[];
  status: 'draft' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
