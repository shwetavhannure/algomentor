import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.includes('change_this')) {
      return res.status(503).json({ error: 'Server auth is not configured.' });
    }
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.includes('change_this')) {
    const err = new Error('JWT_SECRET is not set in backend/.env.');
    err.statusCode = 503;
    throw err;
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function userResponse(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}
