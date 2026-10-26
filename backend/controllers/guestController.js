import { generateHint, analyzeComplexity } from '../utils/ai.js';

export async function guestHint(req, res, next) {
  try {
    const { statement, code, language, level, model } = req.body;
    const lvl = Number(level);

    if (!statement?.trim()) return res.status(400).json({ error: 'statement is required.' });
    if (!language?.trim()) return res.status(400).json({ error: 'language is required.' });
    if (!Number.isInteger(lvl) || (lvl !== 1 && lvl !== 2)) {
      return res.status(400).json({ error: 'Guest hints are only available for levels 1 and 2.' });
    }

    const { text, modelUsed } = await generateHint(
      statement,
      code || '',
      language,
      lvl,
      model
    );

    res.json({ hint: { level: lvl, content: text, modelUsed } });
  } catch (e) {
    next(e);
  }
}

export async function guestAnalyze(req, res, next) {
  try {
    const { code, language, model } = req.body;
    if (!language?.trim()) return res.status(400).json({ error: 'language is required.' });
    if (!code?.trim()) return res.status(400).json({ error: 'code is required.' });

    const { complexity, modelUsed } = await analyzeComplexity(code, language, model);
    res.json({ complexity, modelUsed });
  } catch (e) {
    next(e);
  }
}
