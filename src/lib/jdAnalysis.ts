/**
 * JD analysis: skill extraction, checklist, 7-day plan, questions, readiness score.
 * All heuristic-based, no external APIs.
 */

export const SKILL_CATEGORIES = {
  coreCS: {
    label: 'Core CS',
    keywords: ['DSA', 'OOP', 'DBMS', 'OS', 'Networks', 'Networking', 'Data Structures', 'Algorithms'],
  },
  languages: {
    label: 'Languages',
    keywords: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Golang'],
  },
  web: {
    label: 'Web',
    keywords: ['React', 'Next.js', 'Node.js', 'Express', 'REST', 'GraphQL'],
  },
  data: {
    label: 'Data',
    keywords: ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
  },
  cloudDevOps: {
    label: 'Cloud/DevOps',
    keywords: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  },
  testing: {
    label: 'Testing',
    keywords: ['Selenium', 'Cypress', 'Playwright', 'JUnit', 'PyTest'],
  },
} as const;

const NORMALIZED_KEYWORDS: Record<string, string> = {
  golang: 'Go',
  'next.js': 'Next.js',
  'node.js': 'Node.js',
  'c++': 'C++',
  'c#': 'C#',
  'ci/cd': 'CI/CD',
  'data structures': 'DSA',
  algorithms: 'DSA',
};

function normalizeSkill(raw: string): string {
  const lower = raw.toLowerCase();
  return NORMALIZED_KEYWORDS[lower] ?? raw.charAt(0).toUpperCase() + raw.slice(1).trim();
}

export type ExtractedSkills = {
  byCategory: Record<string, string[]>;
  generalFresher: boolean;
};

export function extractSkills(jdText: string): ExtractedSkills {
  const lower = jdText.trim().toLowerCase();
  const byCategory: Record<string, string[]> = {};
  const seen = new Set<string>();

  // Word-boundary check for short tokens that can be substring of other words
  const matchWord = (token: string) => {
    const re = new RegExp('\\b' + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(jdText);
  };

  for (const [, config] of Object.entries(SKILL_CATEGORIES)) {
    const found: string[] = [];
    for (const kw of config.keywords) {
      const kwLower = kw.toLowerCase();
      let matched = false;
      if (kw === 'C++' || kw === 'C#') {
        matched = lower.includes(kwLower);
      } else if (kw === 'Golang') {
        matched = (matchWord('Go') || lower.includes('golang')) && !lower.includes('google');
      } else if (kw === 'C') {
        matched = matchWord('C') && !lower.includes('c++') && !lower.includes('c#');
      } else {
        matched = lower.includes(kwLower);
      }
      if (matched) {
        const display = kw === 'Golang' ? 'Go' : kw;
        const normalized = normalizeSkill(display);
        if (!seen.has(normalized)) {
          seen.add(normalized);
          found.push(normalized);
        }
      }
    }
    if (found.length) byCategory[config.label] = found;
  }

  const generalFresher = Object.keys(byCategory).length === 0;
  if (generalFresher) {
    byCategory['General'] = ['General fresher stack'];
  }

  return { byCategory, generalFresher };
}

export type RoundChecklist = {
  round: string;
  items: string[];
};

export function buildChecklist(extracted: ExtractedSkills): RoundChecklist[] {
  const { byCategory, generalFresher } = extracted;
  const hasDSA = byCategory['Core CS']?.some(s => s === 'DSA') ?? byCategory['Core CS']?.length;
  const hasCore = (byCategory['Core CS']?.length ?? 0) > 0;
  const hasWeb = (byCategory['Web']?.length ?? 0) > 0;
  const hasData = (byCategory['Data']?.length ?? 0) > 0;
  const hasCloud = (byCategory['Cloud/DevOps']?.length ?? 0) > 0;
  const hasLang = (byCategory['Languages']?.length ?? 0) > 0;
  const hasTesting = (byCategory['Testing']?.length ?? 0) > 0;

  const round1: string[] = [
    'Revise quantitative aptitude (percentages, ratios, time-speed-distance).',
    'Practice logical reasoning and verbal ability.',
    'Review basic CS fundamentals (computer architecture, number systems).',
    'Time yourself on sample aptitude tests.',
    'Brush up grammar and comprehension.',
  ];
  if (generalFresher) round1.push('Prepare a one-page resume.', 'List 2–3 academic projects.');

  const round2: string[] = [
    'Revise arrays, strings, and hash maps.',
    'Practice 5–10 medium problems on arrays and strings.',
  ];
  if (hasDSA || hasCore) {
    round2.push('Revise trees and graphs.', 'Practice recursion and DP problems.');
  }
  round2.push('Review OOP concepts (if applicable).', 'Practice time complexity analysis.');
  if (hasCore) round2.push('Revise OS: processes, threads, scheduling.');
  if (hasData) round2.push('Revise DBMS: normalization, indexing, transactions.');
  const r2 = round2.slice(0, 8);

  const round3: string[] = [];
  if (hasWeb) round3.push('Prepare project deep-dive: architecture, your role, challenges.');
  if (hasLang) round3.push('Revise language basics and common APIs.');
  if (hasData) round3.push('Prepare SQL examples and explain schema design.');
  if (hasCloud) round3.push('Revise cloud/deployment concepts and your experience.');
  if (hasTesting) round3.push('Prepare test strategy and tools you’ve used.');
  round3.push('Prepare “Tell me about yourself” and project stories.', 'Align resume bullets with JD.');
  const r3 = round3.slice(0, 8);

  const round4: string[] = [
    'Prepare STAR stories (Situation, Task, Action, Result).',
    'List strengths and one improvement area.',
    'Prepare questions to ask the interviewer.',
    'Research company and role.',
    'Practice “Why this company?” and “Where do you see yourself?”',
    'Review your resume for consistency.',
  ];
  if (generalFresher) round4.push('Prepare for “Tell me about your projects”.', 'Prepare salary expectations (if applicable).');
  const r4 = round4.slice(0, 8);

  return [
    { round: 'Round 1: Aptitude / Basics', items: round1.slice(0, 8) },
    { round: 'Round 2: DSA + Core CS', items: r2 },
    { round: 'Round 3: Tech interview (projects + stack)', items: r3.length ? r3 : ['Prepare project deep-dive.', 'Align resume with JD.', 'Revise core CS and stack.'] },
    { round: 'Round 4: Managerial / HR', items: r4 },
  ];
}

export type DayPlanItem = {
  day: number;
  title: string;
  tasks: string[];
};

export function buildSevenDayPlan(extracted: ExtractedSkills): DayPlanItem[] {
  const { byCategory } = extracted;
  const hasDSA = (byCategory['Core CS']?.length ?? 0) > 0;
  const hasWeb = (byCategory['Web']?.length ?? 0) > 0;
  const hasData = (byCategory['Data']?.length ?? 0) > 0;

  const plan: DayPlanItem[] = [
    {
      day: 1,
      title: 'Basics + Core CS',
      tasks: [
        'Revise aptitude: quant and logical reasoning.',
        'Revise OS: processes, memory, scheduling.',
        'Revise DBMS basics: SQL, normalization.',
      ],
    },
    {
      day: 2,
      title: 'Core CS continued',
      tasks: [
        'Revise networks: OSI, TCP/IP, HTTP.',
        'Revise OOP and basics of data structures.',
        'Solve 2–3 easy coding problems.',
      ],
    },
    {
      day: 3,
      title: 'DSA + Coding practice',
      tasks: [
        'Arrays and strings: 3–4 problems.',
        'Hash maps and two pointers.',
        'Time complexity for each solution.',
      ],
    },
    {
      day: 4,
      title: 'DSA continued',
      tasks: [
        'Trees and graphs: traversal, BFS/DFS.',
        hasDSA ? 'Practice 2–3 medium DP problems.' : 'Practice recursion and recursion-to-iteration.',
        'Revise common patterns (sliding window, binary search).',
      ],
    },
    {
      day: 5,
      title: 'Project + Resume alignment',
      tasks: [
        'Document 2–3 projects: problem, solution, impact.',
        'Align resume bullets with JD keywords.',
        hasWeb ? 'Prepare frontend/backend deep-dive (React, Node, etc.).' : 'Prepare tech stack deep-dive.',
        hasData ? 'Prepare SQL and DB design examples.' : 'List technologies used in projects.',
      ],
    },
    {
      day: 6,
      title: 'Mock interview questions',
      tasks: [
        'Practice “Tell me about yourself” (2 min).',
        'Practice 2–3 behavioral STAR stories.',
        'Solve 1–2 coding problems aloud (mock interview).',
        'Prepare 3–4 questions to ask the interviewer.',
      ],
    },
    {
      day: 7,
      title: 'Revision + Weak areas',
      tasks: [
        'Revise weak topics from the week.',
        'Light coding: 1–2 easy problems.',
        'Review checklist and 7-day plan.',
        'Rest and prepare mentally.',
      ],
    },
  ];

  if (hasWeb) {
    const d5 = plan.find(p => p.day === 5)!;
    if (!d5.tasks.some(t => t.includes('React') || t.includes('frontend'))) {
      d5.tasks.push('Revise React/Next.js (state, hooks, performance).');
    }
  }

  return plan;
}

export function buildQuestions(extracted: ExtractedSkills): string[] {
  const { byCategory } = extracted;
  const questions: string[] = [];

  if (byCategory['Core CS']?.length) {
    questions.push('How would you optimize search in sorted data? (Binary search and variants.)');
    questions.push('Explain time complexity of common operations (array, hash map, tree).');
  }
  if (byCategory['Data']?.length) {
    questions.push('Explain indexing in databases and when it helps.');
    questions.push('What is normalization? When would you denormalize?');
  }
  if (byCategory['Web']?.some(s => s === 'React')) {
    questions.push('Explain state management options in React (useState, context, external store).');
    questions.push('How would you optimize re-renders in a large React app?');
  }
  if (byCategory['Languages']?.some(s => s === 'JavaScript') || byCategory['Web']?.length) {
    questions.push('Explain event loop and async behavior in JavaScript.');
  }
  if (byCategory['Core CS']?.length) {
    questions.push('Difference between process and thread. When to use which?');
  }
  if (byCategory['Cloud/DevOps']?.length) {
    questions.push('Explain containerization (Docker) and how it differs from VMs.');
  }
  if (byCategory['Web']?.length) {
    questions.push('REST vs GraphQL: when would you choose one over the other?');
  }
  questions.push('Describe a challenging technical problem you solved.');
  questions.push('How do you handle disagreement with a teammate or manager?');

  const uniq = Array.from(new Set(questions));
  while (uniq.length < 10) {
    uniq.push('Tell me about a project where you took ownership and drove results.');
    if (uniq.length >= 10) break;
    uniq.push('How do you stay updated with new technologies?');
    if (uniq.length >= 10) break;
    uniq.push('Where do you see yourself in 2–3 years?');
  }
  return uniq.slice(0, 10);
}

export function computeReadinessScore(
  extracted: ExtractedSkills,
  company: string,
  role: string,
  jdText: string
): number {
  let score = 35;
  const { byCategory, generalFresher } = extracted;

  if (!generalFresher) {
    const categoriesPresent = Object.keys(byCategory).length;
    score += Math.min(categoriesPresent * 5, 30);
  }
  if (company.trim().length > 0) score += 10;
  if (role.trim().length > 0) score += 10;
  if (jdText.length > 800) score += 10;

  return Math.min(100, score);
}

export type AnalysisResult = {
  extractedSkills: ExtractedSkills;
  checklist: RoundChecklist[];
  plan: DayPlanItem[];
  questions: string[];
  readinessScore: number;
};

export function runAnalysis(
  jdText: string,
  company: string,
  role: string
): AnalysisResult {
  const extractedSkills = extractSkills(jdText);
  const checklist = buildChecklist(extractedSkills);
  const plan = buildSevenDayPlan(extractedSkills);
  const questions = buildQuestions(extractedSkills);
  const readinessScore = computeReadinessScore(extractedSkills, company, role, jdText);

  return {
    extractedSkills,
    checklist,
    plan,
    questions,
    readinessScore,
  };
}
