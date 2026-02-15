import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { runAnalysis } from '../lib/jdAnalysis';
import { saveToHistory } from '../lib/history';
import { buildCompanyIntel, buildRoundMapping } from '../lib/companyIntel';
import { History } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssessmentsPage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [shortJdWarning, setShortJdWarning] = useState(false);

  const handleAnalyze = () => {
    setError('');
    setShortJdWarning(false);
    const trimmed = jdText.trim();
    if (!trimmed) {
      setError('Please paste the job description text.');
      return;
    }
    if (trimmed.length < 200) {
      setShortJdWarning(true);
    }
    setIsAnalyzing(true);
    try {
      const result = runAnalysis(trimmed, company, role);
      const companyIntel = company.trim()
        ? buildCompanyIntel(company, trimmed)
        : undefined;
      const roundMapping = company.trim()
        ? buildRoundMapping(company, result.extractedSkills)
        : undefined;
      const entry = saveToHistory({
        company: company ?? '',
        role: role ?? '',
        jdText: trimmed,
        extractedSkills: result.extractedSkills,
        plan: result.plan,
        checklist: result.checklist,
        questions: result.questions,
        readinessScore: result.readinessScore,
        companyIntel,
        roundMapping,
      });
      navigate(`/dashboard/results?id=${entry.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">JD Analysis</h2>
        <Link to="/dashboard/history" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover">
          <History className="w-4 h-4" />
          View history
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze job description</CardTitle>
          <CardDescription>
            Paste a job description below. We extract skills, build a checklist, 7-day plan, and likely questions. No data is sent externally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Microsoft"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role (optional)</label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SDE 1, Frontend Developer"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="jd" className="block text-sm font-medium text-gray-700 mb-1">Job description *</label>
            <textarea
              id="jd"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {shortJdWarning && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This JD is too short to analyze deeply. Paste full JD for better output.
            </p>
          )}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
