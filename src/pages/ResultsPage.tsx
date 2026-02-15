import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getEntryById, getLatestEntry, type HistoryEntry } from '../lib/history';
import { Link } from 'react-router-dom';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [notFound, setNotFound] = useState(false);

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

  const { company, role, extractedSkills, checklist, plan, questions, readinessScore } = entry;
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

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
              <span className="text-2xl font-bold text-gray-900">{readinessScore}</span>
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
                <span className="text-xs font-medium text-gray-500">{category}:</span>
                {skills.map((s) => (
                  <span key={s} className="inline-flex px-2.5 py-0.5 rounded-md bg-primary-light text-primary text-sm">{s}</span>
                ))}
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
    </div>
  );
}
