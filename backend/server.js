import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB, keepDbAlive, requireDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import modelsRoutes from './routes/modelsRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

function parseAllowedOrigins() {
  const raw = process.env.CLIENT_URL || '';
  const list = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (!list.includes('http://localhost:5173')) {
    list.push('http://localhost:5173');
  }
  return list;
}

const allowedOrigins = parseAllowedOrigins();

// Private LAN origins for phone testing (192.168.x.x, 10.x, 172.16-31)
function isPrivateNetworkOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    const m = host.match(/^172\.(\d{1,2})\.\d{1,3}\.\d{1,3}$/);
    if (m) {
      const second = Number(m[1]);
      if (second >= 16 && second <= 31) return true;
    }
    return false;
  } catch {
    return false;
  }
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isDev && isPrivateNetworkOrigin(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
// Express 5 leaves req.body undefined for requests without a JSON body
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1,
    jwt: Boolean(process.env.JWT_SECRET) && !process.env.JWT_SECRET.includes('change_this'),
    ai: Boolean(process.env.GROQ_API_KEY) && !process.env.GROQ_API_KEY.includes('your_groq'),
  });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Try again later.' },
});

app.use('/api/auth', authLimiter, requireDb, authRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/problems', requireDb, problemRoutes);
app.use('/api/stats', requireDb, statsRoutes);
app.use('/api/guest', guestRoutes);

app.use(notFound);
app.use(errorHandler);

const secret = process.env.JWT_SECRET || '';
if (!secret || secret.includes('change_this')) {
  console.warn('[config] JWT_SECRET is missing. Login and signup will fail until it is set in backend/.env.');
}

connectDB().finally(() => {
  keepDbAlive();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlgoMentor API listening on http://0.0.0.0:${PORT}`);
  });
});
