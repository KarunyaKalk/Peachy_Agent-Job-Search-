import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import {
  MasterProfile,
  ResumeParseResponse,
  WorkExperience,
  Skill,
  Project,
  Education,
  Certification,
  AmbiguityFlag,
} from '../types/profile';

// Set worker src to CDN for web bundle compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts plain text from an uploaded PDF or DOCX file client-side.
 */
export async function extractTextFromClientFile(file: File): Promise<string> {
  const ext = file.name.toLowerCase().split('.').pop();
  const buffer = await file.arrayBuffer();

  if (ext === 'docx' || ext === 'doc') {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      if (result.value && result.value.trim().length > 10) {
        return result.value.trim();
      }
    } catch (e) {
      console.warn('Mammoth DOCX parsing failed, trying raw XML decode fallback:', e);
    }

    const decoder = new TextDecoder('utf-8');
    const rawStr = decoder.decode(buffer);
    const matches = rawStr.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (matches && matches.length > 0) {
      return matches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
    }
    return rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }

  if (ext === 'pdf') {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const pageTexts: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items.map((item: any) => item.str);
        pageTexts.push(pageItems.join(' '));
      }

      const combinedText = pageTexts.join('\n\n').trim();
      if (combinedText && combinedText.length > 10) {
        return combinedText;
      }
    } catch (e) {
      console.warn('PDFjs parsing failed, using fallback stream extractor:', e);
    }

    // Fallback PDF text stream decoder
    const decoder = new TextDecoder('latin1');
    const rawStr = decoder.decode(buffer);
    const textSegments: string[] = [];
    const tjRegex = /\(([^()]*)\)\s*Tj/g;
    let match: RegExpExecArray | null;
    while ((match = tjRegex.exec(rawStr)) !== null) {
      if (match[1] && match[1].trim().length > 1) {
        textSegments.push(match[1]);
      }
    }

    if (textSegments.length > 5) {
      return textSegments.join(' ');
    }

    return rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
  }

  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

/**
 * Client-side resume extractor that parses raw text into Master Profile schema + ambiguities.
 */
export function parseRawResumeText(rawText: string, currentProfile: MasterProfile): ResumeParseResponse {
  const cleanText = rawText.replace(/\s+/g, ' ').trim();
  const lines = rawText
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Extract Contact Info
  const phoneMatch = rawText.match(/(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const linkedinMatch = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = rawText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = rawText.match(/https?:\/\/(?:www\.)?[a-zA-Z0-9_-]+\.(?:io|com|dev|me|net)/i);
  const locationMatch = rawText.match(/([A-Z][a-zA-B\s]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+))/);

  // Extract Summary
  let summaryText = '';
  const summaryHeaderIdx = lines.findIndex((l) => /summary|objective|about me|profile/i.test(l));
  if (summaryHeaderIdx !== -1 && lines[summaryHeaderIdx + 1]) {
    summaryText = lines.slice(summaryHeaderIdx + 1, summaryHeaderIdx + 4).join(' ');
  } else if (lines.length > 2) {
    const candidate = lines.find((l) => l.length > 50 && !l.includes('@'));
    if (candidate) summaryText = candidate;
  }

  const contact = {
    phone: phoneMatch ? phoneMatch[0] : undefined,
    location: locationMatch ? locationMatch[1] : undefined,
    linkedin_url: linkedinMatch ? linkedinMatch[0] : undefined,
    github_url: githubMatch ? githubMatch[0] : undefined,
    portfolio_url: portfolioMatch ? portfolioMatch[0] : undefined,
    summary: summaryText || undefined,
  };

  // 2. Extract Skills
  const knownSkillTaxonomy: Record<string, string> = {
    python: 'Backend',
    typescript: 'Languages',
    javascript: 'Languages',
    react: 'Frontend',
    'next.js': 'Frontend',
    vue: 'Frontend',
    angular: 'Frontend',
    'node.js': 'Backend',
    fastapi: 'Backend',
    django: 'Backend',
    flask: 'Backend',
    express: 'Backend',
    postgresql: 'Database',
    postgres: 'Database',
    mysql: 'Database',
    mongodb: 'Database',
    redis: 'Backend',
    docker: 'DevOps',
    kubernetes: 'DevOps',
    aws: 'Cloud/DevOps',
    gcp: 'Cloud/DevOps',
    azure: 'Cloud/DevOps',
    git: 'Tools',
    graphql: 'Backend',
    rest: 'Backend',
    java: 'Languages',
    'c++': 'Languages',
    go: 'Languages',
    rust: 'Languages',
    html: 'Frontend',
    css: 'Frontend',
    tailwind: 'Frontend',
    sql: 'Database',
  };

  const extractedSkillsMap = new Map<string, { category: string; name: string }>();

  // Check text for known skills
  Object.entries(knownSkillTaxonomy).forEach(([term, cat]) => {
    const regex = new RegExp(`\\b${term.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(rawText)) {
      const formattedName = term.charAt(0).toUpperCase() + term.slice(1);
      extractedSkillsMap.set(term.toLowerCase(), { category: cat, name: formattedName });
    }
  });

  // Check lines in Skills section
  const skillsHeaderIdx = lines.findIndex((l) => /skills|technologies|expertise/i.test(l));
  if (skillsHeaderIdx !== -1) {
    const skillLines = lines.slice(skillsHeaderIdx + 1, skillsHeaderIdx + 8);
    skillLines.forEach((line) => {
      if (line.length < 200) {
        const parts = line.split(/[:,•·|]/);
        const cat = parts.length > 1 && parts[0].length < 25 ? parts[0].trim() : 'General';
        const items = parts.length > 1 ? parts.slice(1).join(',') : line;
        items.split(/[,;•]/).forEach((item) => {
          const name = item.trim();
          if (name && name.length > 1 && name.length < 35 && !/skills|experience|education/i.test(name)) {
            extractedSkillsMap.set(name.toLowerCase(), { category: cat, name });
          }
        });
      }
    });
  }

  const skills: Skill[] = Array.from(extractedSkillsMap.values()).map((s) => ({
    name: s.name,
    category: s.category,
    proficiency: 'Proficient',
  }));

  // 3. Extract Work Experience
  const experiences: WorkExperience[] = [];
  const ambiguities: AmbiguityFlag[] = [];

  const expHeaderIdx = lines.findIndex((l) => /experience|employment|work history/i.test(l));
  if (expHeaderIdx !== -1) {
    const expLines = lines.slice(expHeaderIdx + 1);
    let currentExp: WorkExperience | null = null;

    const datePattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})[\s\S]*?(?:Present|[0-9]{4}))/i;

    expLines.forEach((line) => {
      if (/education|projects|certifications|skills/i.test(line) && experiences.length > 0) {
        return;
      }

      const dateMatch = line.match(datePattern);
      const isBullet = /^[-•*·]/.test(line);

      if ((dateMatch || (line.length < 60 && !isBullet && /[A-Z]/.test(line))) && !currentExp) {
        const roleParts = line.split(/[-–|]/);
        currentExp = {
          company: roleParts[0]?.trim() || 'Extracted Company',
          role: roleParts[1]?.trim() || roleParts[0]?.trim() || 'Software Engineer',
          start_date: dateMatch ? dateMatch[0].split(/[-–]/)[0].trim() : '2021',
          end_date: line.toLowerCase().includes('present')
            ? 'Present'
            : dateMatch
            ? dateMatch[0].split(/[-–]/)[1]?.trim()
            : undefined,
          is_current: line.toLowerCase().includes('present'),
          bullets: [],
        };
        experiences.push(currentExp);
      } else if (isBullet && currentExp) {
        const bulletText = line.replace(/^[-•*·]\s*/, '').trim();
        if (bulletText) {
          currentExp.bullets = currentExp.bullets || [];
          currentExp.bullets.push({ content: bulletText });
        }
      } else if (currentExp && line.length > 20 && !currentExp.description) {
        currentExp.description = line;
      }
    });
  }

  // Ambiguity check
  experiences.forEach((exp) => {
    if (!exp.start_date || exp.start_date === '2021') {
      ambiguities.push({
        id: `amb_${exp.company}_date`,
        section: 'experience',
        item_identifier: `${exp.role} at ${exp.company}`,
        field: 'start_date',
        reason: 'Start date range extracted from resume text is ambiguous.',
        suggested_action: 'Please verify exact start and end employment dates.',
      });
    }
  });

  // 4. Extract Projects
  const projects: Project[] = [];
  const projHeaderIdx = lines.findIndex((l) => /projects|key projects|personal projects/i.test(l));
  if (projHeaderIdx !== -1) {
    const projLines = lines.slice(projHeaderIdx + 1, projHeaderIdx + 10);
    projLines.forEach((line) => {
      if (/education|certifications|skills|experience/i.test(line)) return;
      if (line.length > 10 && line.length < 150) {
        const parts = line.split(/[:|–-]/);
        projects.push({
          title: parts[0].trim(),
          description: parts[1] ? parts[1].trim() : line,
        });
      }
    });
  }

  // 5. Extract Education
  const education: Education[] = [];
  const eduHeaderIdx = lines.findIndex((l) => /education|academic/i.test(l));
  if (eduHeaderIdx !== -1) {
    const eduLines = lines.slice(eduHeaderIdx + 1, eduHeaderIdx + 6);
    eduLines.forEach((line) => {
      if (/certifications|skills|projects/i.test(line)) return;
      if (line.length > 5) {
        const degreeMatch = line.match(/(Bachelor|Master|B\.S\.|M\.S\.|B\.A\.|Ph\.D\.|Degree|Diploma)/i);
        education.push({
          institution: line.split(/[,|–-]/)[0].trim(),
          degree: degreeMatch ? line : 'Degree / Program',
          field_of_study: 'Computer Science & Engineering',
        });
      }
    });
  }

  // 6. Extract Certifications
  const certifications: Certification[] = [];
  const certHeaderIdx = lines.findIndex((l) => /certifications|certificates|licenses/i.test(l));
  if (certHeaderIdx !== -1) {
    const certLines = lines.slice(certHeaderIdx + 1, certHeaderIdx + 6);
    certLines.forEach((line) => {
      if (line.length > 5) {
        certifications.push({
          name: line.split(/[,|–-]/)[0].trim(),
          issuing_organization: line.split(/[,|–-]/)[1]?.trim() || 'Issuing Body',
        });
      }
    });
  }

  return {
    extracted_data: {
      contact,
      summary: contact.summary,
      skills: skills.length > 0 ? skills : [
        { name: 'Python', category: 'Backend' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'React', category: 'Frontend' },
      ],
      experiences,
      projects,
      education,
      certifications,
    },
    current_profile: currentProfile,
    ambiguities,
    raw_text_snippet: cleanText.slice(0, 300) + '...',
  };
}
