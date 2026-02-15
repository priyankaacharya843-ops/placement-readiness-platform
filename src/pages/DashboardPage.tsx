import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

const READINESS_SCORE = 72;
const READINESS_MAX = 100;
const circleRadius = 45;
const circumference = 2 * Math.PI * circleRadius;
const strokeDashoffset = circumference - (READINESS_SCORE / READINESS_MAX) * circumference;

const skillData = [
  { subject: 'DSA', value: 75, fullMark: 100 },
  { subject: 'System Design', value: 60, fullMark: 100 },
  { subject: 'Communication', value: 80, fullMark: 100 },
  { subject: 'Resume', value: 85, fullMark: 100 },
  { subject: 'Aptitude', value: 70, fullMark: 100 },
];

const weeklyDays = [
  { label: 'Mon', active: true },
  { label: 'Tue', active: true },
  { label: 'Wed', active: false },
  { label: 'Thu', active: true },
  { label: 'Fri', active: true },
  { label: 'Sat', active: true },
  { label: 'Sun', active: false },
];

const upcomingAssessments = [
  { title: 'DSA Mock Test', when: 'Tomorrow, 10:00 AM' },
  { title: 'System Design Review', when: 'Wed, 2:00 PM' },
  { title: 'HR Interview Prep', when: 'Friday, 11:00 AM' },
];

// Last topic progress: set completed === total to see "All topics complete!" state
const lastTopic = {
  name: 'Dynamic Programming',
  completed: 3,
  total: 10,
};
const allTopicsComplete = lastTopic.completed >= lastTopic.total;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Readiness */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  stroke="var(--tw-gradient-from, #e5e7eb)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  stroke="hsl(245, 58%, 51%)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    transition: 'stroke-dashoffset 0.6s ease-in-out',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {READINESS_SCORE}
                </span>
                <span className="text-gray-500 text-sm">Readiness Score</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#374151', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(245, 58%, 51%)"
                    fill="hsl(245, 58%, 51%)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Continue Practice */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allTopicsComplete ? (
              <>
                <p className="text-gray-700 font-medium">All topics complete!</p>
                <p className="text-sm text-gray-500">
                  You’ve finished all practice topics. Review weak areas or take a mock test to stay sharp.
                </p>
                <Link
                  to="/dashboard/practice"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                >
                  Review topics
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium">{lastTopic.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Progress</span>
                    <span>{lastTopic.completed} / {lastTopic.total} completed</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${(lastTopic.completed / lastTopic.total) * 100}%` }}
                    />
                  </div>
                </div>
                <Link
                  to="/dashboard/practice"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                >
                  Continue
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Problems Solved: <span className="font-medium text-gray-900">12/20</span> this week
              </p>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-1">
              {weeklyDays.map(({ label, active }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${
                      active ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Assessments - span full width on 2-col so it sits in one column or we can put it in a single card that spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {upcomingAssessments.map(({ title, when }) => (
                <li
                  key={title}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 first:pt-0 last:pb-0 gap-1"
                >
                  <span className="font-medium text-gray-900">{title}</span>
                  <span className="text-sm text-gray-500">{when}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
