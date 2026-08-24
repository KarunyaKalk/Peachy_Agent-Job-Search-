import { Job } from './job';

export interface HiringContact {
  name: string;
  title: string;
  email?: string;
  confidence_score: number;
  domain?: string;
  source?: string;
}

export interface ColdEmailDraft {
  id: number;
  user_id: number;
  job_id: number;
  contact_name: string;
  contact_title?: string;
  contact_email?: string;
  confidence_score: number;
  subject: string;
  body: string;
  status: 'draft' | 'ready' | 'sent';
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface DailyQuota {
  sent_today: number;
  daily_cap: number;
  remaining: number;
}

export interface OutreachRecord {
  id: number;
  user_id: number;
  job_id: number;
  application_id?: number;
  draft_id?: number;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'capped';
  error_message?: string;
  sent_at: string;
  job?: Job;
}
