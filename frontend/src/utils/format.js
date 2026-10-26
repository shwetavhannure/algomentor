export function difficultyClass(difficulty) {
  if (difficulty === 'Easy') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  if (difficulty === 'Medium') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
}

export function isSolvedStatus(status) {
  return status === 'solved' || status === 'due';
}
