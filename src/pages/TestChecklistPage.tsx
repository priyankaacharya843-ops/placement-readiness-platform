import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
}

const DEFAULT_TESTS: ChecklistItem[] = [
  {
    id: 'jd-validation',
    label: 'JD required validation works',
    hint: 'Try submitting without JD text - should show an error',
    checked: false,
  },
  {
    id: 'short-jd-warning',
    label: 'Short JD warning shows for <200 chars',
    hint: 'Enter less than 200 characters and check for warning message',
    checked: false,
  },
  {
    id: 'skills-extraction',
    label: 'Skills extraction groups correctly',
    hint: 'Verify extracted skills are organized by category (DSA, Backend, etc.)',
    checked: false,
  },
  {
    id: 'round-mapping',
    label: 'Round mapping changes based on company + skills',
    hint: 'Analyze JD for different companies and verify round titles change',
    checked: false,
  },
  {
    id: 'score-calculation',
    label: 'Score calculation is deterministic',
    hint: 'Analyze the same JD twice and verify the score is identical',
    checked: false,
  },
  {
    id: 'skill-toggles',
    label: 'Skill toggles update score live',
    hint: 'On Results page, toggle skill confidence and watch score update',
    checked: false,
  },
  {
    id: 'changes-persist',
    label: 'Changes persist after refresh',
    hint: 'Toggle a skill, refresh the page, and verify the change remains',
    checked: false,
  },
  {
    id: 'history-save',
    label: 'History saves and loads correctly',
    hint: 'Navigate to History page and verify past analyses are listed',
    checked: false,
  },
  {
    id: 'export-buttons',
    label: 'Export buttons copy the correct content',
    hint: 'Click export buttons and verify copied content in clipboard',
    checked: false,
  },
  {
    id: 'no-console-errors',
    label: 'No console errors on core pages',
    hint: 'Open DevTools console and navigate through all pages - should be clean',
    checked: false,
  },
];

const STORAGE_KEY = 'prp-test-checklist';

export default function TestChecklistPage() {
  const [tests, setTests] = useState<ChecklistItem[]>(DEFAULT_TESTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTests(parsed);
      } catch (e) {
        console.error('Failed to parse stored checklist:', e);
        setTests(DEFAULT_TESTS);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever tests change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    }
  }, [tests, isLoaded]);

  const toggleTest = (id: string) => {
    setTests(tests.map(test =>
      test.id === id ? { ...test, checked: !test.checked } : test
    ));
  };

  const handleReset = () => {
    if (window.confirm('Reset all tests to unchecked? This cannot be undone.')) {
      setTests(DEFAULT_TESTS);
    }
  };

  const passedCount = tests.filter(t => t.checked).length;
  const totalCount = tests.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Test Checklist</h2>

      {/* Summary Card */}
      <Card className={allPassed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
        <CardHeader>
          <CardTitle className={allPassed ? 'text-green-900' : 'text-orange-900'}>
            Tests Passed: {passedCount} / {totalCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!allPassed && (
            <div className="flex items-start gap-3 p-3 bg-orange-100 rounded-lg border border-orange-300">
              <AlertCircle className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 font-medium">
                Fix issues before shipping.
              </p>
            </div>
          )}
          {allPassed && (
            <div className="p-3 bg-green-100 rounded-lg border border-green-300">
              <p className="text-sm text-green-800 font-medium">
                ✓ All tests passed! Ready to ship.
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <a
              href="/dashboard/results"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              Go to Results
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset checklist
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Test Items */}
      <Card>
        <CardHeader>
          <CardTitle>Test Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  id={test.id}
                  checked={test.checked}
                  onChange={() => toggleTest(test.id)}
                  className="w-5 h-5 rounded border-gray-300 text-primary cursor-pointer mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={test.id}
                    className="block text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {test.label}
                  </label>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
                      How to test
                    </summary>
                    <p className="text-xs text-gray-600 mt-2 whitespace-normal">
                      {test.hint}
                    </p>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Testing Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Manually verify each feature before marking as complete</p>
          <p>• Open DevTools (F12) to check for console errors</p>
          <p>• Test on different browsers if possible</p>
          <p>• Use the History page to verify data persistence across sessions</p>
          <p>• Complete all tests before attempting to access the Ship page</p>
        </CardContent>
      </Card>
    </div>
  );
}
