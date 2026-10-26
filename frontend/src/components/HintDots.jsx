export default function HintDots({ level = 0 }) {
  return (
    <div className="flex gap-1" aria-label={`Hints used: ${level} of 4`}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`h-2 w-2 rounded-full ${
            n <= level ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}
