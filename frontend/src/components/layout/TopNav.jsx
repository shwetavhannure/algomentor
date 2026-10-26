import { Link, NavLink } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from '../ThemeToggle';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/problems', label: 'Problems' },
  { to: '/workspace', label: 'Workspace' },
  { to: '/profile', label: 'Profile' },
];

export default function TopNav() {
  const { logout, loggingOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 hidden border-b border-slate-200 bg-white/90 backdrop-blur lg:block dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {loggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}

export function PublicTopNav() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to={isAuthenticated ? '/dashboard' : '/auth'}
            className="inline-flex h-11 items-center rounded-xl gradient-primary px-4 text-sm font-medium text-white"
          >
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </Link>
        </div>
      </div>
    </header>
  );
}
