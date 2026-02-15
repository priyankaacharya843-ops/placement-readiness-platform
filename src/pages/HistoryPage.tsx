import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { FileText } from 'lucide-react';

type HistoryEntry = {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  readinessScore: number;
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getHistory } = await import('../lib/history');
        const list = getHistory();
        const valid = Array.isArray(list)
          ? list.filter(
              (e: unknown): e is HistoryEntry =>
                typeof e === 'object' &&
                e !== null &&
                typeof (e as HistoryEntry).id === 'string' &&
                typeof (e as HistoryEntry).createdAt === 'string' &&
                typeof (e as HistoryEntry).readinessScore === 'number'
            )
          : [];
        if (mounted) {
          setEntries(valid);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setEntries([]);
          setError(e instanceof Error ? e.message : 'Could not load history');
        }
      }
      if (mounted) setLoaded(true);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6 min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Analysis history</h2>
        <Link
          to="/dashboard/assessments"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          New analysis
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loaded ? (
        <p className="text-gray-500">Loading…</p>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              No analyses yet. Analyze a job description to see entries here.
            </p>
            <Link
              to="/dashboard/assessments"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg"
            >
              Analyze JD
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                to={`/dashboard/results?id=${entry.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {entry.company || 'No company'} · {entry.role || 'No role'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-sm font-medium text-primary">
                      {entry.readinessScore} score
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
