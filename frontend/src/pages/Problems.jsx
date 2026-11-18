import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, FileQuestion, CheckCircle2, CircleDashed, Play, RotateCcw } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { TOPICS, DIFFICULTIES } from '../constants/topics';
import { PRACTICE_LIBRARY } from '../data/practiceLibrary';
import { difficultyClass, isSolvedStatus } from '../utils/format';
import HintDots from '../components/HintDots';
import Sheet from '../components/Sheet';
import ErrorState from '../components/ErrorState';
import { CardGridSkeleton } from '../components/Skeleton';
import { inputCls, btnPrimary, btnGhost, cardCls } from '../utils/ui';
import { lastWorkspaceStorageKey } from '../utils/workspace';

export default function Problems() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [problems, setProblems] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [startingId, setStartingId] = useState('');
  const hasRestoredView = useRef(false);
  const skipNextViewSave = useRef(false);

  const topic = params.get('topic') || '';
  const status = params.get('status') || '';
  const difficulty = params.get('difficulty') || '';
  const savedViewKey = `algomentor_problems_view:${user?.email || 'anonymous'}`;

  // Keep the last selected topic and filters when navigating to another section.
  useEffect(() => {
    if (hasRestoredView.current) return;
    hasRestoredView.current = true;
    if (params.toString()) return;

    const savedView = sessionStorage.getItem(savedViewKey);
    if (savedView) {
      skipNextViewSave.current = true;
      setParams(new URLSearchParams(savedView), { replace: true });
    }
  }, [params, savedViewKey, setParams]);

  useEffect(() => {
    if (!hasRestoredView.current) return;
    if (skipNextViewSave.current) {
      skipNextViewSave.current = false;
      return;
    }
    sessionStorage.setItem(savedViewKey, params.toString());
  }, [params, savedViewKey]);

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
      .get('/problems', { params: { topic, difficulty } })
      .then(({ data }) => !cancelled && setProblems(data.problems))
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => { cancelled = true; };
  }, [topic, difficulty, reloadKey]);

  const filterCount = [topic, status, difficulty].filter(Boolean).length;
  const savedByCatalog = new Map((problems || []).filter((p) => p.catalogId).map((p) => [p.catalogId, p]));
  const visibleLibrary = PRACTICE_LIBRARY.filter((item) => {
    if (topic && item.topic !== topic) return false;
    if (difficulty && item.difficulty !== difficulty) return false;
    if (debounced && !item.title.toLowerCase().includes(debounced.toLowerCase())) return false;
    const saved = savedByCatalog.get(item.id);
    const solved = saved && isSolvedStatus(saved.status);
    if (status === 'not-started' && saved) return false;
    if (status === 'attempting' && (!saved || solved)) return false;
    if (status === 'solved' && !solved) return false;
    return true;
  });

  const startPractice = async (item) => {
    const saved = savedByCatalog.get(item.id);
    if (saved) {
      localStorage.setItem(lastWorkspaceStorageKey(user), saved._id);
      navigate(`/workspace/${saved._id}`);
      return;
    }
    setStartingId(item.id);
    try {
      const { data } = await api.post('/problems', {
        ...item,
        catalogId: item.id,
        language: user?.preferredLanguage || 'javascript',
        userCode: '',
      });
      localStorage.setItem(lastWorkspaceStorageKey(user), data.problem._id);
      navigate(`/workspace/${data.problem._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setStartingId('');
    }
  };

  const filterFields = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <select className={inputCls} value={topic} onChange={(e) => setFilter('topic', e.target.value)} aria-label="Topic">
        <option value="">All topics</option>
        {TOPICS.map((t) => <option key={t}>{t}</option>)}
      </select>
      <select className={inputCls} value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Status">
        <option value="">Any status</option>
        <option value="not-started">Not started</option>
        <option value="attempting">In progress</option>
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input className={`${inputCls} pl-9`} placeholder="Find a practice problem" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {error && <ErrorState message={error} onRetry={() => { setError(''); setReloadKey((k) => k + 1); }} />}

      {status && problems === null ? <CardGridSkeleton /> : (
        <>
          {!topic && !debounced && !status && !difficulty ? (
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">Choose a topic</h2>
                <p className="mt-1 text-sm text-slate-500">Each topic has a steady path from easy warm-ups to harder challenges.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {TOPICS.map((itemTopic) => (
                  <button key={itemTopic} type="button" onClick={() => setFilter('topic', itemTopic)} className={`${cardCls} text-left transition hover:border-teal-300 hover:shadow-sm dark:hover:border-teal-700`}>
                    <span className="font-semibold">{itemTopic}</span>
                    <span className="mt-1 block text-sm text-slate-500">15 practice problems</span>
                  </button>
                ))}
              </div>
            </div>
          ) : visibleLibrary.length === 0 ? (
            <div className={`${cardCls} py-10 text-center`}>
              <FileQuestion className="mx-auto h-10 w-10 text-indigo-500" />
              <p className="mt-3 font-semibold">No practice problems match these filters</p>
              <p className="mt-1 text-sm text-slate-500">Try another topic or difficulty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleLibrary.map((item) => {
                const saved = savedByCatalog.get(item.id);
                const solved = saved && isSolvedStatus(saved.status);
                return (
                  <article key={item.id} className={`${cardCls} flex min-h-40 flex-col justify-between gap-4 transition hover:border-teal-300 dark:hover:border-teal-700`}>
                    <div>
                      <h2 className="font-semibold">{item.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.statement.split('\n\n')[1]}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{item.topic}</span>
                        <span className={`rounded-full px-2 py-1 font-medium ${difficultyClass(item.difficulty)}`}>{item.difficulty}</span>
                        {solved && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Solved</span>}
                        {saved && !solved && <span className="flex items-center gap-1 text-amber-600"><CircleDashed className="h-3.5 w-3.5" /> In progress</span>}
                      </div>
                      {saved && <div className="mt-3"><HintDots level={saved.highestHintLevel} /></div>}
                    </div>
                    <button type="button" onClick={() => startPractice(item)} disabled={Boolean(startingId)} className={`${saved ? btnGhost : btnPrimary} w-full`}>
                      {startingId === item.id ? <RotateCcw className="h-4 w-4 animate-spin" /> : saved ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {saved ? 'Continue solving' : 'Start solving'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
