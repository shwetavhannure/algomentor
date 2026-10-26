import { useMediaQuery } from '../hooks/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) {
  const isMobile = !useMediaQuery('(min-width: 768px)');

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            aria-label="Close dialog"
            onClick={onCancel}
          />
          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96 }}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl safe-bottom dark:border-slate-700 dark:bg-slate-900 md:rounded-2xl"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium dark:border-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`h-11 rounded-xl px-4 text-sm font-medium text-white ${
                  danger ? 'bg-red-600 hover:bg-red-700' : 'gradient-primary hover:opacity-95'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
