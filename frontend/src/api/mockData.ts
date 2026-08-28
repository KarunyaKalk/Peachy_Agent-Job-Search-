import {
  MasterProfile,
  JobPreference,
  Job,
  TailoredResume,
  Application,
  OutreachLog,
  AuditLog,
  UserSettings
} from '../types';

export const mockProfile: MasterProfile = {
  id: 1,
  full_name: 'Karunya Kalk',
  email: 'karunya.kalk@example.com',
  phone: '+1 (555) 839-2041',
  location: 'San Francisco, CA (Open to Remote)',
  linkedin_url: 'https://linkedin.com/in/karunyakalk',
  github_url: 'https://github.com/peachyagent-kalk',
  portfolio_url: 'https://peachyagent-kalk.github.io',
  summary: 'Senior Full-Stack Engineer with 5+ years of experience building high-performance AI web applications, REST APIs, and microservices. Expert in TypeScript, React, Python, FastAPI, Docker, and LLM integrations.',
  skills_json: {
    Languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML5/CSS3'],
    Frontend: ['React 18', 'Next.js', 'Tailwind CSS', 'Redux/Context API', 'Vite'],
    Backend: ['FastAPI', 'Node.js', 'Express', 'Django', 'Celery', 'REST & GraphQL'],
    Databases: ['PostgreSQL', 'SQLite', 'Redis', 'MongoDB'],
    DevOps: ['Docker', 'Docker Compose', 'GitHub Actions', 'AWS S3/EC2', 'Nginx']
  },
  experience_json: [
    {
      company: 'Apex AI Systems',
      role: 'Senior Full Stack Engineer',
      dates: '2023 - Present',
      location: 'San Francisco, CA',
      bullets: [
        'Designed and implemented autonomous multi-agent backend workflows in Python FastAPI processing over 50,000 requests/day.',
        'Architected modern React/TypeScript frontend with zero-latency state sync, reducing user task completion time by 35%.',
        'Optimized PostgreSQL query performance and caching layer with Redis, lowering median response latency from 450ms to 85ms.'
      ],
      variants: {
        backend: ['Architected scalable FastAPI services and AsyncIO workers processing 50k+ daily transactions.'],
        frontend: ['Built responsive, accessible React 18 component architecture with Tailwind CSS and custom theme tokens.']
      }
    },
    {
      company: 'Scale Tech Inc.',
      role: 'Full Stack Software Engineer',
      dates: '2021 - 2023',
      location: 'Austin, TX',
      bullets: [
        'Built full-stack web products using React, Node.js, and Docker microservices.',
        'Engineered automated PDF generation and parsing pipelines for document verification.',
        'Collaborated with cross-functional product and UX teams to launch 4 major feature releases ahead of schedule.'
      ]
    }
  ],
  projects_json: [
    {
      title: 'Peachy Agent II',
      description: 'Autonomous AI Job Application Agent with ATS resume checker, auto-tailoring, and cold email outreach generator.',
      technologies: ['React', 'TypeScript', 'FastAPI', 'Python', 'Tailwind CSS'],
      link: 'https://github.com/peachyagent-kalk/peachyagent-kalk.github.io'
    },
    {
      title: 'DocuPulse AI',
      description: 'Zero-latency document text extractor and summary engine using WebAssembly and client-side regex taxonomy.',
      technologies: ['TypeScript', 'React', 'PDF.js', 'Vite'],
      link: 'https://peachyagent-kalk.github.io'
    }
  ],
  education_json: [
    {
      degree: 'B.S. in Computer Science & Software Engineering',
      institution: 'State University of Technology',
      year: '2021',
      gpa: '3.85 / 4.0'
    }
  ],
  certifications_json: [
    'AWS Certified Solutions Architect – Associate',
    'Meta Certified Senior Frontend Developer'
  ],
  keyword_fingerprint: ['Python', 'FastAPI', 'TypeScript', 'React', 'Docker', 'PostgreSQL', 'REST API', 'LLM']
};

export const mockPreferences: JobPreference = {
  id: 1,
  target_roles: ['Senior Full Stack Engineer', 'Backend Engineer', 'Frontend Engineer', 'AI Platform Engineer'],
  seniority: ['Senior', 'Mid-Senior', 'Lead'],
  location_types: ['Remote', 'Hybrid'],
  preferred_cities: ['San Francisco, CA', 'New York, NY', 'Austin, TX'],
  salary_floor: 140000,
  industries_include: ['AI / Machine Learning', 'Developer Tools', 'SaaS', 'Fintech'],
  industries_exclude: ['Gambling', 'Crypto Spam'],
  company_sizes: ['51-200 employees', '201-500 employees', '500+ employees'],
  exclude_keywords: ['Unpaid', 'Contractor C2C', 'Requires Clearance']
};

export const mockJobs: Job[] = [
  {
    id: 101,
    dedup_hash: 'hash_101',
    title: 'Senior Full Stack Engineer (AI Products)',
    company: 'Nexus AI Labs',
    location: 'San Francisco, CA (Remote Option)',
    salary_range: '$165,000 - $195,000 • Equity 0.15%',
    seniority: 'Senior',
    job_type: 'Full-time',
    full_jd_text: 'Nexus AI Labs is seeking a Senior Full Stack Engineer to lead technical architecture for our next-generation generative AI workspace. You will work with React, TypeScript, Python FastAPI, PostgreSQL, and LLM APIs to build high-throughput tools.',
    source_platform: 'LinkedIn Jobs',
    apply_url: 'https://nexusai.example.com/careers/101',
    posted_date: '2 hours ago',
    match_score: 94,
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    dedup_hash: 'hash_102',
    title: 'Staff Backend & Systems Engineer',
    company: 'HyperScale Cloud',
    location: 'Remote (US / Canada)',
    salary_range: '$180,000 - $210,000',
    seniority: 'Staff / Senior',
    job_type: 'Full-time',
    full_jd_text: 'HyperScale Cloud builds developer platforms used by millions of engineers. We are looking for a Staff Backend Engineer with expertise in Python, Go, distributed microservices, Docker, and high-availability database architecture.',
    source_platform: 'Wellfound',
    apply_url: 'https://hyperscale.example.com/jobs/102',
    posted_date: '1 day ago',
    match_score: 88,
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 103,
    dedup_hash: 'hash_103',
    title: 'Lead React / TypeScript Frontend Architect',
    company: 'Pulse Systems',
    location: 'Austin, TX (Hybrid)',
    salary_range: '$155,000 - $185,000',
    seniority: 'Lead',
    job_type: 'Full-time',
    full_jd_text: 'Join Pulse Systems to build sleek, accessible real-time analytical dashboards using React 18, TypeScript, Tailwind CSS, Vite, and WebSocket streaming.',
    source_platform: 'Y Combinator Jobs',
    apply_url: 'https://pulsesystems.example.com/jobs/103',
    posted_date: '3 days ago',
    match_score: 85,
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 104,
    dedup_hash: 'hash_104',
    title: 'AI Workflow & Automation Engineer',
    company: 'Cognitive Flow',
    location: 'San Francisco, CA',
    salary_range: '$160,000 - $190,000',
    seniority: 'Senior',
    job_type: 'Full-time',
    full_jd_text: 'Cognitive Flow builds enterprise AI automation agents. Seeking an engineer skilled in Python FastAPI, LangChain/LlamaIndex, Celery task queues, and modern Web UIs.',
    source_platform: 'Adzuna',
    apply_url: 'https://cognitiveflow.example.com/careers/104',
    posted_date: '4 hours ago',
    match_score: 91,
    is_hidden: false,
    created_at: new Date().toISOString()
  }
];

export const mockApplications: Application[] = [
  {
    id: 1,
    job_id: 101,
    job_title: 'Senior Full Stack Engineer (AI Products)',
    company: 'Nexus AI Labs',
    status: 'Ready to Apply',
    submission_type: 'Auto-Filled Form',
    notes: 'Tailored resume generated with 94% ATS match score.',
    match_score: 94,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    job_id: 102,
    job_title: 'Staff Backend & Systems Engineer',
    company: 'HyperScale Cloud',
    status: 'Applied',
    applied_at: new Date(Date.now() - 86400000).toISOString(),
    submission_type: 'LinkedIn Quick Apply',
    notes: 'Submitted resume and sent follow-up cold email to Engineering Manager.',
    match_score: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    job_id: 103,
    job_title: 'Lead React / TypeScript Frontend Architect',
    company: 'Pulse Systems',
    status: 'Interview',
    applied_at: new Date(Date.now() - 259200000).toISOString(),
    submission_type: 'Company Portal',
    notes: 'Technical Recruiter screen scheduled for tomorrow at 2 PM PST.',
    match_score: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockOutreachLogs: OutreachLog[] = [
  {
    id: 1,
    job_id: 101,
    recipient_email: 'sarah.v@nexusai.example.com',
    recipient_name: 'Sarah Vance',
    recipient_title: 'Head of Engineering @ Nexus AI Labs',
    subject: 'Senior Full Stack Engineer Application — Karunya Kalk',
    body: `Hi Sarah,\n\nI noticed Nexus AI Labs is hiring a Senior Full Stack Engineer. Given my background building high-throughput FastAPI services and React/TypeScript web apps, I wanted to introduce myself.\n\nAt Apex AI Systems, I architected multi-agent backend workflows processing 50k+ requests/day and built interactive React UIs with zero-latency state sync.\n\nI would love to connect for 10 minutes to discuss how I can contribute to Nexus AI Labs!\n\nBest regards,\nKarunya Kalk\nhttps://peachyagent-kalk.github.io`,
    status: 'Sent',
    sent_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date().toISOString()
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    action: 'Resume Auto-Fill Parsed',
    source: 'Master Profile',
    status: 'Success',
    details: 'Parsed contact info, skills fingerprint, and work experience from uploaded resume.',
    metadata_json: { extracted_fields: 6, accuracy_score: '98%' },
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 2,
    action: 'Job Discovery Scan Executed',
    source: 'Discovery Service',
    status: 'Success',
    details: 'Discovered 4 new high-match positions across LinkedIn, Y Combinator, and Wellfound.',
    metadata_json: { scanned_sources: 3, new_matches: 4 },
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    action: 'ATS Resume Tailored',
    source: 'Tailoring Engine',
    status: 'Success',
    details: 'Generated tailored resume for Senior Full Stack Engineer @ Nexus AI Labs (Match: 94%).',
    metadata_json: { ats_score: 94, fact_guard_status: 'PASSED' },
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

export const mockSettings: UserSettings = {
  id: 1,
  scan_frequency_hours: 6,
  ats_threshold: 80,
  auto_revise_target_score: 90,
  daily_app_cap: 10,
  daily_email_cap: 5,
  platform_toggles: {
    linkedin: true,
    wellfound: true,
    ycombinator: true,
    adzuna: true
  },
  dark_mode: true
};
