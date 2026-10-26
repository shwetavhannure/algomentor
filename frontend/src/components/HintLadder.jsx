import { Lock, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MarkdownView from './MarkdownView';
import { HINT_STEPS } from '../constants/topics';

export default function HintLadder({ hints, highest, loadingLevel }) {
  return (
    <ol className="space-y-3">
      {HINT_STEPS.map((step) => {
        const hint = hints.find((h) => h.level === step.level);
        const isNext = step.level === highest + 1;
        const loading = loadingLevel === step.level;

        if (hint) {
          return (
            <motion.li
              key={step.level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-slate-900"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="h-4 w-4" />
                  </span>
                  {step.level}. {step.title}
                </span>
                {hint.modelUsed && <span className="truncate text-[11px] text-slate-500">{hint.modelUsed}</span>}
              </div>
              <div className="max-h-96 overflow-auto">
                <MarkdownView content={hint.content} />
              </div>
            </motion.li>
          );
        }

        return (
          <li
            key={step.level}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${
              isNext
                ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950'
                : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50'
            }`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isNext ? 'gradient-primary text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isNext ? step.level : <Lock className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${isNext ? 'text-indigo-900 dark:text-indigo-100' : ''}`}>
                {step.level}. {step.title}
              </p>
              <p className="text-xs">{isNext ? `Next up: ${step.short}` : 'Locked'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}