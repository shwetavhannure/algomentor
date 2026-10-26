import { Gauge } from 'lucide-react';
import { cardCls } from '../utils/ui';

export default function ComplexityCard({ complexity, plain = false }) {
  const has = complexity && (complexity.time || complexity.space);

  return (
    <div className={plain ? '' : cardCls}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Gauge className="h-4 w-4 text-indigo-500" /> Complexity
      </h3>
      {has ? (
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Time</p>
              <p className="font-mono font-semibold">{complexity.time}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Space</p>
              <p className="font-mono font-semibold">{complexity.space}</p>
            </div>
          </div>
          {complexity.note && <p className="text-slate-600 dark:text-slate-300">{complexity.note}</p>}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No estimate yet. Write some code and tap Analyze complexity.
        </p>
      )}
      <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">AI estimates can be wrong. Verify yourself.</p>
    </div>
  );
}