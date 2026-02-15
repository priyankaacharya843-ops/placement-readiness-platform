import { useSearchParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getEntryById, getLatestEntry, updateHistoryEntry, type HistoryEntry, type SkillConfidence } from '../lib/history';
import { Link } from 'react-router-dom';
import { Copy, Download } from 'lucide-react';

function getAllSkills(entry: HistoryEntry): { category: string; skill: string }[] {
  const out: { category: string; skill: string }[] = [];
  for (const [category, skills] of Object.entries(entry.extractedSkills.byCategory)) {
    for (const skill of skills) {
      out.push({ category, skill });
    }
  }
  return out;
}

function getConfidence(entry: HistoryEntry, skill: string): SkillConfidence {
  return entry.skillConfidenceMap?.[skill] ?? 'practice';
}

function computeLiveScore(entry: HistoryEntry): number {
  const base = entry.readinessScore;
  const skills = getAllSkills(entry);
  let delta = 0;
  for (const { skill } of skills) {
    const c = getConfidence(entry, skill);
    if (c === 'know') delta += 2;
    else delta -= 2;
  }
  return Math.max(0, Math.min(100, base + delta));
}

function formatPlanAsText(plan: HistoryEntry['plan']): string {
  return plan
    .map(({ day, title, tasks }) => {
      const header = `Day ${day}: ${title}`;
      const list = tasks.map(t => `  • ${t}`).join('\n');
      return `${header}\n${list}`;
    })
    .join('\n\n');
}

function formatChecklistAsText(checklist: HistoryEntry['checklist']): string {
  return checklist
    .map(({ round, items }) => {
      const header = round;
      const list = items.map(i => `  • ${i}`).join('\n');
      return `${header}\n${list}`;
    })
    .join('\n\n');
}

function formatQuestionsAsText(questions: string[]): string {
  return questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
}

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const found = getEntryById(id);
      if (found) setEntry(found);
      else setNotFound(true);
    } else {
      const latest = getLatestEntry();
      setEntry(latest);
      if (!latest) setNotFound(true);
    }
  }, [id]);

  const setSkillConfidence = useCallback(
    (skill: string, value: SkillConfidence) => {
      if (!entry) return;
      const nextMap = { ...entry.skillConfidenceMap, [skill]: value };
      const next: HistoryEntry = { ...entry, skillConfidenceMap: nextMap };
      setEntry(next);
      updateHistoryEntry(entry.id, { skillConfidenceMap: nextMap });
    },
    [entry]
  );

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`Copied ${label}`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      setCopyFeedback(`Could not copy ${label}`);
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  }, []);

  const downloadTxt = useCallback(() => {
    if (!entry) return;
    const sections = [
      '=== Readiness Score ===',
      String(computeLiveScore(entry)),
      '',
      '=== Key skills ===',
      ...getAllSkills(entry).map(({ category, skill }) => `${category}: ${skill}`),
      '',
      '=== Round-wise checklist ===',
      formatChecklistAsText(entry.checklist),
      '',
      '=== 7-day plan ===',
      formatPlanAsText(entry.plan),
      '',
      '=== 10 likely questions ===',
      formatQuestionsAsText(entry.questions),
    ];
    const blob = new Blob([sections.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-prep-${entry.company || 'jd'}-${entry.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entry]);

  if (notFound || !entry) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              {notFound ? 'No analysis found for this link.' : 'No analysis yet. Analyze a job description to see results.'}
            </p>
            <Link to="/dashboard/assessments" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg">
              Go to JD Analysis
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const liveScore = computeLiveScore(entry);
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (liveScore / 100) * circumference;
  const { company, role, extractedSkills, checklist, plan, questions } = entry;
  const allSkills = getAllSkills(entry);
  const practiceSkills = allSkills.filter(({ skill }) => getConfidence(entry, skill) === 'practice').map(({ skill }) => skill);
  const top3Weak = practiceSkills.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Analysis results</h2>
        <Link to="/dashboard/assessments" className="text-sm font-medium text-primary hover:text-primary-hover">
          Analyze another JD
        </Link>
      </div>

      {(company || role) && <p className="text-gray-600">{[company, role].filter(Boolean).join(' · ')}</p>}

      <Card>
        <CardHeader><CardTitle>Readiness score</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="hsl(245, 58%, 51%)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{liveScore}</span>
              <span className="text-gray-500 text-xs">/ 100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Key skills extracted</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(extractedSkills.byCategory).map(([category, skills]) => (
              <div key={category} className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 w-full sm:w-auto">{category}:</span>
                {skills.map((skill) => {
                  const confidence = getConfidence(entry, skill);
                  return (
                    <div key={skill} className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white overflow-hidden">
                      <span className="px-2.5 py-0.5 text-sm text-gray-700">{skill}</span>
                      <div className="flex border-l border-gray-200">
                        <button
                          type="button"
                          onClick={() => setSkillConfidence(skill, 'know')}
                          className={`px-2 py-0.5 text-xs font-medium transition-colors ${confidence === 'know' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          I know this
                        </button>
                        <button
                          type="button"
                          onClick={() => setSkillConfidence(skill, 'practice')}
                          className={`px-2 py-0.5 text-xs font-medium transition-colors ${confidence === 'practice' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          Need practice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Round-wise preparation checklist</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {checklist.map(({ round, items }) => (
            <div key={round}>
              <h4 className="font-medium text-gray-900 mb-2">{round}</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                {items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>7-day plan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {plan.map(({ day, title, tasks }) => (
            <div key={day} className="border-l-2 border-primary/30 pl-4">
              <h4 className="font-medium text-gray-900">Day {day}: {title}</h4>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600 text-sm mt-1">
                {tasks.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>10 likely interview questions</CardTitle></CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            {questions.map((q, i) => <li key={i}>{q}</li>)}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Export</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(formatPlanAsText(plan), '7-day plan')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy 7-day plan
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(formatChecklistAsText(checklist), 'round checklist')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy round checklist
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(formatQuestionsAsText(questions), '10 questions')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy 10 questions
          </button>
          <button
            type="button"
            onClick={downloadTxt}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download as TXT
          </button>
          {copyFeedback && <span className="text-sm text-gray-500 self-center">{copyFeedback}</span>}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary-light/30">
        <CardHeader><CardTitle>Action next</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {top3Weak.length > 0 ? (
            <>
              <p className="text-sm text-gray-700">Top weak areas (need practice):</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {top3Weak.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-700">All listed skills marked as known. Keep revising and take mocks.</p>
          )}
          <p className="text-sm font-medium text-gray-900">Start Day 1 plan now.</p>
        </CardContent>
      </Card>
    </div>
  );
}
