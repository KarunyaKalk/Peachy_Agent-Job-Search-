export type AuditCategory =
  | 'scrape_run'
  | 'resume_generation'
  | 'ats_score'
  | 'application_submitted'
  | 'email_sent'
  | 'captcha_blocked';

export type AuditStatus = 'success' | 'warning' | 'error' | 'captcha_blocked';

export interface AuditLogEntry {
  id: number;
  user_id: number;
  category: AuditCategory;
  action: string;
  details?: string;
  status: AuditStatus;
  timestamp: string;
}
