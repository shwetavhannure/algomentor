import { useModels } from '../context/ModelContext';

export default function ModelSelect({ className = '', fill = false }) {
  const { models, details, selectedModel, setSelectedModel, loading } = useModels();
  const providers = [...new Set(details.map((d) => d.label))];

  if (loading) {
    return (
      <div className={`h-11 min-w-[120px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} />
    );
  }

  if (!models.length) {
    return (
      <span className={`text-xs text-slate-500 dark:text-slate-400 ${className}`}>No models</span>
    );
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className={`h-11 ${fill ? 'w-full' : 'max-w-[180px]'} rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 ${className}`}
      aria-label="AI model"
    >
      {providers.length > 1
        ? providers.map((label) => (
            <optgroup key={label} label={label}>
              {details.filter((d) => d.label === label).map((d) => (
                <option key={d.id} value={d.id}>{d.id}</option>
              ))}
            </optgroup>
          ))
        : models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
    </select>
  );
}
