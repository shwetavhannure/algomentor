import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Group, Panel, Separator } from 'react-resizable-panels';
import {
  Save, RotateCcw, Settings, ChevronDown, Lightbulb, Gauge, CheckCircle2, Trash2, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useModels } from '../context/ModelContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getErrorMessage } from '../utils/errors';
import { isSolvedStatus } from '../utils/format';
import { TOPICS, DIFFICULTIES, LANGUAGES, HINT_STEPS, DEFAULT_EDITOR_SETTINGS } from '../constants/topics';
import CodeEditor from '../components/CodeEditor';
import HintLadder from '../components/HintLadder';
import ComplexityCard from '../components/ComplexityCard';
import ConfirmDialog from '../components/ConfirmDialog';
import ModelSelect from '../components/ModelSelect';
import EditorSettingsForm from '../components/EditorSettingsForm';
import { Skeleton } from '../components/Skeleton';
import { inputCls, textareaCls, btnPrimary, btnGhost, cardCls } from '../utils/ui';

// new problems start with the language and difficulty saved on the profile page
const blankForm = (user) => ({
  title: '',
  statement: '',
  topic: 'Arrays',
  difficulty: user?.targetDifficulty || 'Easy',
  language: user?.preferredLanguage || 'javascript',
  userCode: '',
});

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();
  const { selectedModel } = useModels();

  const isLaptop = useMediaQuery('(min-width: 1024px)');
  const isPhone = !useMediaQuery('(min-width: 768px)');

  const justCreated = useRef(null); // id of a problem we just created here
  const [form, setForm] = useState(() => blankForm(user));
  const [meta, setMeta] = useState(null); // saved problem from the server
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(''); // saving | hint | analyze | solve
  const [tab, setTab] = useState('problem');
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmFull, setConfirmFull] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const settings = { ...DEFAULT_EDITOR_SETTINGS, ...(user?.editorSettings || {}) };
  const highest = meta?.highestHintLevel || 0;
  const nextLevel = highest + 1;

  // load an existing problem
  useEffect(() => {
    if (!id) {
      setForm(blankForm(user));
      setMeta(null);
      setHints([]);
      setDirty(false);
      setLoading(false);
      return;
    }
    // just created from this page, data is already here
    if (justCreated.current === id) {
      justCreated.current = null;
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError('');
    api
      .get(`/problems/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const p = data.problem;
        setForm({ title: p.title, statement: p.statement, topic: p.topic, difficulty: p.difficulty, language: p.language, userCode: p.userCode || '' });
        setMeta(p);
        setHints(data.hints);
        setDirty(false);
      })
      .catch((err) => !cancelled && setLoadError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  // warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  // creates or updates, returns the problem id (or null on failure)
  const save = useCallback(async () => {
    if (!form.title.trim() || !form.statement.trim()) {
      toast.error('Add a title and the problem statement first.');
      return null;
    }
    try {
      if (!id) {
        const { data } = await api.post('/problems', form);
        setMeta(data.problem);
        setDirty(false);
        justCreated.current = data.problem._id;
        navigate(`/workspace/${data.problem._id}`, { replace: true });
        return data.problem._id;
      }
      const { data } = await api.put(`/problems/${id}`, form);
      setMeta(data.problem);
      setDirty(false);
      return id;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return null;
    }
  }, [form, id, navigate]);

  const handleSave = async () => {
    setBusy('saving');
    const savedId = await save();
    if (savedId) toast.success('Saved');
    setBusy('');
  };

  // Ctrl/Cmd + S on laptops
  const saveRef = useRef(handleSave);
  saveRef.current = handleSave;
  useEffect(() => {
    if (!isLaptop) return;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLaptop]);

  const runHint = async (level, confirm) => {
    setBusy('hint');
    const pid = await save();
    if (pid) {
      try {
        const { data } = await api.post(`/problems/${pid}/hint`, { level, confirm, model: selectedModel });
        setHints((list) => [...list.filter((h) => h.level !== level), data.hint].sort((a, b) => a.level - b.level));
        setMeta(data.problem);
        if (isPhone) setTab('mentor');
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
    setBusy('');
  };

  const handleNextHint = () => {
    if (nextLevel > 4) return;
    if (nextLevel === 4) setConfirmFull(true);
    else runHint(nextLevel, false);
  };

  const handleAnalyze = async () => {
    setBusy('analyze');
    const pid = await save();
    if (pid) {
      try {
        const { data } = await api.post(`/problems/${pid}/analyze`, { model: selectedModel });
        setMeta(data.problem);
        if (isPhone) setTab('mentor');
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
    setBusy('');
  };

  const handleSolve = async () => {
    setBusy('solve');
    const pid = await save();
    if (pid) {
      try {
        const { data } = await api.post(`/problems/${pid}/solve`);
        setMeta(data.problem);
        toast.success(data.alreadySolved ? 'Already marked as solved.' : 'Marked as solved. Nice work!');
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
    setBusy('');
  };

  // clears the code and re-locks all four hint levels
  const handleReset = async () => {
    setConfirmReset(false);
    setBusy('reset');
    try {
      if (id) {
        const { data } = await api.post(`/problems/${id}/reset`);
        setMeta(data.problem);
      }
      setHints([]);
      setForm((f) => ({ ...f, userCode: '' }));
      if (isPhone) setTab('code');
      toast.success('Code cleared and hints reset. Start fresh!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setBusy('');
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (!id) {
      navigate('/problems');
      return;
    }
    try {
      await api.delete(`/problems/${id}`);
      setDirty(false);
      toast.success('Problem deleted');
      navigate('/problems');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const changeSettings = async (partial) => {
    const next = { ...settings, ...partial };
    updateUserLocal({ editorSettings: next });
    try {
      await api.put('/auth/settings', { editorSettings: partial });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-red-600">{loadError}</p>
        <button className={`${btnPrimary} mt-4`} onClick={() => navigate('/problems')}>Back to problems</button>
      </div>
    );
  }

  // ---------- pieces of the screen ----------
  // Every row below is full width inside the same max-w-7xl / px-4 container,
  // so title bar, dropdowns, panels and action bar share the same left and right edges.
  const topBar = (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            className={`${inputCls} min-w-0 flex-1 font-semibold`}
            placeholder="Problem title"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
          />
          <button type="button" onClick={handleSave} disabled={busy === 'saving'} className={`${btnPrimary} relative`}>
            {busy === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="hidden sm:inline">Save</span>
            {dirty && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-500 dark:border-slate-950" title="Unsaved changes" />}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={`${btnGhost} w-11 px-0 text-red-600 dark:text-red-400`}
            aria-label="Delete problem"
            title="Delete problem"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <div className="relative">
            <button type="button" onClick={() => setShowSettings(!showSettings)} className={`${btnGhost} w-11 px-0`} aria-label="Editor settings">
              <Settings className="h-5 w-5" />
            </button>
            {showSettings && (
              <>
                <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close settings" onClick={() => setShowSettings(false)} />
                <div className="absolute right-0 top-12 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900">
                  <h3 className="mb-3 text-sm font-semibold">Editor settings</h3>
                  <EditorSettingsForm settings={settings} onChange={changeSettings} />
                </div>
              </>
            )}
          </div>
          <button type="button" onClick={() => setShowDetails(!showDetails)} className={`${btnGhost} md:hidden`}>
            Details <ChevronDown className={`h-4 w-4 transition ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* four equal columns on md+, so the row spans exactly the same width as the title bar */}
        <div className={`${showDetails ? 'grid' : 'hidden'} grid-cols-1 gap-3 sm:grid-cols-2 md:grid md:grid-cols-4`}>
          <select className={inputCls} value={form.topic} onChange={(e) => setField('topic', e.target.value)} aria-label="Topic">
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={inputCls} value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)} aria-label="Difficulty">
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className={inputCls} value={form.language} onChange={(e) => setField('language', e.target.value)} aria-label="Language">
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <ModelSelect fill />
        </div>
      </div>
    </div>
  );

  const statementBox = (
    <div className={cardCls}>
      <label className="mb-2 block text-sm font-medium">Problem statement</label>
      <textarea
        className={textareaCls}
        rows={isLaptop ? 6 : 8}
        value={form.statement}
        onChange={(e) => setField('statement', e.target.value)}
        placeholder="Paste the problem statement yourself"
      />
    </div>
  );

  const editorBox = (
    <div className={cardCls}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-sm font-medium">Your code</label>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          disabled={Boolean(busy)}
          title="Clear your code and lock all hints again"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {busy === 'reset' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Reset code &amp; hints
        </button>
      </div>
      <CodeEditor value={form.userCode} onChange={(v) => setField('userCode', v)} language={form.language} settings={settings} minHeight={isPhone ? 360 : 380} />
    </div>
  );

  const hintLabel = nextLevel > 4 ? 'All hints used' : HINT_STEPS[nextLevel - 1].title;
  // exactly three actions, shown at the top of the right-hand Mentor panel
  const actions = (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <button type="button" className={`${btnPrimary} w-full min-w-0 px-3`} onClick={handleNextHint} disabled={Boolean(busy) || nextLevel > 4}>
        {busy === 'hint' ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Lightbulb className="h-4 w-4 shrink-0" />}
        <span className="truncate">{nextLevel > 4 ? 'All hints used' : `Hint ${nextLevel}: ${hintLabel}`}</span>
      </button>
      <button type="button" className={`${btnGhost} w-full min-w-0 px-3`} onClick={handleAnalyze} disabled={Boolean(busy)}>
        {busy === 'analyze' ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Gauge className="h-4 w-4 shrink-0" />}
        <span className="truncate">Analyze complexity</span>
      </button>
      <button type="button" className={`${btnGhost} w-full min-w-0 px-3`} onClick={handleSolve} disabled={Boolean(busy)}>
        {busy === 'solve' ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
        <span className="truncate">{isSolvedStatus(meta?.status) ? 'Solved' : 'Mark as solved'}</span>
      </button>
    </div>
  );

  // same card + label style as the left column so the two sides line up
  const mentorBox = (
    <div className={cardCls}>
      <h2 className="mb-2 block text-sm font-medium">Mentor</h2>
      <div className="space-y-4">
        {actions}
        <HintLadder hints={hints} highest={highest} loadingLevel={busy === 'hint' ? nextLevel : 0} />
        <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
          <ComplexityCard complexity={meta?.complexity} plain />
        </div>
      </div>
    </div>
  );

  // ---------- layouts ----------
  const dialogs = (
    <>
      <ConfirmDialog
        open={confirmFull}
        title="Reveal full solution?"
        message="This reveals the full solution. Are you sure?"
        confirmLabel="Show solution"
        onCancel={() => setConfirmFull(false)}
        onConfirm={() => { setConfirmFull(false); runHint(4, true); }}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Reset code and hints?"
        message="Your code will be cleared and all four hint levels will be locked again, so you can practice from scratch."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
      />
      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Delete this problem?"
        message="The problem and all its hints will be deleted. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );

  if (isLaptop) {
    return (
      <div className="flex h-full flex-col">
        {topBar}
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0 mx-auto max-w-7xl px-4 py-4">
            <Group orientation="horizontal">
              <Panel defaultSize="46%" minSize="30%">
                <div className="h-full space-y-4 overflow-y-auto pr-4">{statementBox}{editorBox}</div>
              </Panel>
              {/* thin divider line; the ::before widens the grab area for dragging */}
              <Separator className="relative w-px bg-slate-200 transition-colors before:absolute before:inset-y-0 before:-left-2 before:-right-2 before:content-[''] hover:bg-indigo-400 data-[separator=active]:bg-indigo-500 dark:bg-slate-700" />
              <Panel defaultSize="54%" minSize="28%">
                <div className="h-full overflow-y-auto pl-4">{mentorBox}</div>
              </Panel>
            </Group>
          </div>
        </div>
        {dialogs}
      </div>
    );
  }

  // phones and tablets
  let body;
  if (!isPhone) {
    body = <div className="mx-auto max-w-3xl space-y-4 px-4 pt-4">{statementBox}{editorBox}{mentorBox}</div>;
  } else {
    body = (
      <div className="px-4 pt-3">
        <div className="mb-3 grid grid-cols-3 rounded-xl bg-slate-200 p-1 text-sm font-medium dark:bg-slate-800">
          {[['problem', 'Problem'], ['code', 'Code'], ['mentor', 'Mentor']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`h-10 rounded-lg ${tab === key ? 'bg-white shadow dark:bg-slate-950' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'problem' && statementBox}
        {tab === 'code' && editorBox}
        {tab === 'mentor' && mentorBox}
      </div>
    );
  }

  return (
    <div>
      {topBar}
      {body}
      {dialogs}
    </div>
  );
}
