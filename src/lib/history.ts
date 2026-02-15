/**
 * Persist analysis history in localStorage. No external APIs.
 */

import type { AnalysisResult } from './jdAnalysis';
import type { ExtractedSkills } from './jdAnalysis';
import type { CompanyIntel, RoundMappingItem } from './companyIntel';

const STORAGE_KEY = 'placement_readiness_history';

export type SkillConfidence = 'know' | 'practice';

export type HistoryEntry = {
  id: string;
  createdAt: string; // ISO
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkills;
  plan: AnalysisResult['plan'];
  checklist: AnalysisResult['checklist'];
  questions: AnalysisResult['questions'];
  readinessScore: number; // base score (0–100)
  skillConfidenceMap?: Record<string, SkillConfidence>;
  companyIntel?: CompanyIntel;
  roundMapping?: RoundMappingItem[];
};

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getEntryById(id: string): HistoryEntry | null {
  const list = getHistory();
  return list.find(e => e.id === id) ?? null;
}

export function getLatestEntry(): HistoryEntry | null {
  const list = getHistory();
  if (list.length === 0) return null;
  const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return sorted[0];
}

export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
  const list = getHistory();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const full: HistoryEntry = {
    ...entry,
    id,
    createdAt,
  };
  list.unshift(full);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return full;
}

export function updateHistoryEntry(
  id: string,
  updates: Partial<Pick<HistoryEntry, 'skillConfidenceMap' | 'readinessScore' | 'companyIntel' | 'roundMapping'>>
): void {
  const list = getHistory();
  const index = list.findIndex(e => e.id === id);
  if (index === -1) return;
  const next = { ...list[index], ...updates };
  list[index] = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
