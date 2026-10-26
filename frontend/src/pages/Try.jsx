import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Compass, Gauge, Loader2, Info } from 'lucide-react';
import api from '../api/client';
import { AppShell } from '../components/layout/AppLayout';
import CodeEditor from '../components/CodeEditor';
import MarkdownView from '../components/MarkdownView';
import ModelSelect from '../components/ModelSelect';
import { useModels } from '../context/ModelContext';
import { getErrorMessage } from '../utils/errors';
import { LANGUAGES, DEFAULT_EDITOR_SETTINGS } from '../constants/topics';
import { inputCls, textareaCls, btnPrimary, btnGhost, cardCls } from '../utils/ui';

export default function Try() {
  const { selectedModel } = useModels();
  const [statement, setStatement] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null); // { title, body }
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const askHint = async (level, title) => {
    if (!statement.trim()) {
      setError('Please paste the problem statement first.');
      return;
    }
    setBusy(title);
    setError('');
    try {
      const { data } = await api.post('/guest/hint', { statement, code, language, level, model: selectedModel });
      setOutput({ title, body: data.hint.content, model: data.hint.modelUsed });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  };

  const analyze = async () => {
    if (!code.trim()) {
      setError('Write some code first so it can be analyzed.');
      return;
    }
    setBusy('Analyze');
    setError('');
    try {
      const { data } = await api.post('/guest/analyze', { code, language, model: selectedModel });
      const c = data.complexity;
      setOutput({
        title: 'Complexity',
        body: `**Time:** ${c.time}\n\n**Space:** ${c.space}\n\n${c.note || ''}\n\n*AI estimates can be wrong. Verify yourself.*`,
        model: data.modelUsed,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  };

  return (
    <AppShell publicNav>
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-100">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-center">
            Log in to unlock pseudocode and the full solution, and to save your progress.{' '}
            <Link to="/auth" className="font-semibold underline">Log in</Link>
          </p>
        </div>

        <div className={cardCls}>
          <label className="mb-2 block text-sm font-medium">Problem statement</label>
          <textarea
            className={textareaCls}
            rows={5}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Paste the problem statement yourself"
          />
        </div>

        <div className={cardCls}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">Your code</span>
            <div className="flex gap-2">
              <select className={`${inputCls} w-auto`} value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language">
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <ModelSelect />
            </div>
          </div>
          <CodeEditor value={code} onChange={setCode} language={language} settings={DEFAULT_EDITOR_SETTINGS} minHeight={300} />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button className={btnPrimary} disabled={Boolean(busy)} onClick={() => askHint(1, 'Nudge')}>
              {busy === 'Nudge' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />} Nudge
            </button>
            <button className={btnPrimary} disabled={Boolean(busy)} onClick={() => askHint(2, 'Approach')}>
              {busy === 'Approach' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />} Approach
            </button>
            <button className={btnGhost} disabled={Boolean(busy)} onClick={analyze}>
              {busy === 'Analyze' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />} Analyze complexity
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {error}
          </div>
        )}

        <div className={cardCls}>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Output</h2>
          {output ? (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{output.title}</span>
                {output.model && <span>Model: {output.model}</span>}
              </div>
              <MarkdownView content={output.body} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Hints and analysis will show up here.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}