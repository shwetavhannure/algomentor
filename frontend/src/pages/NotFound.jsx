import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { btnPrimary } from '../utils/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <SearchX className="h-12 w-12 text-indigo-500" />
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">The page you are looking for does not exist.</p>
      <Link to="/" className={`${btnPrimary} mt-6`}>Go home</Link>
    </div>
  );
}