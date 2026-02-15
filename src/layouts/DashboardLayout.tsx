import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileCheck,
  FolderOpen,
  User,
  History,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/practice', icon: BookOpen, label: 'Practice' },
  { to: '/dashboard/assessments', icon: ClipboardCheck, label: 'Assessments' },
  { to: '/dashboard/results', icon: FileCheck, label: 'Results' },
  { to: '/dashboard/history', icon: History, label: 'History' },
  { to: '/dashboard/resources', icon: FolderOpen, label: 'Resources' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary font-medium'
                    : 'hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">
            Placement Prep
          </h1>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
        </header>

        <main className="flex-1 min-h-0 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
