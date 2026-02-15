/**
 * Strict analysis entry schema. All history entries conform to this shape.
 */

export type SkillConfidence = 'know' | 'practice';

export type ExtractedSkillsStrict = {
  coreCS: string[];
  languages: string[];
  web: string[];
  data: string[];
  cloud: string[];
  testing: string[];
  other: string[];
};

export type RoundMappingItemStrict = {
  round: number;
  roundTitle: string;
  focusAreas: string[];
  whyItMatters: string;
};

export type ChecklistItemStrict = {
  roundTitle: string;
  items: string[];
};

export type PlanDayStrict = {
  day: number;
  focus: string;
  tasks: string[];
};

export type HistoryEntryStrict = {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkillsStrict;
  roundMapping: RoundMappingItemStrict[];
  checklist: ChecklistItemStrict[];
  plan7Days: PlanDayStrict[];
  questions: string[];
  baseScore: number;
  skillConfidenceMap: Record<string, SkillConfidence>;
  finalScore: number;
  updatedAt: string;
};

const DEFAULT_OTHER_SKILLS = ['Communication', 'Problem solving', 'Basic coding', 'Projects'];

const CATEGORY_MAP: Record<string, keyof ExtractedSkillsStrict> = {
  'Core CS': 'coreCS',
  'Languages': 'languages',
  'Web': 'web',
  'Data': 'data',
  'Cloud/DevOps': 'cloud',
  'Testing': 'testing',
  'General': 'other',
};

export function toStrictExtractedSkills(
  byCategory: Record<string, string[]>,
  generalFresher: boolean
): ExtractedSkillsStrict {
  const out: ExtractedSkillsStrict = {
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloud: [],
    testing: [],
    other: [],
  };
  for (const [label, skills] of Object.entries(byCategory)) {
    const key = CATEGORY_MAP[label] ?? 'other';
    if (Array.isArray(skills)) {
      const arr = key in out ? out[key as keyof ExtractedSkillsStrict] : out.other;
      if (Array.isArray(arr)) arr.push(...skills);
    }
  }
  if (generalFresher) {
    out.other = [...DEFAULT_OTHER_SKILLS];
  }
  return out;
}

export function toStrictRoundMapping(
  items: { round: number; title: string; description: string; whyItMatters: string }[]
): RoundMappingItemStrict[] {
  return items.map((r) => ({
    round: r.round,
    roundTitle: r.title,
    focusAreas: r.description ? [r.description] : [],
    whyItMatters: r.whyItMatters ?? '',
  }));
}

export function toStrictChecklist(items: { round: string; items: string[] }[]): ChecklistItemStrict[] {
  return items.map((c) => ({
    roundTitle: c.round,
    items: Array.isArray(c.items) ? c.items : [],
  }));
}

export function toStrictPlan7Days(items: { day: number; title: string; tasks: string[] }[]): PlanDayStrict[] {
  return items.map((p) => ({
    day: p.day,
    focus: p.title ?? '',
    tasks: Array.isArray(p.tasks) ? p.tasks : [],
  }));
}

export function computeFinalScore(
  baseScore: number,
  skillConfidenceMap: Record<string, SkillConfidence>,
  allSkills: string[]
): number {
  let delta = 0;
  for (const skill of allSkills) {
    const c = skillConfidenceMap[skill] ?? 'practice';
    if (c === 'know') delta += 2;
    else delta -= 2;
  }
  return Math.max(0, Math.min(100, baseScore + delta));
}

export function getAllSkillsFromStrict(extracted: ExtractedSkillsStrict): string[] {
  const out: string[] = [];
  out.push(...extracted.coreCS, ...extracted.languages, ...extracted.web, ...extracted.data, ...extracted.cloud, ...extracted.testing, ...extracted.other);
  return out;
}

const CATEGORY_LABELS: Record<keyof ExtractedSkillsStrict, string> = {
  coreCS: 'Core CS',
  languages: 'Languages',
  web: 'Web',
  data: 'Data',
  cloud: 'Cloud/DevOps',
  testing: 'Testing',
  other: 'Other',
};

export function getSkillsWithCategory(extracted: ExtractedSkillsStrict): { category: string; skill: string }[] {
  const out: { category: string; skill: string }[] = [];
  for (const key of Object.keys(CATEGORY_LABELS) as (keyof ExtractedSkillsStrict)[]) {
    const arr = extracted[key];
    const label = CATEGORY_LABELS[key];
    if (Array.isArray(arr)) for (const skill of arr) out.push({ category: label, skill });
  }
  return out;
}

/** Convert strict extracted skills back to legacy byCategory for companyIntel/buildRoundMapping. */
export function strictToByCategory(extracted: ExtractedSkillsStrict): Record<string, string[]> {
  const byCategory: Record<string, string[]> = {};
  if (extracted.coreCS.length) byCategory['Core CS'] = extracted.coreCS;
  if (extracted.languages.length) byCategory['Languages'] = extracted.languages;
  if (extracted.web.length) byCategory['Web'] = extracted.web;
  if (extracted.data.length) byCategory['Data'] = extracted.data;
  if (extracted.cloud.length) byCategory['Cloud/DevOps'] = extracted.cloud;
  if (extracted.testing.length) byCategory['Testing'] = extracted.testing;
  if (extracted.other.length) byCategory['Other'] = extracted.other;
  return byCategory;
}

export function isHistoryEntryStrict(e: unknown): e is HistoryEntryStrict {
  if (typeof e !== 'object' || e === null) return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.createdAt === 'string' &&
    (typeof o.company === 'string' || o.company === undefined) &&
    (typeof o.role === 'string' || o.role === undefined) &&
    typeof o.jdText === 'string' &&
    typeof o.extractedSkills === 'object' &&
    o.extractedSkills !== null &&
    typeof o.questions === 'object' &&
    Array.isArray(o.questions) &&
    typeof o.baseScore === 'number' &&
    typeof o.finalScore === 'number' &&
    typeof o.updatedAt === 'string'
  );
}
