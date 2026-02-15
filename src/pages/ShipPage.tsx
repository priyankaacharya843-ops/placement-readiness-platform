import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'prp-test-checklist';
const TEST_COUNT = 10;
const PROOF_STORAGE_KEY = 'prp_final_submission';

interface ChecklistItem {
  checked: boolean;
  [key: string]: any;
}

export default function ShipPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passedCount, setPassedCount] = useState(0);
  const [hasAllProofLinks, setHasAllProofLinks] = useState(false);
  const [isShipped, setIsShipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check test checklist
    const stored = localStorage.getItem(STORAGE_KEY);
    let passed = 0;
    if (stored) {
      try {
        const tests: ChecklistItem[] = JSON.parse(stored);
        passed = tests.filter(t => t.checked).length;
        setPassedCount(passed);
      } catch (e) {
        console.error('Failed to parse stored checklist:', e);
      }
    }

    // Check proof links
    const proofStored = localStorage.getItem(PROOF_STORAGE_KEY);
    let hasProofLinks = false;
    if (proofStored) {
      try {
        const proof = JSON.parse(proofStored);
        const isValidUrl = (str: string) => {
          try {
            new URL(str);
            return true;
          } catch {
            return false;
          }
        };

        hasProofLinks =
          proof.lovableProjectLink &&
          proof.githubRepositoryLink &&
          proof.deployedURL &&
          isValidUrl(proof.lovableProjectLink) &&
          isValidUrl(proof.githubRepositoryLink) &&
          isValidUrl(proof.deployedURL);
      } catch (e) {
        console.error('Failed to parse proof links:', e);
      }
    }

    setHasAllProofLinks(hasProofLinks);

    // Determine if shipped: all tests passed AND all proof links provided
    const allTestsPassed = passed === TEST_COUNT;
    const shipped = allTestsPassed && hasProofLinks;
    setIsUnlocked(allTestsPassed);
    setIsShipped(shipped);

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Ship</h2>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          isShipped 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isShipped ? 'Shipped' : 'In Progress'}
        </div>
      </div>

      {isShipped ? (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              You Built a Real Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white/80 rounded-lg border border-green-200">
              <p className="text-base font-medium text-gray-900 mb-2">
                Not a tutorial. Not a clone. A structured tool that solves a real problem.
              </p>
              <p className="text-sm text-gray-700 italic">
                This is your proof of work.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">All Tests Passed</p>
                  <p className="text-sm text-gray-600">{passedCount} / {TEST_COUNT} quality checks completed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">All Proof Links Provided</p>
                  <p className="text-sm text-gray-600">Lovable, GitHub, and Deployment URLs verified</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>JD skill extraction (deterministic)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Round mapping engine</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>7-day prep plan generation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Interactive readiness scoring</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>History persistence</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !isUnlocked ? (
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
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Complete Requirements to Ship
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {!isUnlocked && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Tests Not Completed
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Tests Passed: {passedCount} / {TEST_COUNT}
                    </p>
                  </div>
                </div>
              )}

              {!hasAllProofLinks && isUnlocked && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Proof Links Required
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Add your Lovable, GitHub, and deployment links to complete shipping.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                To ship your project, you must:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span>1. Pass all 10 tests</span>
                </li>
                <li className="flex items-center gap-2">
                  {hasAllProofLinks ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span>2. Provide proof links</span>
                </li>
              </ul>
            </div>

            {!isUnlocked && (
              <Link
                to="/dashboard/test"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                Go to Test Checklist
              </Link>
            )}

            {isUnlocked && !hasAllProofLinks && (
              <Link
                to="/dashboard/proof"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                Go to Proof Page
              </Link>
            )}
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
