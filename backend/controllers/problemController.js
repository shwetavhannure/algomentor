import Problem, { TOPICS } from '../models/Problem.js';
import Hint from '../models/Hint.js';
import { generateHint, analyzeComplexity } from '../utils/ai.js';
import { SOLVED_STATUSES } from '../utils/status.js';

function ownedProblem(userId, problemId) {
  return Problem.findOne({ _id: problemId, user: userId });
}

export async function createProblem(req, res, next) {
  try {
    const { title, statement, topic, difficulty, language, userCode } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!statement?.trim()) return res.status(400).json({ error: 'Statement is required.' });
    if (!TOPICS.includes(topic)) return res.status(400).json({ error: 'Invalid topic.' });
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty.' });
    }
    if (!language?.trim()) return res.status(400).json({ error: 'Language is required.' });

    const problem = await Problem.create({
      user: req.user._id,
      title: title.trim(),
      statement,
      topic,
      difficulty,
      language: language.trim(),
      userCode: userCode || '',
    });
    res.status(201).json({ problem });
  } catch (e) {
    next(e);
  }
}

export async function listProblems(req, res, next) {
  try {
    const filter = { user: req.user._id };
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.status === 'solved') filter.status = { $in: SOLVED_STATUSES };
    else if (req.query.status === 'attempting') filter.status = 'attempting';
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.search) {
      filter.title = {
        $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    }

    const problems = await Problem.find(filter).sort({ createdAt: -1 });
    res.json({ problems });
  } catch (e) {
    next(e);
  }
}

export async function getProblem(req, res, next) {
  try {
    const problem = await ownedProblem(req.user._id, req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });

    const hints = await Hint.find({ problem: problem._id }).sort({ level: 1 });
    res.json({ problem, hints });
  } catch (e) {
    next(e);
  }
}

export async function updateProblem(req, res, next) {
  try {
    const problem = await ownedProblem(req.user._id, req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });

    const allowed = [
      'title',
      'statement',
      'topic',
      'difficulty',
      'language',
      'userCode',
    ]; // status changes only through /solve and /review
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'topic' && !TOPICS.includes(req.body.topic)) {
          return res.status(400).json({ error: 'Invalid topic.' });
        }
        if (key === 'difficulty' && !['Easy', 'Medium', 'Hard'].includes(req.body.difficulty)) {
          return res.status(400).json({ error: 'Invalid difficulty.' });
        }
        problem[key] = req.body[key];
      }
    }
    await problem.save();
    res.json({ problem });
  } catch (e) {
    next(e);
  }
}

export async function deleteProblem(req, res, next) {
  try {
    const problem = await ownedProblem(req.user._id, req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });

    await Hint.deleteMany({ problem: problem._id });
    await problem.deleteOne();
    res.json({ message: 'Problem deleted.' });
  } catch (e) {
    next(e);
  }
}

export async function requestHint(req, res, next) {
  try {
    const level = Number(req.body.level);
    const { confirm, model } = req.body;

    if (!Number.isInteger(level) || level < 1 || level > 4) {
      return res.status(400).json({ error: 'Level must be between 1 and 4.' });
    }

    const problem = await ownedProblem(req.user._id, req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });

    const existing = await Hint.findOne({ problem: problem._id, level });
    if (existing) {
      return res.json({ hint: existing, problem });
    }

    if (level !== problem.highestHintLevel + 1) {
      const need = problem.highestHintLevel + 1;
      return res.status(400).json({
        error: `You must unlock hint level ${need} before level ${level}.`,
      });
    }

    if (level === 4 && confirm !== true) {
      return res.status(400).json({
        error: 'Level 4 (full solution) requires confirm: true.',
      });
    }

    const { text, modelUsed } = await generateHint(
      problem.statement,
      problem.userCode,
      problem.language,
      level,
      model
    );

    const hint = await Hint.create({
      problem: problem._id,
      level,
      content: text,
      modelUsed,
    });

    problem.highestHintLevel = level;
    await problem.save();

    res.status(201).json({ hint, problem });
  } catch (e) {
    next(e);
  }
}

export async function analyzeProblem(req, res, next) {
  try {
    const problem = await ownedProblem(req.user._id, req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });

    const { complexity, modelUsed } = await analyzeComplexity(
      problem.userCode,
      problem.language,
      req.body.model
    );

    problem.complexity = complexity;
    await problem.save();

    res.json({ problem, modelUsed });
  } catch (e) {
    next(e);
  }
}

export async function markSolved(req, res, next) {
  try {
    const problem = await ownedProblem(req.user._id, req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });

    // already solved: keep the original solve date so the streak is not changed
    if (SOLVED_STATUSES.includes(problem.status)) {
      return res.json({ problem, alreadySolved: true });
    }

    problem.status = 'solved';
    problem.solvedAt = new Date();
    await problem.save();

    res.json({ problem, alreadySolved: false });
  } catch (e) {
    next(e);
  }
}

// Clear the code and every hint so the problem can be practiced again from scratch.
// The solved status is left untouched.
export async function resetProblem(req, res, next) {
  try {
    const problem = await ownedProblem(req.user._id, req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });

    await Hint.deleteMany({ problem: problem._id });
    problem.userCode = '';
    problem.highestHintLevel = 0;
    problem.complexity = {};
    await problem.save();

    res.json({ problem });
  } catch (e) {
    next(e);
  }
}
