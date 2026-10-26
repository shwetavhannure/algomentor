import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

// bottom sheet on phones, centred dialog on bigger screens
export default function Sheet({ open, title, onClose, children }) {
  const isPhone = !useMediaQuery('(min-width: 768px)');

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
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            initial={isPhone ? { y: '100%' } : { opacity: 0, scale: 0.96 }}
            animate={isPhone ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={isPhone ? { y: '100%' } : { opacity: 0, scale: 0.96 }}
            className="relative z-10 max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl safe-bottom dark:border-slate-700 dark:bg-slate-900 md:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}