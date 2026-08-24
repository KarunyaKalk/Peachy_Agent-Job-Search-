import { Job } from './job';
import { TailoredResume } from './tailoring';

export type ApplicationStatus =
  | 'Not Applied'
  | 'Ready to Apply'
  | 'Applied'
  | 'Under Review'
  | 'Interview'
  | 'Rejected'
  | 'Offer';

export interface ATSBreakdown {
  keyword_alignment_score: number;
  fact_guard_verified_claims: number;
  fact_guard_flagged_claims: number;
  skills_coverage_score: number;
}

export interface ReviewQueueItem {
  job: Job;
  tailored_resume: TailoredResume;
  ats_breakdown: ATSBreakdown;
  status: string;
}

export interface AttemptRecord {
  timestamp: string;
  status: string;
  message: string;
  resume_version?: number;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  resume_id?: number;
  resume_version: number;
  status: ApplicationStatus;
  notes?: string;
  submission_type?: 'direct_api' | 'form_fill';
  prefill_screenshot?: string;
  attempt_log?: AttemptRecord[];
  applied_at?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  resume?: TailoredResume;
}

export interface SubmissionTriggerResult {
  status: 'applied' | 'pending_confirmation' | 'failed';
  submission_type: 'direct_api' | 'form_fill';
  prefill_screenshot?: string;
  message: string;
  application: Application;
}
