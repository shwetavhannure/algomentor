import { useId } from 'react';
import { Link } from 'react-router-dom';

// Code-brackets mark: </> with an amber slash, on the brand gradient
export function LogoMark({ className = 'h-11 w-11' }) {
  const gid = useId();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#12737b" />
          <stop offset="1" stopColor="#2a9d8f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gid})`} />
      <path d="M12.2 10.2 6.6 16l5.6 5.8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.8 10.2 25.4 16l-5.6 5.8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.6 8.6 14.4 23.4" stroke="#f4b13e" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ compact = false, light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3" aria-label="AlgoMentor home">
      <LogoMark />
      {!compact && (
        <span
          className={`font-display text-xl font-extrabold tracking-tight sm:text-2xl ${
            light ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          Algo<span className={light ? 'text-teal-100' : 'text-indigo-600 dark:text-indigo-400'}>Mentor</span>
        </span>
      )}
    </Link>
  );
}
