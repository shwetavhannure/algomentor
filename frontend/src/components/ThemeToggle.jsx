import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', variant = 'default' }) {
  const { theme, toggleTheme } = useTheme();
  const focusAppearance = variant === 'plain'
    ? 'focus-visible:ring-2 focus-visible:ring-indigo-500'
    : 'focus:ring-2 focus:ring-indigo-500';
  const appearance = variant === 'plain'
    ? 'border-0 bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl transition focus:outline-none ${focusAppearance} ${appearance} ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
