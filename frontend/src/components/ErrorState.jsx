import { AlertTriangle, RefreshCw } from 'lucide-react';
import { btnGhost, cardCls } from '../utils/ui';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className={`${cardCls} mx-auto max-w-lg py-8 text-center`} role="alert">
      <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
      <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btnGhost} mt-4`}>
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}
