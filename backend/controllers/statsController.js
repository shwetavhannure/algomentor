import Problem, { TOPICS } from '../models/Problem.js';
import { SOLVED_STATUSES } from '../utils/status.js';
import { localDayKey, shiftDayKey, currentStreak } from '../utils/stats.js';

export async function getStats(req, res, next) {
  try {
    const userId = req.user._id;
    const problems = await Problem.find({ user: userId });

    // the browser sends its timezone offset so "today" matches the user's own day
    let tz = Number(req.query.tz);
    if (!Number.isFinite(tz) || Math.abs(tz) > 840) tz = 0;

    const solved = problems.filter((p) => SOLVED_STATUSES.includes(p.status));

    // days on which at least one problem was solved
    const perDay = new Map();
    solved.forEach((p) => {
      if (!p.solvedAt) return;
      const key = localDayKey(p.solvedAt, tz);
      perDay.set(key, (perDay.get(key) || 0) + 1);
    });
    const todayKey = localDayKey(new Date(), tz);

    // share of solved problems where the user needed hint 2 or less
    const independent = solved.filter((p) => (p.highestHintLevel || 0) <= 2).length;

    const totals = {
      problems: problems.length,
      solved: solved.length,
      streak: currentStreak(new Set(perDay.keys()), todayKey),
      independence: solved.length === 0 ? null : Math.round((independent / solved.length) * 100),
    };

    const perTopic = TOPICS.map((topic) => {
      const list = problems.filter((p) => p.topic === topic);
      const count = list.length;
      const solvedCount = list.filter((p) => SOLVED_STATUSES.includes(p.status)).length;
      const avgHint =
        count === 0
          ? 0
          : list.reduce((s, p) => s + (p.highestHintLevel || 0), 0) / count;
      return {
        topic,
        count,
        solvedCount,
        averageHighestHintLevel: Math.round(avgHint * 100) / 100,
      };
    }).filter((t) => t.count > 0);

    const weakTopics = [...perTopic]
      .map((t) => {
        const unsolvedRatio =
          t.count === 0 ? 0 : (t.count - t.solvedCount) / t.count;
        const score = t.averageHighestHintLevel + unsolvedRatio * 4;
        return { topic: t.topic, score: Math.round(score * 100) / 100 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const solvedPerDay = [];
    for (let i = 13; i >= 0; i--) {
      const date = shiftDayKey(todayKey, -i);
      solvedPerDay.push({ date, count: perDay.get(date) || 0 });
    }

    res.json({ totals, perTopic, weakTopics, solvedPerDay });
  } catch (e) {
    next(e);
  }
}
