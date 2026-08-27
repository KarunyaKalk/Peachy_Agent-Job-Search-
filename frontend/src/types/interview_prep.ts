export interface STARAnswer {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface TechnicalPrepItem {
  id: string;
  question: string;
  topic: string;
  expected_answer: string;
  notes?: string;
  is_completed: boolean;
}

export interface BehavioralPrepItem {
  id: string;
  question: string;
  competency: string;
  star_answer: STARAnswer;
  notes?: string;
  is_completed: boolean;
}

export interface InterviewPrepPack {
  id: number;
  user_id: number;
  job_id: number;
  company_name: string;
  role_title: string;
  company_overview?: string;
  technical_questions: TechnicalPrepItem[];
  behavioral_questions: BehavioralPrepItem[];
  key_skills_to_highlight: string[];
  created_at: string;
  updated_at: string;
}
