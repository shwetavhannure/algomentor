import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListChecks, CheckCircle2, Flame, Brain, Plus, Target } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid,
} from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../utils/errors';
import ErrorState from '../components/ErrorState';
import { StatCardSkeleton, Skeleton } from '../components/Skeleton';
import { btnPrimary, cardCls } from '../utils/ui';
import { PRACTICE_LIBRARY } from '../data/practiceLibrary';

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // api client already retries while the database is warming up, so an error
  // here means the connection really failed
  const load = useCallback(() => {
    setError('');
    setStats(null);
    api.get('/stats', { params: { tz: new Date().getTimezoneOffset() } }).then(({ data }) => setStats(data)).catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayName = user?.name?.trim() || 'there';
  const dark = theme === 'dark';
  const tickStyle = { fill: dark ? '#cbd5e1' : '#475569', fontSize: 12 };
  const axisColor = dark ? '#64748b' : '#94a3b8';
  const gridColor = dark ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`,
    backgroundColor: dark ? '#0f172a' : '#ffffff',
    color: dark ? '#e2e8f0' : '#0f172a',
    fontSize: 12,
  };

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => <StatCardSkeleton key={n} />)}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const { totals, perTopic, weakTopics, solvedPerDay } = stats;
  const cards = [
    { label: 'Total problems', value: PRACTICE_LIBRARY.length, icon: ListChecks, color: 'text-indigo-500' },
    { label: 'Solved', value: totals.solved, icon: CheckCircle2, color: 'text-teal-600' },
    {
      label: 'Current streak',
      value: `${totals.streak} ${totals.streak === 1 ? 'day' : 'days'}`,
      icon: Flame,
      color: 'text-amber-500',
      hint: 'Days in a row with at least one problem solved',
    },
    {
      label: 'Independence score',
      value: totals.independence === null ? '-' : `${totals.independence}%`,
      icon: Brain,
      color: 'text-sky-600',
      hint: 'Share of solved problems where you needed hint 1 or 2 at most',
    },
  ];
  const activity = solvedPerDay.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Hi, {displayName}</h1>
        <Link to="/problems" className={btnPrimary}><Plus className="h-4 w-4" /> Practice a problem</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} title={c.hint} className={`${cardCls} flex flex-col items-center justify-center text-center`}>
            <c.icon className={`h-5 w-5 ${c.color}`} />
            <p className="mt-2 text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      {totals.problems === 0 ? (
        <div className={`${cardCls} py-10 text-center`}>
          <Target className="mx-auto h-10 w-10 text-indigo-500" />
          <p className="mt-3 font-semibold">No problems yet</p>
          <p className="mt-1 text-sm text-slate-500">Choose a curated problem and start practicing to build your progress.</p>
          <Link to="/problems" className={`${btnPrimary} mt-4`}>Browse practice problems</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={cardCls}>
            <h2 className="mb-3 text-sm font-semibold">Topic breakdown</h2>
            <ResponsiveContainer width="100%" height={Math.max(220, perTopic.length * 40)}>
              <BarChart data={perTopic} layout="vertical" margin={{ left: 0, right: 12 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={tickStyle} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
                <YAxis type="category" dataKey="topic" width={100} tick={tickStyle} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: dark ? '#1e293b' : '#f1f5f9' }} />
                <Bar dataKey="count" name="Problems" fill="#0d9488" radius={[0, 6, 6, 0]} />
                <Bar dataKey="solvedCount" name="Solved" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={cardCls}>
            <h2 className="mb-3 text-sm font-semibold">Solved in the last 14 days</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={activity} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={tickStyle} interval="preserveStartEnd" axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
                <YAxis allowDecimals={false} tick={tickStyle} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: dark ? '#64748b' : '#94a3b8', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="count" name="Solved" stroke="#0d9488" strokeWidth={3} dot={{ r: 3, fill: '#0d9488', stroke: dark ? '#0f172a' : '#ffffff', strokeWidth: 2 }} activeDot={{ r: 5 }} fill="#0d9488" fillOpacity={dark ? 0.24 : 0.14} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className={cardCls}>
        <h2 className="mb-3 text-sm font-semibold">Weak topics</h2>
        {weakTopics.length === 0 ? (
          <p className="text-sm text-slate-500">Solve a few problems and your weak topics will show here.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {weakTopics.map((t) => (
              <li key={t.topic} className="flex items-center justify-between gap-3 py-3">
                <span className="font-medium">{t.topic}</span>
                <button
                  type="button"
                  onClick={() => navigate(`/problems?topic=${encodeURIComponent(t.topic)}`)}
                  className="h-11 rounded-xl px-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                >
                  Practice this topic
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
