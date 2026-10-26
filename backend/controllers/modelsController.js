import { getModelInfo } from '../utils/ai.js';

export function listModels(req, res) {
  res.json(getModelInfo());
}
