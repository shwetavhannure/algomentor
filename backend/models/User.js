import mongoose from 'mongoose';

const editorSettingsSchema = new mongoose.Schema(
  {
    fontSize: { type: Number, default: 14 },
    editorTheme: { type: String, default: 'vs-dark' },
    tabSize: { type: Number, default: 2 },
    wordWrap: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  googleId: { type: String, sparse: true },
  avatar: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  editorSettings: { type: editorSettingsSchema, default: () => ({}) },
  // defaults for a new problem in the workspace
  preferredLanguage: { type: String, enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go'], default: 'javascript' },
  targetDifficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
