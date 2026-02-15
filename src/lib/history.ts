/**
 * Persist analysis history in localStorage. Strict schema, validation, and robustness.
 */

import type { AnalysisResult } from './jdAnalysis';
import type { ExtractedSkills } from './jdAnalysis';
import type { CompanyIntel } from './companyIntel';
import type { RoundMappingItem } from './companyIntel';
import {
  type HistoryEntryStrict,
  type ExtractedSkillsStrict,
  toStrictExtractedSkills,
  toStrictRoundMapping,
  toStrictChecklist,
  toStrictPlan7Days,
  computeFinalScore,
  getAllSkillsFromStrict,
  isHistoryEntryStrict,
} from './schema';

const STORAGE_KEY = 'placement_readiness_history';

export type SkillConfidence = 'know' | 'practice';

export type HistoryEntry = HistoryEntryStrict & {
  companyIntel?: CompanyIntel;
};

function now(): string {
  return new Date().toISOString();
}

export type GetHistoryResult = { entries: HistoryEntry[]; corruptedCount: number };

export function getHistory(): HistoryEntry[] {
  return getHistoryWithMeta().entries;
}

export function getHistoryWithMeta(): GetHistoryResult {
  let corruptedCount = 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [], corruptedCount: 0 };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { entries: [], corruptedCount: 0 };
    const entries: HistoryEntry[] = [];
    for (const item of parsed) {
      const migrated = migrateEntry(item);
      if (migrated && isHistoryEntryStrict(migrated)) {
        entries.push(migrated as HistoryEntry);
      } else {
        corruptedCount += 1;
      }
    }
    return { entries, corruptedCount };
  } catch {
    return { entries: [], corruptedCount: 0 };
  }
}

function migrateEntry(item: unknown): HistoryEntryStrict | null {
  if (item === null || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.jdText !== 'string') return null;

  const company = typeof o.company === 'string' ? o.company : '';
  const role = typeof o.role === 'string' ? o.role : '';
  const createdAt = typeof o.createdAt === 'string' ? o.createdAt : now();

  let extractedSkills: ExtractedSkillsStrict;
  if (o.extractedSkills && typeof o.extractedSkills === 'object' && !Array.isArray(o.extractedSkills)) {
    const es = o.extractedSkills as Record<string, unknown>;
    const byCategory = es.byCategory as Record<string, string[]> | undefined;
    const generalFresher = Boolean(es.generalFresher);
    if (byCategory) {
      extractedSkills = toStrictExtractedSkills(byCategory, generalFresher);
    } else {
      extractedSkills = {
        coreCS: Array.isArray(es.coreCS) ? es.coreCS : [],
        languages: Array.isArray(es.languages) ? es.languages : [],
        web: Array.isArray(es.web) ? es.web : [],
        data: Array.isArray(es.data) ? es.data : [],
        cloud: Array.isArray(es.cloud) ? es.cloud : [],
        testing: Array.isArray(es.testing) ? es.testing : [],
        other: Array.isArray(es.other) ? es.other : [],
      };
    }
  } else {
    extractedSkills = { coreCS: [], languages: [], web: [], data: [], cloud: [], testing: [], other: [] };
  }

  let roundMapping: HistoryEntryStrict['roundMapping'];
  const rm = o.roundMapping;
  if (Array.isArray(rm) && rm.length > 0) {
    const first = rm[0] as Record<string, unknown>;
    if (first.roundTitle !== undefined && first.focusAreas !== undefined) {
      roundMapping = rm as HistoryEntryStrict['roundMapping'];
    } else {
      roundMapping = toStrictRoundMapping(rm as { round: number; title: string; description: string; whyItMatters: string }[]);
    }
  } else {
    roundMapping = [];
  }

  let checklist: HistoryEntryStrict['checklist'];
  const cl = o.checklist;
  if (Array.isArray(cl) && cl.length > 0) {
    const first = cl[0] as Record<string, unknown>;
    if (first.roundTitle !== undefined) {
      checklist = cl as HistoryEntryStrict['checklist'];
    } else {
      checklist = toStrictChecklist(cl as { round: string; items: string[] }[]);
    }
  } else {
    checklist = [];
  }

  let plan7Days: HistoryEntryStrict['plan7Days'];
  const plan = o.plan7Days ?? o.plan;
  if (Array.isArray(plan) && plan.length > 0) {
    const first = plan[0] as Record<string, unknown>;
    if (first.focus !== undefined) {
      plan7Days = plan as HistoryEntryStrict['plan7Days'];
    } else {
      plan7Days = toStrictPlan7Days(plan as { day: number; title: string; tasks: string[] }[]);
    }
  } else {
    plan7Days = [];
  }

  const questions = Array.isArray(o.questions) ? o.questions : [];
  const baseScore = typeof o.baseScore === 'number' ? o.baseScore : (typeof o.readinessScore === 'number' ? o.readinessScore : 0);
  const skillConfidenceMap = (o.skillConfidenceMap && typeof o.skillConfidenceMap === 'object') ? (o.skillConfidenceMap as Record<string, SkillConfidence>) : {};
  const allSkills = getAllSkillsFromStrict(extractedSkills);
  const finalScore = typeof o.finalScore === 'number' ? o.finalScore : computeFinalScore(baseScore, skillConfidenceMap, allSkills);
  const updatedAt = typeof o.updatedAt === 'string' ? o.updatedAt : createdAt;

  return {
    id: o.id as string,
    createdAt,
    company,
    role,
    jdText: o.jdText as string,
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions: questions.map(String),
    baseScore,
    skillConfidenceMap,
    finalScore,
    updatedAt,
  };
}

export function getEntryById(id: string): HistoryEntry | null {
  const { entries } = getHistoryWithMeta();
  const found = entries.find((e) => e.id === id);
  return found ?? null;
}

export function getLatestEntry(): HistoryEntry | null {
  const { entries } = getHistoryWithMeta();
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return sorted[0];
}

type SaveInput = {
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkills;
  plan: AnalysisResult['plan'];
  checklist: AnalysisResult['checklist'];
  questions: string[];
  readinessScore: number;
  companyIntel?: CompanyIntel;
  roundMapping?: RoundMappingItem[];
};

export function saveToHistory(input: SaveInput): HistoryEntry {
  const { entries } = getHistoryWithMeta();
  const id = crypto.randomUUID();
  const createdAt = now();
  const company = input.company ?? '';
  const role = input.role ?? '';
  const extractedSkills = toStrictExtractedSkills(input.extractedSkills.byCategory, input.extractedSkills.generalFresher);
  const roundMapping = input.roundMapping ? toStrictRoundMapping(input.roundMapping) : [];
  const checklist = toStrictChecklist(input.checklist);
  const plan7Days = toStrictPlan7Days(input.plan);
  const questions = input.questions ?? [];
  const baseScore = input.readinessScore;
  const skillConfidenceMap: Record<string, SkillConfidence> = {};
  const allSkills = getAllSkillsFromStrict(extractedSkills);
  const finalScore = computeFinalScore(baseScore, skillConfidenceMap, allSkills);

  const entry: HistoryEntry = {
    id,
    createdAt,
    company,
    role,
    jdText: input.jdText,
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions,
    baseScore,
    skillConfidenceMap,
    finalScore,
    updatedAt: createdAt,
    companyIntel: input.companyIntel,
  };

  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entry;
}

export function updateHistoryEntry(
  id: string,
  updates: Partial<Pick<HistoryEntry, 'skillConfidenceMap' | 'finalScore'>>
): void {
  const { entries } = getHistoryWithMeta();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return;
  const next = {
    ...entries[index],
    ...updates,
    updatedAt: now(),
  };
  entries[index] = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
