import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Hint from '../models/Hint.js';
import { signToken, userResponse } from '../middleware/auth.js';
import { verifyGoogleCredential } from '../utils/google.js';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_THEMES = ['vs-dark', 'light'];
const ALLOWED_LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'go'];
const ALLOWED_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function validateRegister(body) {
  const { name, email, password } = body;
  if (!name?.trim()) return 'Name is required.';
  if (!email?.trim() || !EMAIL_RE.test(email)) return 'Valid email is required.';
  if (!password || password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export async function register(req, res, next) {
  try {
    const errMsg = validateRegister(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const email = req.body.email.trim().toLowerCase();
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name.trim(),
      email,
      passwordHash,
      authProvider: 'local',
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: userResponse(user) });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'This account uses Google sign-in. Please continue with Google.',
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = signToken(user._id);
    res.json({ token, user: userResponse(user) });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  res.json({ user: userResponse(req.user) });
}

export async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    const profile = await verifyGoogleCredential(credential);
    let user = await User.findOne({ googleId: profile.googleId });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.googleId = profile.googleId;
        if (!user.avatar && profile.picture) user.avatar = profile.picture;
        if (user.authProvider === 'local' && !user.passwordHash) {
          user.authProvider = 'google';
        }
        await user.save();
      } else {
        user = await User.create({
          name: profile.name,
          email: profile.email,
          googleId: profile.googleId,
          avatar: profile.picture,
          authProvider: 'google',
        });
      }
    }

    const token = signToken(user._id);
    res.json({ token, user: userResponse(user) });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    req.user.name = name;
    await req.user.save();
    res.json({ user: userResponse(req.user) });
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const { editorSettings } = req.body;
    if (!editorSettings || typeof editorSettings !== 'object') {
      return res.status(400).json({ error: 'editorSettings object is required.' });
    }

    const current = req.user.editorSettings?.toObject?.() || req.user.editorSettings || {};

    if (editorSettings.fontSize !== undefined) {
      const fs = Number(editorSettings.fontSize);
      if (fs < 10 || fs > 24) {
        return res.status(400).json({ error: 'fontSize must be between 10 and 24.' });
      }
      current.fontSize = fs;
    }
    if (editorSettings.tabSize !== undefined) {
      const ts = Number(editorSettings.tabSize);
      if (ts !== 2 && ts !== 4) {
        return res.status(400).json({ error: 'tabSize must be 2 or 4.' });
      }
      current.tabSize = ts;
    }
    if (editorSettings.editorTheme !== undefined) {
      if (!ALLOWED_THEMES.includes(editorSettings.editorTheme)) {
        return res.status(400).json({ error: 'editorTheme must be vs-dark or light.' });
      }
      current.editorTheme = editorSettings.editorTheme;
    }
    if (editorSettings.wordWrap !== undefined) {
      current.wordWrap = Boolean(editorSettings.wordWrap);
    }

    req.user.editorSettings = current;
    await req.user.save();
    res.json({ user: userResponse(req.user) });
  } catch (e) {
    next(e);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const { preferredLanguage, targetDifficulty } = req.body;

    if (preferredLanguage !== undefined) {
      if (!ALLOWED_LANGUAGES.includes(preferredLanguage)) {
        return res.status(400).json({ error: 'Choose a supported language.' });
      }
      req.user.preferredLanguage = preferredLanguage;
    }
    if (targetDifficulty !== undefined) {
      if (!ALLOWED_DIFFICULTIES.includes(targetDifficulty)) {
        return res.status(400).json({ error: 'Difficulty must be Easy, Medium or Hard.' });
      }
      req.user.targetDifficulty = targetDifficulty;
    }

    await req.user.save();
    res.json({ user: userResponse(req.user) });
  } catch (e) {
    next(e);
  }
}

export async function deleteAccount(req, res, next) {
  try {

    const problems = await Problem.find({ user: req.user._id }).select('_id');
    const ids = problems.map((p) => p._id);
    await Hint.deleteMany({ problem: { $in: ids } });
    await Problem.deleteMany({ user: req.user._id });
    await User.deleteOne({ _id: req.user._id });

    res.json({ message: 'Account deleted.' });
  } catch (e) {
    next(e);
  }
}
