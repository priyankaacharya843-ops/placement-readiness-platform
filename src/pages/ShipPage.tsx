import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, CheckCircle2, Lock, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'prp-test-checklist';
const TEST_COUNT = 10;

interface ChecklistItem {
  checked: boolean;
  [key: string]: any;
}

export default function ShipPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passedCount, setPassedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const tests: ChecklistItem[] = JSON.parse(stored);
        const passed = tests.filter(t => t.checked).length;
        setPassedCount(passed);
        setIsUnlocked(passed === TEST_COUNT);
      } catch (e) {
        console.error('Failed to parse stored checklist:', e);
        setIsUnlocked(false);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Ship</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Ship</h2>

      {!isUnlocked ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Ship Locked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-100 rounded-lg border border-red-300">
              <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Cannot proceed until all tests are passed.
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Tests Passed: {passedCount} / {TEST_COUNT}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700">
              You must complete all {TEST_COUNT} tests in the Test Checklist before you can ship. This ensures quality and functionality.
            </p>

            <Link
              to="/dashboard/test"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              Go to Test Checklist
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Ready to Ship!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-100 rounded-lg border border-green-300">
              <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  All tests passed! ({passedCount} / {TEST_COUNT})
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Your placement readiness platform is ready for production.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Review the quality assurance report</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Deploy to production environment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Set up monitoring and logging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Enable analytics tracking</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Deploy to Production
            </button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Assurance Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            All {TEST_COUNT} tests must pass before shipping to ensure platform reliability and user experience.
          </p>
          <div className="grid gap-2 text-xs text-gray-600">
            <div>✓ Input validation is working correctly</div>
            <div>✓ User data is persisted across sessions</div>
            <div>✓ Calculations are deterministic and accurate</div>
            <div>✓ UI interactions are responsive and error-free</div>
            <div>✓ No console errors on core user paths</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
