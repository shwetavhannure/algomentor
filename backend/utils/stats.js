// Helpers for the dashboard numbers. A "day" is the user's own calendar day,
// which we get from the browser's timezone offset (minutes, as in Date.getTimezoneOffset()).

export function localDayKey(date, tzMinutes = 0) {
  return new Date(new Date(date).getTime() - tzMinutes * 60000).toISOString().slice(0, 10);
}

export function shiftDayKey(key, days) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Days in a row with at least one solved problem.
// If nothing was solved yet today the streak is still alive until the day ends.
export function currentStreak(solvedDays, todayKey) {
  let cursor = solvedDays.has(todayKey) ? todayKey : shiftDayKey(todayKey, -1);
  let streak = 0;
  while (solvedDays.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}
