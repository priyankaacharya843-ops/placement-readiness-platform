import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, CheckCircle2, Copy, Lock } from 'lucide-react';

const STORAGE_KEY = 'prp_final_submission';
const TEST_CHECKLIST_KEY = 'prp-test-checklist';

interface ProofSubmission {
  lovableProjectLink: string;
  githubRepositoryLink: string;
  deployedURL: string;
}

interface ChecklistItem {
  checked: boolean;
  [key: string]: any;
}

const STEPS = [
  { id: 1, title: 'Analyze JD', description: 'Extract skills from job description' },
  { id: 2, title: 'Map Rounds', description: 'Determine interview rounds based on skills' },
  { id: 3, title: 'Score Readiness', description: 'Calculate placement readiness score' },
  { id: 4, title: 'Generate Prep Plan', description: 'Create 7-day preparation plan' },
  { id: 5, title: 'Track Progress', description: 'Monitor practice and preparation' },
  { id: 6, title: 'Review History', description: 'Access past analyses and results' },
  { id: 7, title: 'View Resources', description: 'Access learning materials and guides' },
  { id: 8, title: 'Build Profile', description: 'Complete user profile and preferences' },
];

export default function ProofPage() {
  const [submission, setSubmission] = useState<ProofSubmission>({
    lovableProjectLink: '',
    githubRepositoryLink: '',
    deployedURL: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testsCompleted, setTestsCompleted] = useState(0);
  const [allLinksProvided, setAllLinksProvided] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved submission on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSubmission(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load submission:', e);
      }
    }

    // Load test checklist
    const testStored = localStorage.getItem(TEST_CHECKLIST_KEY);
    if (testStored) {
      try {
        const tests: ChecklistItem[] = JSON.parse(testStored);
        const passed = tests.filter(t => t.checked).length;
        setTestsCompleted(passed);
      } catch (e) {
        console.error('Failed to parse tests:', e);
      }
    }

    setIsLoading(false);
  }, []);

  // Check if all links are valid URLs and provided
  useEffect(() => {
    const isValidUrl = (str: string) => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    };

    const hasAllLinks =
      submission.lovableProjectLink &&
      submission.githubRepositoryLink &&
      submission.deployedURL &&
      isValidUrl(submission.lovableProjectLink) &&
      isValidUrl(submission.githubRepositoryLink) &&
      isValidUrl(submission.deployedURL);

    setAllLinksProvided(!!hasAllLinks);
  }, [submission]);

  const handleInputChange = (field: keyof ProofSubmission, value: string) => {
    setSubmission(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};
    const isValidUrl = (str: string) => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    };

    if (!submission.lovableProjectLink) {
      newErrors.lovableProjectLink = 'Lovable Project Link is required';
    } else if (!isValidUrl(submission.lovableProjectLink)) {
      newErrors.lovableProjectLink = 'Please enter a valid URL';
    }

    if (!submission.githubRepositoryLink) {
      newErrors.githubRepositoryLink = 'GitHub Repository Link is required';
    } else if (!isValidUrl(submission.githubRepositoryLink)) {
      newErrors.githubRepositoryLink = 'Please enter a valid URL';
    }

    if (!submission.deployedURL) {
      newErrors.deployedURL = 'Deployed URL is required';
    } else if (!isValidUrl(submission.deployedURL)) {
      newErrors.deployedURL = 'Please enter a valid URL';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submission));
    setErrors({});
  };

  const copyFinalSubmission = () => {
    const text = `------------------------------------------
Placement Readiness Platform — Final Submission

Lovable Project: ${submission.lovableProjectLink}
GitHub Repository: ${submission.githubRepositoryLink}
Live Deployment: ${submission.deployedURL}

Core Capabilities:
- JD skill extraction (deterministic)
- Round mapping engine
- 7-day prep plan
- Interactive readiness scoring
- History persistence
------------------------------------------`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Proof of Work</h2>
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
      <h2 className="text-2xl font-semibold text-gray-900">Proof of Work</h2>

      {/* Step Completion Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Step Completion Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(step => (
              <div
                key={step.id}
                className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    <span className="text-xs font-semibold text-green-700 mt-2 block">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Artifact Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Artifact Inputs (Required for Ship Status)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Provide links to your deployed project, repository, and live deployment. All three are required to ship.
          </p>

          {/* Lovable Project Link */}
          <div className="space-y-2">
            <label htmlFor="lovable" className="block text-sm font-medium text-gray-900">
              Lovable Project Link
            </label>
            <input
              id="lovable"
              type="url"
              placeholder="https://lovable.dev/your-project"
              value={submission.lovableProjectLink}
              onChange={e => handleInputChange('lovableProjectLink', e.target.value)}
              onBlur={validateAndSave}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.lovableProjectLink
                  ? 'border-red-300 bg-red-50'
                  : submission.lovableProjectLink
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-white'
              } focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors`}
            />
            {errors.lovableProjectLink && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.lovableProjectLink}
              </p>
            )}
            {submission.lovableProjectLink && !errors.lovableProjectLink && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Valid URL
              </p>
            )}
          </div>

          {/* GitHub Repository Link */}
          <div className="space-y-2">
            <label htmlFor="github" className="block text-sm font-medium text-gray-900">
              GitHub Repository Link
            </label>
            <input
              id="github"
              type="url"
              placeholder="https://github.com/your-username/placement-readiness-platform"
              value={submission.githubRepositoryLink}
              onChange={e => handleInputChange('githubRepositoryLink', e.target.value)}
              onBlur={validateAndSave}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.githubRepositoryLink
                  ? 'border-red-300 bg-red-50'
                  : submission.githubRepositoryLink
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-white'
              } focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors`}
            />
            {errors.githubRepositoryLink && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.githubRepositoryLink}
              </p>
            )}
            {submission.githubRepositoryLink && !errors.githubRepositoryLink && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Valid URL
              </p>
            )}
          </div>

          {/* Deployed URL */}
          <div className="space-y-2">
            <label htmlFor="deployed" className="block text-sm font-medium text-gray-900">
              Deployed URL
            </label>
            <input
              id="deployed"
              type="url"
              placeholder="https://your-deployment.vercel.app"
              value={submission.deployedURL}
              onChange={e => handleInputChange('deployedURL', e.target.value)}
              onBlur={validateAndSave}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.deployedURL
                  ? 'border-red-300 bg-red-50'
                  : submission.deployedURL
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-white'
              } focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors`}
            />
            {errors.deployedURL && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.deployedURL}
              </p>
            )}
            {submission.deployedURL && !errors.deployedURL && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Valid URL
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ship Status Summary */}
      <Card className={allLinksProvided && testsCompleted === 10 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allLinksProvided && testsCompleted === 10 ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-700" />
                <span className="text-green-900">Ready to Ship</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-yellow-700" />
                <span className="text-yellow-900">Ship Requirements</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
              {testsCompleted === 10 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">All 10 Tests Passed</p>
                <p className="text-xs text-gray-600">{testsCompleted} / 10 tests completed</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
              {allLinksProvided ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">All Proof Links Provided</p>
                <p className="text-xs text-gray-600">
                  {Object.values(submission).filter(v => v).length} / 3 links provided
                </p>
              </div>
            </div>
          </div>

          {allLinksProvided && testsCompleted === 10 && (
            <button
              onClick={copyFinalSubmission}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copyFeedback ? 'Copied to clipboard!' : 'Copy Final Submission'}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>What You Built</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            You built a real product. Not a tutorial. Not a clone. A structured tool that solves a real problem.
          </p>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>JD skill extraction (deterministic)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Round mapping engine</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>7-day prep plan generation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Interactive readiness scoring</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>History persistence</span>
            </div>
          </div>
          <p className="pt-2 font-medium text-gray-900 italic">
            "This is your proof of work."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
