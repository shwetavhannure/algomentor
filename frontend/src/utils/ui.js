// shared Tailwind class strings so pages stay short
export const inputCls =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 md:text-sm';

export const textareaCls =
  'w-full rounded-xl border border-slate-200 bg-white p-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 md:text-sm';

const btnBase =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60';

export const btnPrimary = `${btnBase} gradient-primary text-white hover:opacity-95`;
export const btnGhost = `${btnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800`;
export const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700`;

export const cardCls =
  'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900';