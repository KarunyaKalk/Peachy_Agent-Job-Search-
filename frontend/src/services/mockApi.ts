import { User, AuthResponse } from '../types';
import { MasterProfile } from '../types/profile';
import { Job, JobScanResult } from '../types/job';
import { TailoredResume } from '../types/tailoring';

const MOCK_STORAGE_KEY_USER = 'peachy_mock_user_v1';
const MOCK_STORAGE_KEY_PROFILE = 'peachy_mock_profile_v1';
const MOCK_STORAGE_KEY_JOBS = 'peachy_mock_jobs_v1';

// Initial Mock Seed Profile
const initialProfile: MasterProfile = {
  id: 1,
  user_id: 1,
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  linkedin_url: 'https://linkedin.com/in/karunya',
  github_url: 'https://github.com/KarunyaKalk',
  portfolio_url: 'https://karunyakalk.dev',
  summary:
    'High-impact Senior Full Stack & AI Software Engineer with expertise in building scalable cloud microservices, high-concurrency event pipelines, and modern web applications.',
  skills: [
    { id: 1, name: 'Python', category: 'Backend', proficiency: 'Expert' },
    { id: 2, name: 'TypeScript', category: 'Languages', proficiency: 'Expert' },
    { id: 3, name: 'React', category: 'Frontend', proficiency: 'Expert' },
    { id: 4, name: 'FastAPI', category: 'Backend', proficiency: 'Expert' },
    { id: 5, name: 'PostgreSQL', category: 'Database', proficiency: 'Advanced' },
    { id: 6, name: 'Docker', category: 'DevOps', proficiency: 'Advanced' },
    { id: 7, name: 'Redis', category: 'Backend', proficiency: 'Advanced' },
  ],
  experiences: [
    {
      id: 1,
      company: 'Linear Tech',
      role: 'Senior Software Engineer',
      start_date: '2022-01',
      end_date: 'Present',
      is_current: true,
      location: 'San Francisco, CA',
      bullets: [
        {
          id: 101,
          content:
            'Architected WebSocket and Redis pub-sub event distribution pipeline handling over 100k concurrent client connections with sub-50ms latency.',
          variants: [
            {
              id: 1001,
              bullet_id: 101,
              tag: 'Scale & Performance',
              variant_text:
                'Spearheaded WebSocket/Redis pub-sub migration for sub-50ms real-time event streaming across 100k active clients.',
            },
          ],
        },
      ],
    },
  ],
  projects: [],
  education: [],
  certifications: [],
  preferences: {
    id: 1,
    target_roles: ['Senior Software Engineer', 'Full Stack Lead', 'AI Engineer'],
    seniority_levels: ['Senior', 'Lead'],
    job_types: ['Full-time'],
    work_modes: ['Remote', 'Hybrid'],
    preferred_locations: ['Remote', 'San Francisco, CA', 'New York, NY'],
    salary_floor: 140000,
    salary_currency: 'USD',
    included_industries: ['SaaS', 'Artificial Intelligence', 'Developer Tools'],
    excluded_industries: ['Crypto', 'Gambling'],
    company_sizes: ['50-200 employees'],
    excluded_keywords: ['Junior', 'Unpaid', 'Legacy'],
  },
};

// Initial Mock Seed Jobs
const initialJobs: Job[] = [
  {
    id: 1,
    user_id: 1,
    dedup_hash: 'hash1',
    title: 'Senior Full Stack Engineer',
    company: 'Linear',
    location: 'Remote',
    jd_text:
      '### Role Overview\nWe are looking for a Senior Full Stack Engineer to lead web performance and cloud microservices.\n\n### Tech Stack\nReact, TypeScript, Node.js, Python, PostgreSQL, Redis.',
    salary_min: 150000,
    salary_max: 190000,
    salary_currency: 'USD',
    seniority: 'Senior',
    source_platform: 'Adzuna',
    posted_date: '2026-08-22',
    apply_url: 'https://linear.app/careers/senior-full-stack',
    relevance_score: 99,
    is_saved: true,
    is_discarded: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    dedup_hash: 'hash2',
    title: 'AI Software Engineer',
    company: 'Anthropic',
    location: 'San Francisco, CA (Remote)',
    jd_text:
      '### Role Overview\nJoin Anthropic to build resilient cloud infrastructure and modern developer tooling.\n\n### Requirements\nPython, Distributed Systems, Microservices, Kubernetes, FastAPI.',
    salary_min: 165000,
    salary_max: 210000,
    salary_currency: 'USD',
    seniority: 'Senior',
    source_platform: 'Wellfound',
    posted_date: '1 day ago',
    apply_url: 'https://wellfound.com/jobs/anthropic/ai-engineer',
    relevance_score: 98,
    is_saved: false,
    is_discarded: false,
    created_at: new Date().toISOString(),
  },
];

export const mockApiEngine = {
  register: (email: string, password: string, full_name?: string): AuthResponse => {
    const user: User = {
      id: 1,
      email: email.trim().toLowerCase(),
      full_name: full_name || 'Karunya Kalkhundiya',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(user));
    return {
      access_token: 'mock_jwt_token_peachy_demo_mode',
      token_type: 'bearer',
    };
  },

  login: (email: string, password: string): AuthResponse => {
    return {
      access_token: 'mock_jwt_token_peachy_demo_mode',
      token_type: 'bearer',
    };
  },

  getProfile: (): MasterProfile => {
    try {
      const saved = localStorage.getItem(MOCK_STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(initialProfile));
    return initialProfile;
  },

  updateProfile: (profileData: Partial<MasterProfile>): MasterProfile => {
    const current = mockApiEngine.getProfile();
    const updated = { ...current, ...profileData };
    localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(updated));
    return updated;
  },

  getJobs: (params?: any): Job[] => {
    try {
      const saved = localStorage.getItem(MOCK_STORAGE_KEY_JOBS);
      let list: Job[] = saved ? JSON.parse(saved) : initialJobs;

      if (params?.view_mode === 'saved') {
        list = list.filter((j) => j.is_saved);
      } else if (params?.view_mode === 'discarded') {
        list = list.filter((j) => j.is_discarded);
      } else {
        list = list.filter((j) => !j.is_discarded);
      }

      if (params?.source_platform) {
        list = list.filter((j) => j.source_platform === params.source_platform);
      }

      if (params?.min_score) {
        list = list.filter((j) => j.relevance_score >= params.min_score);
      }

      return list;
    } catch {
      return initialJobs;
    }
  },

  triggerScan: (): JobScanResult => {
    const jobs = mockApiEngine.getJobs();
    return {
      scanned_roles: ['Senior Software Engineer', 'AI Engineer'],
      total_found: jobs.length,
      new_jobs_added: 3,
      deduplicated_count: 5,
      discarded_filtered: 2,
      jobs: jobs,
    };
  },

  importLinkedInJob: (url: string): Job => {
    const newJob: Job = {
      id: Date.now(),
      user_id: 1,
      dedup_hash: `linkedin_${Date.now()}`,
      title: 'Senior Software Engineer (LinkedIn Import)',
      company: 'LinkedIn Verified Opportunity',
      location: 'Remote / Hybrid',
      jd_text: `### Imported LinkedIn Job Posting\nURL: ${url}\n\nHigh impact engineering role imported via Peachy LinkedIn Manual Assist.`,
      salary_min: 145000,
      salary_max: 185000,
      salary_currency: 'USD',
      seniority: 'Senior',
      source_platform: 'LinkedIn',
      posted_date: 'Just Now',
      apply_url: url,
      relevance_score: 99,
      is_saved: true,
      is_discarded: false,
      created_at: new Date().toISOString(),
    };

    const currentJobs = mockApiEngine.getJobs();
    const updated = [newJob, ...currentJobs];
    localStorage.setItem(MOCK_STORAGE_KEY_JOBS, JSON.stringify(updated));
    return newJob;
  },

  generateTailoredResume: (jobId: number): TailoredResume => {
    const jobs = mockApiEngine.getJobs();
    const targetJob = jobs.find((j) => j.id === jobId) || jobs[0];

    const tailored: TailoredResume = {
      id: Date.now(),
      user_id: 1,
      job_id: jobId,
      version_number: 1,
      summary: `Results-oriented Senior Engineer tailored specifically for ${targetJob.company}, emphasizing clean API contracts and cloud infrastructure.`,
      tailored_json: {
        summary: `Results-oriented Senior Engineer tailored specifically for ${targetJob.company}, emphasizing clean API contracts and cloud infrastructure.`,
        skills: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis'],
        experiences: [
          {
            company: targetJob.company,
            role: targetJob.title,
            location: 'Remote',
            start_date: '2022-01',
            end_date: 'Present',
            bullets: [
              'Spearheaded WebSocket/Redis pub-sub migration for sub-50ms real-time event streaming across 100k active clients.',
            ],
          },
        ],
      },
      fact_guard_flags: [
        {
          field: 'company',
          claim: `${targetJob.title} at ${targetJob.company}`,
          status: 'verified',
          reason: 'Employer and position verified against Master Profile history.',
        },
        {
          field: 'bullets',
          claim: 'Spearheaded WebSocket/Redis pub-sub migration...',
          status: 'verified',
          reason: 'Bullet claim verified as an authentic rephrasing of your Master Profile experience.',
        },
      ],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return tailored;
  },
};
