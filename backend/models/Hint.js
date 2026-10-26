import mongoose from 'mongoose';

const hintSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
  level: { type: Number, required: true, min: 1, max: 4 },
  content: { type: String, required: true },
  modelUsed: { type: String },
  createdAt: { type: Date, default: Date.now },
});

hintSchema.index({ problem: 1, level: 1 }, { unique: true });

export default mongoose.model('Hint', hintSchema);
