import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function CodeEditor({ value, onChange, language, settings, minHeight = 280 }) {
  const { theme } = useTheme();
  const useMonaco = useMediaQuery('(min-width: 768px)');

  const tabSize = settings?.tabSize ?? 2;
  const fontSize = settings?.fontSize ?? 14;
  const wordWrap = settings?.wordWrap ?? true;
  const editorTheme = settings?.editorTheme === 'light' ? 'light' : 'vs-dark';
  const monacoTheme = theme === 'dark' ? editorTheme : editorTheme === 'vs-dark' ? 'vs-dark' : 'light';

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const spaces = ' '.repeat(tabSize);
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.slice(0, start) + spaces + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + spaces.length;
      });
    }
  };

  if (!useMonaco) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 font-mono text-base leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        style={{ minHeight }}
        aria-label="Code editor"
      />
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
      style={{ minHeight }}
    >
      <Editor
        height={minHeight}
        language={language === 'cpp' ? 'cpp' : language}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme={monacoTheme}
        options={{
          fontSize,
          tabSize,
          insertSpaces: true,
          wordWrap: wordWrap ? 'on' : 'off',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
