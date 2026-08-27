import { User, AuthResponse } from '../types';
import { MasterProfile, ResumeParseResponse, ApplyParsedResumePayload } from '../types/profile';
import { Job, JobScanResult } from '../types/job';
import { TailoredResume } from '../types/tailoring';
import { extractTextFromClientFile, parseRawResumeText } from './resumeParserClient';

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

  uploadResume: async (file: File): Promise<ResumeParseResponse> => {
    const current = mockApiEngine.getProfile();
    try {
      const rawText = await extractTextFromClientFile(file);
      return parseRawResumeText(rawText, current);
    } catch (e) {
      console.error('Client-side resume text extraction failed:', e);
      return parseRawResumeText(file.name || '', current);
    }
  },


  applyParsedResume: (payload: ApplyParsedResumePayload): MasterProfile => {
    const current = mockApiEngine.getProfile();
    const updated = { ...current };

    if (payload.contact_summary) {
      Object.assign(updated, payload.contact_summary);
    }
    if (payload.skills && payload.skills.length > 0) {
      updated.skills = [...(updated.skills || []), ...payload.skills];
    }
    if (payload.experiences && payload.experiences.length > 0) {
      updated.experiences = [...(updated.experiences || []), ...payload.experiences];
    }
    if (payload.projects && payload.projects.length > 0) {
      updated.projects = [...(updated.projects || []), ...payload.projects];
    }
    if (payload.education && payload.education.length > 0) {
      updated.education = [...(updated.education || []), ...payload.education];
    }
    if (payload.certifications && payload.certifications.length > 0) {
      updated.certifications = [...(updated.certifications || []), ...payload.certifications];
    }

    return mockApiEngine.updateProfile(updated);
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
    const STORAGE_KEY_RESUMES = 'peachy_mock_resumes_v1';
    let savedResumes: TailoredResume[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
      if (raw) savedResumes = JSON.parse(raw);
    } catch {}

    const jobResumes = savedResumes.filter((r) => r.job_id === jobId);
    const jobs = mockApiEngine.getJobs();
    const targetJob = jobs.find((j) => j.id === jobId) || jobs[0];

    const nextVersion = jobResumes.length > 0 ? Math.max(...jobResumes.map((r) => r.version_number)) + 1 : 1;

    const profile = mockApiEngine.getProfile();

    const tailored: TailoredResume = {
      id: Date.now(),
      user_id: 1,
      job_id: jobId,
      version_number: nextVersion,
      summary: `Results-oriented Senior Engineer tailored specifically for ${targetJob.company}, emphasizing clean API contracts and cloud infrastructure.`,
      tailored_json: {
        contact: {
          name: 'Karunya Kalkhundiya',
          phone: profile.phone || '+1 (555) 234-5678',
          location: profile.location || 'San Francisco, CA',
          email: 'karunya@example.com',
          linkedin_url: profile.linkedin_url || 'https://linkedin.com/in/karunya',
          github_url: profile.github_url || 'https://github.com/KarunyaKalk',
          portfolio_url: profile.portfolio_url || 'https://karunyakalk.dev',
        },
        summary: `Results-oriented Senior Engineer tailored specifically for ${targetJob.company}, emphasizing clean API contracts and cloud infrastructure.`,
        skills: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis'],
        experiences: [
          {
            id: 1,
            company: targetJob.company,
            role: targetJob.title,
            location: 'Remote',
            start_date: '2022-01',
            end_date: 'Present',
            bullets: [
              'Spearheaded WebSocket/Redis pub-sub migration for sub-50ms real-time event streaming across 100k active clients.',
              'Designed scalable backend microservices and RESTful API endpoints for multi-tenant applications.',
            ],
          },
        ],
        projects: [
          {
            id: 101,
            title: 'Peachy AI Agent System',
            tech_stack: 'Python, FastAPI, WeasyPrint, React, TypeScript',
            start_date: '2024-01',
            end_date: 'Present',
            description: 'Automated ATS job search & resume tailoring agent with zero hallucinated claims.',
            bullets: ['Implemented WeasyPrint ATS PDF renderer with versioned history control.'],
          },
        ],
        education: [
          {
            id: 201,
            institution: 'University of California, Berkeley',
            degree: 'Bachelor of Science',
            field_of_study: 'Computer Science',
            graduation_date: '2021',
            gpa: '3.9 / 4.0',
          },
        ],
        visibility: {
          summary: true,
          skills: true,
          experiences: true,
          projects: true,
          education: true,
        },
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

    savedResumes.unshift(tailored);
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(savedResumes));
    return tailored;
  },

  getResumeVersions: (jobId: number): TailoredResume[] => {
    const STORAGE_KEY_RESUMES = 'peachy_mock_resumes_v1';
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
      if (raw) {
        const list: TailoredResume[] = JSON.parse(raw);
        const filtered = list.filter((r) => r.job_id === jobId).sort((a, b) => b.version_number - a.version_number);
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    const initial = mockApiEngine.generateTailoredResume(jobId);
    return [initial];
  },

  getResumeVersion: (versionId: number): TailoredResume => {
    const STORAGE_KEY_RESUMES = 'peachy_mock_resumes_v1';
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
      if (raw) {
        const list: TailoredResume[] = JSON.parse(raw);
        const found = list.find((r) => r.id === versionId);
        if (found) return found;
      }
    } catch {}
    return mockApiEngine.generateTailoredResume(1);
  },

  updateTailoredResumeMock: (
    resumeId: number,
    data: { summary?: string; tailored_json?: any; status?: any }
  ): TailoredResume => {
    const STORAGE_KEY_RESUMES = 'peachy_mock_resumes_v1';
    let list: TailoredResume[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
      if (raw) list = JSON.parse(raw);
    } catch {}

    const index = list.findIndex((r) => r.id === resumeId);
    if (index !== -1) {
      if (data.summary !== undefined) list[index].summary = data.summary;
      if (data.tailored_json !== undefined) list[index].tailored_json = data.tailored_json;
      if (data.status !== undefined) list[index].status = data.status;
      list[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(list));
      return list[index];
    }

    const created = mockApiEngine.generateTailoredResume(1);
    if (data.status) created.status = data.status;
    if (data.summary) created.summary = data.summary;
    return created;
  },

  getReviewQueue: (): any[] => {

    const STORAGE_KEY_RESUMES = 'peachy_mock_resumes_v1';
    const STORAGE_KEY_APPS = 'peachy_mock_apps_v1';
    
    let resumes: TailoredResume[] = [];
    try {
      const rawResumes = localStorage.getItem(STORAGE_KEY_RESUMES);
      if (rawResumes) resumes = JSON.parse(rawResumes);
    } catch {}

    if (resumes.length === 0) {
      const initial1 = mockApiEngine.generateTailoredResume(1);
      const initial2 = mockApiEngine.generateTailoredResume(2);
      resumes = [initial1, initial2];
    }

    let apps: any[] = [];
    try {
      const rawApps = localStorage.getItem(STORAGE_KEY_APPS);
      if (rawApps) apps = JSON.parse(rawApps);
    } catch {}

    const jobs = mockApiEngine.getJobs();

    const queueItems: any[] = [];
    const processedJobIds = new Set(apps.map((a) => a.job_id));

    for (const res of resumes) {
      if (processedJobIds.has(res.job_id) || res.status === 'rejected') continue;
      
      const job = jobs.find((j) => j.id === res.job_id) || jobs[0];
      processedJobIds.add(res.job_id);

      queueItems.push({
        job,
        tailored_resume: res,
        ats_breakdown: {
          keyword_alignment_score: Math.min(99, job.relevance_score),
          fact_guard_verified_claims: res.fact_guard_flags?.filter((f) => f.status === 'verified').length || 3,
          fact_guard_flagged_claims: res.fact_guard_flags?.filter((f) => f.status === 'flagged').length || 0,
          skills_coverage_score: 95,
        },
        status: 'pending_review',
      });
    }

    return queueItems;
  },

  approveApplicationMock: (jobId: number, notes?: string): any => {
    const STORAGE_KEY_APPS = 'peachy_mock_apps_v1';
    let apps: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPS);
      if (raw) apps = JSON.parse(raw);
    } catch {}

    const jobs = mockApiEngine.getJobs();
    const job = jobs.find((j) => j.id === jobId) || jobs[0];
    const resume = mockApiEngine.getResumeVersions(jobId)[0];

    const index = apps.findIndex((a) => a.job_id === jobId);
    const updatedApp = {
      id: index !== -1 ? apps[index].id : Date.now(),
      user_id: 1,
      job_id: jobId,
      resume_id: resume.id,
      resume_version: resume.version_number,
      status: 'Ready to Apply',
      notes: notes || `Approved tailored resume v${resume.version_number}.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      job,
      resume,
    };

    if (index !== -1) {
      apps[index] = updatedApp;
    } else {
      apps.unshift(updatedApp);
    }

    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    return updatedApp;
  },

  rejectApplicationMock: (jobId: number, notes?: string): any => {
    const STORAGE_KEY_APPS = 'peachy_mock_apps_v1';
    let apps: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPS);
      if (raw) apps = JSON.parse(raw);
    } catch {}

    const jobs = mockApiEngine.getJobs();
    const job = jobs.find((j) => j.id === jobId) || jobs[0];
    const resume = mockApiEngine.getResumeVersions(jobId)[0];

    const updatedApp = {
      id: Date.now(),
      user_id: 1,
      job_id: jobId,
      resume_id: resume.id,
      resume_version: resume.version_number,
      status: 'Rejected',
      notes: notes || 'Rejected during review queue evaluation.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      job,
      resume,
    };

    apps.unshift(updatedApp);
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    return updatedApp;
  },

  getApplicationsMock: (statusFilter?: string): any[] => {
    const STORAGE_KEY_APPS = 'peachy_mock_apps_v1';
    let apps: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPS);
      if (raw) apps = JSON.parse(raw);
    } catch {}

    if (apps.length === 0) {
      // Seed default applications if empty
      const job1 = mockApiEngine.getJobs()[0];
      const res1 = mockApiEngine.getResumeVersions(job1.id)[0];
      apps = [
        {
          id: 1001,
          user_id: 1,
          job_id: job1.id,
          resume_id: res1.id,
          resume_version: res1.version_number,
          status: 'Ready to Apply',
          notes: 'Tailored resume finalized. Waiting for automated Playwright submission.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          job: job1,
          resume: res1,
        },
      ];
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    }

    if (statusFilter && statusFilter.toLowerCase() !== 'all') {
      return apps.filter((a) => a.status.toLowerCase() === statusFilter.toLowerCase());
    }

    return apps;
  },

  updateApplicationMock: (id: number, data: { status?: string; notes?: string }): any => {
    const STORAGE_KEY_APPS = 'peachy_mock_apps_v1';
    let apps: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPS);
      if (raw) apps = JSON.parse(raw);
    } catch {}

    const index = apps.findIndex((a) => a.id === id);
    if (index !== -1) {
      if (data.status) apps[index].status = data.status;
      if (data.notes !== undefined) apps[index].notes = data.notes;
      apps[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
      return apps[index];
    }
    return null;
  },

  submitApplicationMock: (id: number): any => {
    const STORAGE_KEY_APPS = 'peachy_mock_apps_v1';
    let apps: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPS);
      if (raw) apps = JSON.parse(raw);
    } catch {}

    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const app = apps[index];
    const job = app.job || mockApiEngine.getJobs().find((j) => j.id === app.job_id);
    const platform = (job?.source_platform || '').toLowerCase();

    const timestamp = new Date().toISOString();

    if (platform.includes('adzuna')) {
      // Direct API Submission
      app.status = 'Applied';
      app.submission_type = 'direct_api';
      app.applied_at = timestamp;
      app.attempt_log = [
        ...(app.attempt_log || []),
        {
          timestamp,
          status: 'Applied',
          message: `Direct API submission executed for ${job?.company || 'Employer'}.`,
          resume_version: app.resume_version,
        },
      ];
      apps[index] = app;
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));

      return {
        status: 'applied',
        submission_type: 'direct_api',
        message: `Direct submission completed for ${job?.company}.`,
        application: app,
      };
    } else {
      // Form-fill with Playwright Hard Pause
      const svgPreview = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" style="background:#0f172a; font-family:sans-serif;">
          <rect x="20" y="20" width="560" height="340" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="40" y="60" fill="#38bdf8" font-size="18" font-weight="bold">Pre-Filled Form: ${job?.title} @ ${job?.company}</text>
          <rect x="420" y="38" width="140" height="24" rx="4" fill="#f59e0b"/>
          <text x="430" y="54" fill="#000" font-size="10" font-weight="bold">PAUSED BEFORE SUBMIT</text>
          <text x="40" y="110" fill="#94a3b8" font-size="12">NAME: Karunya Kalkhundiya</text>
          <text x="40" y="135" fill="#94a3b8" font-size="12">EMAIL: karunya@example.com</text>
          <text x="40" y="160" fill="#94a3b8" font-size="12">RESUME: Resume_${(job?.company || 'Company').replace(/\s+/g, '_')}_v${app.resume_version}.pdf</text>
          <rect x="40" y="190" width="520" height="45" rx="6" fill="#0284c7"/>
          <text x="60" y="218" fill="#fff" font-size="13" font-weight="bold">✓ ATS PDF Resume Attached & Form Pre-filled by Playwright</text>
          <rect x="40" y="260" width="520" height="40" rx="6" fill="#22c55e" opacity="0.7"/>
          <text x="170" y="285" fill="#fff" font-size="14" font-weight="bold">HARD PAUSE: CLICK CONFIRM TO SUBMIT</text>
        </svg>
      `;

      const screenshotBase64 = 'data:image/svg+xml;base64,' + btoa(svgPreview);

      app.submission_type = 'form_fill';
      app.prefill_screenshot = screenshotBase64;
      app.attempt_log = [
        ...(app.attempt_log || []),
        {
          timestamp,
          status: 'Ready to Apply',
          message: `Playwright pre-filled application form for ${job?.company}. Hard pause active awaiting user confirmation.`,
          resume_version: app.resume_version,
        },
      ];
      apps[index] = app;
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));

      return {
        status: 'pending_confirmation',
        submission_type: 'form_fill',
        prefill_screenshot: screenshotBase64,
        message: `Playwright pre-filled application form for ${job?.company}. Confirmation required.`,
        application: app,
      };
    }
  },

  confirmSubmissionMock: (id: number): any => {
    const STORAGE_KEY_APPS = 'peachy_mock_apps_v1';
    let apps: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPS);
      if (raw) apps = JSON.parse(raw);
    } catch {}

    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const app = apps[index];
    const job = app.job || mockApiEngine.getJobs().find((j) => j.id === app.job_id);
    const timestamp = new Date().toISOString();

    app.status = 'Applied';
    app.applied_at = timestamp;
    app.attempt_log = [
      ...(app.attempt_log || []),
      {
        timestamp,
        status: 'Applied',
        message: `Confirmed and submitted application for ${job?.company || 'Employer'} following user authorization.`,
        resume_version: app.resume_version,
      },
    ];

    apps[index] = app;
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));

    return {
      status: 'applied',
      submission_type: app.submission_type || 'form_fill',
      prefill_screenshot: app.prefill_screenshot,
      message: `Application for ${job?.company} submitted successfully!`,
      application: app,
    };
  },

  getKanbanBoardMock: (): Record<string, any[]> => {
    const apps = mockApiEngine.getApplicationsMock();
    const kanban: Record<string, any[]> = {
      'Ready to Apply': [],
      'Applied': [],
      'Under Review': [],
      'Interview': [],
      'Offer': [],
      'Rejected': [],
    };

    for (const app of apps) {
      const key = kanban[app.status] ? app.status : 'Ready to Apply';
      kanban[key].push(app);
    }

    return kanban;
  },

  findContactsMock: (jobId: number): any[] => {
    const jobs = mockApiEngine.getJobs();
    const job = jobs.find((j) => j.id === jobId) || jobs[0];
    const cleanComp = job.company.trim();
    const domain = `${cleanComp.toLowerCase().replace(/\s+/g, '')}.com`;


    return [
      {
        name: 'Alex Rivera',
        title: `Head of Engineering @ ${cleanComp}`,
        email: `arivera@${domain}`,
        confidence_score: 95,
        domain: domain,
        source: 'Hunter.io Verified Domain Search',
      },
      {
        name: 'Sarah Chen',
        title: `Senior Technical Recruiting Lead @ ${cleanComp}`,
        email: `sarah.chen@${domain}`,
        confidence_score: 92,
        domain: domain,
        source: 'Hunter.io Verified Domain Search',
      },
      {
        name: 'David Vance',
        title: `VP of Technology @ ${cleanComp}`,
        email: `dvance@${domain}`,
        confidence_score: 88,
        domain: domain,
        source: 'Hunter.io Pattern Search',
      },
    ];
  },

  generateColdEmailMock: (payload: {
    job_id: number;
    contact_name: string;
    contact_title?: string;
    contact_email?: string;
    confidence_score?: number;
  }): any => {
    const STORAGE_KEY_OUTREACH = 'peachy_mock_outreach_v1';
    let drafts: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OUTREACH);
      if (raw) drafts = JSON.parse(raw);
    } catch {}

    const jobs = mockApiEngine.getJobs();
    const job = jobs.find((j) => j.id === payload.job_id) || jobs[0];
    const firstName = payload.contact_name.split(' ')[0] || 'Hiring Manager';

    const subject = `${job.title} position — Karunya Kalkhundiya x ${job.company}`;
    const body = `Hi ${firstName},

I hope this week is treating you well! I saw that ${job.company} is expanding engineering efforts for the ${job.title} position. Given your leadership as ${payload.contact_title || 'Hiring Manager'}, I wanted to reach out directly.

I'm a Senior Full Stack & AI Engineer specializing in high-performance cloud microservices and real-time event distribution. A few quick highlights:

• Architected WebSocket & Redis pub-sub event distribution pipeline handling over 100k active clients with sub-50ms latency.
• Optimized database queries and API microservices to improve overall system throughput.

I've put together a tailored ATS resume specifically aligned with ${job.company}'s engineering stack. Would you have 10 minutes next Tuesday for a brief chat or code sample preview?

Best regards,

Karunya Kalkhundiya
github.com/KarunyaKalk | karunyakalk.dev`;

    const draft = {
      id: Date.now(),
      user_id: 1,
      job_id: payload.job_id,
      contact_name: payload.contact_name,
      contact_title: payload.contact_title || 'Hiring Manager',
      contact_email: payload.contact_email || `contact@${job.company.toLowerCase()}.com`,
      confidence_score: payload.confidence_score || 92,
      subject,
      body,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      job,
    };

    drafts.unshift(draft);
    localStorage.setItem(STORAGE_KEY_OUTREACH, JSON.stringify(drafts));
    return draft;
  },

  getColdEmailDraftsMock: (jobId?: number): any[] => {
    const STORAGE_KEY_OUTREACH = 'peachy_mock_outreach_v1';
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OUTREACH);
      if (raw) {
        const list: any[] = JSON.parse(raw);
        if (jobId) return list.filter((d) => d.job_id === jobId);
        return list;
      }
    } catch {}
    return [];
  },

  updateColdEmailDraftMock: (draftId: number, payload: { subject?: string; body?: string; status?: string }): any => {
    const STORAGE_KEY_OUTREACH = 'peachy_mock_outreach_v1';
    let drafts: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OUTREACH);
      if (raw) drafts = JSON.parse(raw);
    } catch {}

    const index = drafts.findIndex((d) => d.id === draftId);
    if (index !== -1) {
      if (payload.subject !== undefined) drafts[index].subject = payload.subject;
      if (payload.body !== undefined) drafts[index].body = payload.body;
      if (payload.status !== undefined) drafts[index].status = payload.status;
      drafts[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_OUTREACH, JSON.stringify(drafts));
      return drafts[index];
    }
    return null;
  },

  sendColdEmailMock: (draftId: number): any => {
    const STORAGE_KEY_OUTREACH = 'peachy_mock_outreach_v1';
    const STORAGE_KEY_LOG = 'peachy_mock_outreach_log_v1';

    let drafts: any[] = [];
    let logs: any[] = [];
    try {
      const rawD = localStorage.getItem(STORAGE_KEY_OUTREACH);
      if (rawD) drafts = JSON.parse(rawD);
      const rawL = localStorage.getItem(STORAGE_KEY_LOG);
      if (rawL) logs = JSON.parse(rawL);
    } catch {}

    const draftIndex = drafts.findIndex((d) => d.id === draftId);
    if (draftIndex === -1) return null;

    const draft = drafts[draftIndex];

    // Calculate sent today
    const todayStr = new Date().toISOString().split('T')[0];
    const sentToday = logs.filter((l) => l.sent_at && l.sent_at.startsWith(todayStr)).length;

    if (sentToday >= 15) {
      throw new Error('Daily send cap reached (15/15). Sending paused until tomorrow.');
    }

    const optOutFooter = "\n\n---\nIf you prefer not to receive further emails regarding engineering roles, please reply 'unsubscribe'.";
    let fullBody = draft.body ? draft.body.trim() : '';
    if (!fullBody.toLowerCase().includes("reply 'unsubscribe'")) {
      fullBody += optOutFooter;
    }

    const record = {
      id: Date.now(),
      user_id: 1,
      job_id: draft.job_id,
      draft_id: draft.id,
      recipient_name: draft.contact_name,
      recipient_email: draft.contact_email || `contact@${(draft.job?.company || 'company').toLowerCase()}.com`,
      subject: draft.subject,
      body: fullBody,
      status: 'sent',
      sent_at: new Date().toISOString(),
      job: draft.job,
    };

    logs.unshift(record);
    localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(logs));

    drafts[draftIndex].status = 'sent';
    drafts[draftIndex].body = fullBody;
    localStorage.setItem(STORAGE_KEY_OUTREACH, JSON.stringify(drafts));

    return record;
  },


  getDailyQuotaMock: (): { sent_today: number; daily_cap: number; remaining: number } => {
    const STORAGE_KEY_LOG = 'peachy_mock_outreach_log_v1';
    let logs: any[] = [];
    try {
      const rawL = localStorage.getItem(STORAGE_KEY_LOG);
      if (rawL) logs = JSON.parse(rawL);
    } catch {}

    const todayStr = new Date().toISOString().split('T')[0];
    const sentToday = logs.filter((l) => l.sent_at && l.sent_at.startsWith(todayStr)).length;
    const dailyCap = 15;

    return {
      sent_today: sentToday,
      daily_cap: dailyCap,
      remaining: Math.max(0, dailyCap - sentToday),
    };
  },

  getOutreachLogMock: (jobId?: number): any[] => {
    const STORAGE_KEY_LOG = 'peachy_mock_outreach_log_v1';
    try {
      const rawL = localStorage.getItem(STORAGE_KEY_LOG);
      if (rawL) {
        const list: any[] = JSON.parse(rawL);
        if (jobId) return list.filter((l) => l.job_id === jobId);
        return list;
      }
    } catch {}

    // Seed default sample log if empty
    const jobs = mockApiEngine.getJobs();
    const defaultLog = [
      {
        id: 901,
        user_id: 1,
        job_id: jobs[0].id,
        draft_id: 801,
        recipient_name: 'Alex Rivera',
        recipient_email: 'arivera@adzuna.com',
        subject: 'Senior Full Stack Engineer position — Karunya Kalkhundiya x Adzuna',
        body: `Hi Alex,\n\nI hope this week is treating you well! Given your leadership as Head of Engineering, I wanted to reach out directly regarding the Senior Full Stack role at Adzuna.\n\nI'm a Senior Engineer specializing in high-performance full-stack systems and cloud microservices.\n\nWould you have 10 minutes next Tuesday for a brief chat?\n\n---\nIf you prefer not to receive further emails regarding engineering roles, please reply 'unsubscribe'.`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        job: jobs[0],
      },
    ];

    localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(defaultLog));
    if (jobId) return defaultLog.filter((l) => l.job_id === jobId);
    return defaultLog;
  },

  generateInterviewPrepPack: (jobId: number): any => {
    const STORAGE_KEY_PREP = 'peachy_mock_prep_packs_v1';
    let savedPacks: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREP);
      if (raw) savedPacks = JSON.parse(raw);
    } catch {}

    const jobs = mockApiEngine.getJobs();
    const targetJob = jobs.find((j) => j.id === jobId) || jobs[0];

    const pack: any = {
      id: Date.now(),
      user_id: 1,
      job_id: jobId,
      company_name: targetJob.company,
      role_title: targetJob.title,
      company_overview: `${targetJob.company} is a market-leading technology company specializing in high-concurrency cloud systems, clean API design, and modern web applications. Technical interviews focus heavily on system architecture, database optimization, and cross-functional team execution.`,
      key_skills_to_highlight: ['System Design', 'Python / FastAPI', 'TypeScript / React', 'PostgreSQL Optimization', 'Redis Pub-Sub'],
      technical_questions: [
        {
          id: 'tech_1',
          question: `How would you design a high-concurrency real-time messaging pipeline for ${targetJob.company}?`,
          topic: 'System Design & Scale',
          expected_answer: 'Discuss WebSocket gateways, Redis pub-sub messaging, horizontal microservice scaling, and sub-50ms latency guarantees.',
          notes: 'Focus on Redis pub-sub architecture from Linear project bullet.',
          is_completed: true,
        },
        {
          id: 'tech_2',
          question: 'Walk me through how you optimize slow PostgreSQL queries under peak load.',
          topic: 'Database Optimization',
          expected_answer: 'Explain EXPLAIN ANALYZE, composite B-Tree indexes, connection pooling, and caching strategy.',
          notes: '',
          is_completed: false,
        },
        {
          id: 'tech_3',
          question: 'How do you enforce type safety and robust API contracts between frontend and backend?',
          topic: 'API Design',
          expected_answer: 'Discuss Pydantic v2 schemas, OpenAPI specs, TypeScript strict mode, and automated integration contracts.',
          notes: '',
          is_completed: false,
        },
      ],
      behavioral_questions: [
        {
          id: 'beh_1',
          question: 'Tell me about a time you led a major architectural migration under a tight deadline.',
          competency: 'Leadership & Execution',
          star_answer: {
            situation: 'While working on high-throughput backend services, legacy HTTP polling created server memory bottlenecks.',
            task: 'Tasked with redesigning real-time event pipeline to support over 100k active concurrent clients.',
            action: 'Architected a decoupled WebSocket and Redis pub-sub messaging architecture with zero downtime.',
            result: 'Reduced event distribution latency to sub-50ms and eliminated server memory spikes by 75%.',
          },
          notes: 'My primary go-to STAR story.',
          is_completed: true,
        },
        {
          id: 'beh_2',
          question: 'Describe a scenario where you resolved a technical disagreement with a team member.',
          competency: 'Collaboration & Communication',
          star_answer: {
            situation: 'Team was split between GraphQL vs REST for a new developer API.',
            task: 'Align stakeholders around performance, security, and developer ergonomics.',
            action: 'Created a rapid benchmark prototype comparing payload size, caching, and rate limiting.',
            result: 'Team agreed on a structured REST API with OpenAPI documentation, delivering 2 weeks ahead of schedule.',
          },
          notes: '',
          is_completed: false,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    savedPacks = [pack, ...savedPacks.filter((p) => p.job_id !== jobId)];
    try {
      localStorage.setItem(STORAGE_KEY_PREP, JSON.stringify(savedPacks));
    } catch {}

    return pack;
  },

  getInterviewPrepPack: (jobId: number): any => {
    const STORAGE_KEY_PREP = 'peachy_mock_prep_packs_v1';
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREP);
      if (saved) {
        const packs: any[] = JSON.parse(saved);
        const found = packs.find((p) => p.job_id === jobId);
        if (found) return found;
      }
    } catch {}
    return mockApiEngine.generateInterviewPrepPack(jobId);
  },

  getAllInterviewPrepPacks: (): any[] => {
    const STORAGE_KEY_PREP = 'peachy_mock_prep_packs_v1';
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREP);
      if (saved) {
        const list: any[] = JSON.parse(saved);
        if (list.length > 0) return list;
      }
    } catch {}
    const defaultPack = mockApiEngine.generateInterviewPrepPack(1);
    return [defaultPack];
  },

  updatePrepItem: (
    packId: number,
    data: { item_id: string; item_type: 'technical' | 'behavioral'; is_completed?: boolean; notes?: string }
  ): any => {
    const STORAGE_KEY_PREP = 'peachy_mock_prep_packs_v1';
    const packs = mockApiEngine.getAllInterviewPrepPacks();
    const packIndex = packs.findIndex((p) => p.id === packId);
    if (packIndex === -1) return packs[0] || mockApiEngine.generateInterviewPrepPack(1);

    const pack = packs[packIndex];
    const items = data.item_type === 'technical' ? pack.technical_questions : pack.behavioral_questions;
    for (const item of items) {
      if (item.id === data.item_id) {
        if (data.is_completed !== undefined) item.is_completed = data.is_completed;
        if (data.notes !== undefined) item.notes = data.notes;
      }
    }

    packs[packIndex] = pack;
    try {
      localStorage.setItem(STORAGE_KEY_PREP, JSON.stringify(packs));
    } catch {}
    return pack;
  },

  getSettings: (): any => {
    const STORAGE_KEY_SETTINGS = 'peachy_mock_settings_v1';
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}

    const defaultSettings = {
      id: 1,
      user_id: 1,
      scan_frequency_hours: 6,
      ats_score_threshold: 80,
      daily_application_cap: 20,
      daily_cold_email_cap: 15,
      adzuna_enabled: true,
      wellfound_enabled: true,
      haveloc_enabled: true,
      linkedin_enabled: true,
      telegram_webhook_url: '',
      email_webhook_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  },

  updateSettings: (data: any): any => {
    const STORAGE_KEY_SETTINGS = 'peachy_mock_settings_v1';
    const current = mockApiEngine.getSettings();
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  },

  getAuditLogs: (category?: string, status?: string): any[] => {
    const STORAGE_KEY_AUDIT = 'peachy_mock_audit_logs_v1';
    let logs: any[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) logs = JSON.parse(saved);
    } catch {}

    if (logs.length === 0) {
      const now = new Date();
      logs = [
        {
          id: 101,
          user_id: 1,
          category: 'scrape_run',
          action: 'Multi-Source Job Scan Completed',
          details: 'Scanned Adzuna, Wellfound, Haveloc & LinkedIn. Found 8 positions, 3 new added.',
          status: 'success',
          timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 102,
          user_id: 1,
          category: 'resume_generation',
          action: 'Claude Resume Tailored & Fact-Guard Audit Passed',
          details: 'Tailored resume for Senior Full Stack Engineer @ Linear. 3 claims verified, 0 flagged.',
          status: 'success',
          timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 103,
          user_id: 1,
          category: 'captcha_blocked',
          action: 'Playwright Scraper Rate Limit Alert',
          details: 'Wellfound bot detection triggered CAPTCHA warning. Scraper paused cleanly with zero retries.',
          status: 'warning',
          timestamp: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: 104,
          user_id: 1,
          category: 'email_sent',
          action: 'Cold Email Dispatched via SendGrid',
          details: 'Sent outreach email to Alex Rivera (arivera@linear.app) with CAN-SPAM opt-out line.',
          status: 'success',
          timestamp: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
        },
        {
          id: 105,
          user_id: 1,
          category: 'application_submitted',
          action: 'Playwright Application Form Pre-filled',
          details: 'Pre-filled application form for Anthropic AI Engineer. Hard pause active awaiting user confirmation.',
          status: 'success',
          timestamp: new Date(now.getTime() - 1000 * 60 * 240).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
    }

    if (category && category.toLowerCase() !== 'all') {
      logs = logs.filter((l) => l.category === category);
    }
    if (status && status.toLowerCase() !== 'all') {
      logs = logs.filter((l) => l.status === status);
    }

    return logs;
  },

  createAuditLog: (data: { category: string; action: string; details?: string; status?: string }): any => {
    const STORAGE_KEY_AUDIT = 'peachy_mock_audit_logs_v1';
    const logs = mockApiEngine.getAuditLogs();
    const newEntry = {
      id: Date.now(),
      user_id: 1,
      category: data.category,
      action: data.action,
      details: data.details || '',
      status: data.status || 'success',
      timestamp: new Date().toISOString(),
    };

    logs.unshift(newEntry);
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
    } catch {}
    return newEntry;
  },

  analyzeResumeMock: (data: any): any => {
    const resumeText = data.resume_text || 'Senior Full Stack & AI Software Engineer proficient in Python, TypeScript, React, FastAPI, PostgreSQL, Docker, Redis, REST APIs, and system design.';
    const jdText = data.jd_text || 'We are seeking a Senior Full Stack Engineer with expertise in Python, FastAPI, React, TypeScript, PostgreSQL, Docker, Kubernetes, CI/CD, and distributed systems.';

    const matched = ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs', 'System Design'];
    const missing = ['Kubernetes', 'CI/CD Pipelines', 'Distributed Systems Scaling'];

    return {
      overall_ats_score: 92,
      keyword_match_score: 90,
      formatting_score: 95,
      completeness_score: 92,
      matched_keywords: matched,
      missing_keywords: missing,
      resume_keywords: {
        technical_skills: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Redis'],
        tools: ['Docker', 'Git', 'Postman'],
        soft_skills: ['System Design', 'Technical Leadership', 'Problem Solving'],
        certifications: ['AWS Certified Solutions Architect'],
        role_titles: ['Senior Full Stack Engineer'],
      },
      jd_keywords: {
        technical_skills: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Distributed Systems'],
        tools: ['Docker', 'Kubernetes', 'CI/CD Pipelines'],
        soft_skills: ['System Design', 'Cross-functional Leadership'],
        certifications: [],
        role_titles: ['Senior Full Stack Engineer'],
      },
      recommendations: [
        'Incorporate missing keywords: Kubernetes, CI/CD Pipelines into your work experience bullets.',
        'High overall ATS match score (92%)! Ensure experience accomplishments highlight quantitative metrics.',
      ],
      resume_preview_text: resumeText.slice(0, 250) + '...',
      jd_preview_text: jdText.slice(0, 250) + '...',
    };
  },

  saveFingerprintMock: (keywords: string[]): any => {
    const profile = mockApiEngine.getProfile();
    const currentFps = new Set(profile.keyword_fingerprint || []);
    keywords.forEach((k) => currentFps.add(k));

    profile.keyword_fingerprint = Array.from(currentFps);
    mockApiEngine.updateProfile(profile);

    return {
      message: `Saved ${keywords.length} extracted keywords to Master Profile fingerprint.`,
      keyword_fingerprint: profile.keyword_fingerprint,
    };
  },
};


