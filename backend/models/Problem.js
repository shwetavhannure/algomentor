import mongoose from 'mongoose';

const TOPICS = [
  'Arrays',
  'Strings',
  'Linked List',
  'Stack/Queue',
  'Trees',
  'Graphs',
  'DP',
  'Recursion/Backtracking',
  'Binary Search',
  'Greedy',
  'Other',
];

const complexitySchema = new mongoose.Schema(
  {
    time: String,
    space: String,
    note: String,
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  statement: { type: String, required: true },
  topic: { type: String, enum: TOPICS, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  language: { type: String, required: true },
  userCode: { type: String, default: '' },
  // attempting -> solved ('due' is only kept so older saved problems still load)
  status: { type: String, enum: ['attempting', 'solved', 'due'], default: 'attempting' },
  highestHintLevel: { type: Number, default: 0, min: 0, max: 4 },
  complexity: { type: complexitySchema, default: () => ({}) },
  reviewStep: { type: Number, default: 0, min: 0, max: 3 },
  nextReviewDate: { type: Date, index: true },
  mastered: { type: Boolean, default: false },
  solvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export { TOPICS };
export default mongoose.model('Problem', problemSchema);
