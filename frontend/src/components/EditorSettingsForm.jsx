import { inputCls } from '../utils/ui';

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24];

// onChange gets only the changed field, e.g. { fontSize: 16 }
export default function EditorSettingsForm({ settings, onChange, disabled, wide = false }) {
  return (
    <div className={wide ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4' : 'space-y-3'}>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Font size</span>
        <select
          className={inputCls}
          disabled={disabled}
          value={settings.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Editor theme</span>
        <select
          className={inputCls}
          disabled={disabled}
          value={settings.editorTheme}
          onChange={(e) => onChange({ editorTheme: e.target.value })}
        >
          <option value="vs-dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Tab size</span>
        <select
          className={inputCls}
          disabled={disabled}
          value={settings.tabSize}
          onChange={(e) => onChange({ tabSize: Number(e.target.value) })}
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
      </label>
      <label className={`flex min-h-11 items-center gap-3 text-sm ${wide ? 'lg:self-end' : ''}`}>
        <input
          type="checkbox"
          className="h-5 w-5 accent-indigo-600"
          disabled={disabled}
          checked={settings.wordWrap}
          onChange={(e) => onChange({ wordWrap: e.target.checked })}
        />
        <span className="font-medium">Word wrap</span>
      </label>
    </div>
  );
}