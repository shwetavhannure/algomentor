import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, FileQuestion, CheckCircle2, CircleDashed } from 'lucide-react';
import api from '../api/client';
import { getErrorMessage } from '../utils/errors';
import { TOPICS, DIFFICULTIES } from '../constants/topics';
import { difficultyClass, isSolvedStatus } from '../utils/format';
import HintDots from '../components/HintDots';
import Sheet from '../components/Sheet';
import ErrorState from '../components/ErrorState';
import { CardGridSkeleton } from '../components/Skeleton';
import { inputCls, btnPrimary, btnGhost, cardCls } from '../utils/ui';

export default function Problems() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [problems, setProblems] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');

  const topic = params.get('topic') || '';
  const status = params.get('status') || '';
  const difficulty = params.get('difficulty') || '';

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // wait a little while typing before calling the API
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setProblems(null);
    setError('');
    api
      .get('/problems', { params: { topic, status, difficulty, search: debounced } })
      .then(({ data }) => !cancelled && setProblems(data.problems))
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => { cancelled = true; };
  }, [topic, status, difficulty, debounced, reloadKey]);

  const filterCount = [topic, status, difficulty].filter(Boolean).length;

  const filterFields = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <select className={inputCls} value={topic} onChange={(e) => setFilter('topic', e.target.value)} aria-label="Topic">
        <option value="">All topics</option>
        {TOPICS.map((t) => <option key={t}>{t}</option>)}
      </select>
      <select className={inputCls} value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Status">
        <option value="">Any status</option>
        <option value="attempting">Attempting</option>
        <option value="solved">Solved</option>
      </select>
      <select className={inputCls} value={difficulty} onChange={(e) => setFilter('difficulty', e.target.value)} aria-label="Difficulty">
        <option value="">Any difficulty</option>
        {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Problems</h1>
        <Link to="/workspace" className={btnPrimary}><Plus className="h-4 w-4" /> New problem</Link>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button type="button" className={`${btnGhost} md:hidden`} onClick={() => setShowFilters(true)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters{filterCount > 0 && ` (${filterCount})`}
        </button>
      </div>

      <div className="hidden md:block">{filterFields}</div>
      <Sheet open={showFilters} title="Filters" onClose={() => setShowFilters(false)}>
        <div className="space-y-3">
          {filterFields}
          <button type="button" className={`${btnPrimary} w-full`} onClick={() => setShowFilters(false)}>Show results</button>
        </div>
      </Sheet>

      {error && <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!error && problems === null && <CardGridSkeleton />}

      {problems && problems.length === 0 && (
        <div className={`${cardCls} py-12 text-center`}>
          <FileQuestion className="mx-auto h-10 w-10 text-indigo-500" />
          <p className="mt-3 font-semibold">{filterCount || debounced ? 'No problems match your filters' : 'No problems yet'}</p>
          <p className="mt-1 text-sm text-slate-500">Add a problem and start practicing.</p>
          <Link to="/workspace" className={`${btnPrimary} mt-4`}>New problem</Link>
        </div>
      )}

      {problems && problems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {problems.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => navigate(`/workspace/${p._id}`)}
              className={`${cardCls} text-left transition hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700`}
            >
              <h3 className="line-clamp-2 font-semibold">{p.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{p.topic}</span>
                <span className={`rounded-full px-2 py-1 font-medium ${difficultyClass(p.difficulty)}`}>{p.difficulty}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  {isSolvedStatus(p.status)
                    ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Solved</>
                    : <><CircleDashed className="h-4 w-4 text-amber-500" /> Attempting</>}
                </span>
                <HintDots level={p.highestHintLevel} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}