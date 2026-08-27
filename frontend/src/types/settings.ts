export interface SystemSettings {
  id: number;
  user_id: number;
  scan_frequency_hours: number;
  ats_score_threshold: number;
  daily_application_cap: number;
  daily_cold_email_cap: number;
  adzuna_enabled: boolean;
  wellfound_enabled: boolean;
  haveloc_enabled: boolean;
  linkedin_enabled: boolean;
  telegram_webhook_url?: string;
  email_webhook_url?: string;
  created_at: string;
  updated_at: string;
}
