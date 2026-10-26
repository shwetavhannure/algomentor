import dns from 'node:dns';
import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

let connecting = null;

// older versions stored the review date as `nextReviewAt`
async function migrateLegacyFields() {
  try {
    await mongoose.connection
      .collection('problems')
      .updateMany({ nextReviewAt: { $exists: true } }, { $rename: { nextReviewAt: 'nextReviewDate' } });
  } catch (err) {
    console.warn('[db] legacy field migration skipped:', err.message);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}

async function tryConnect(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
}

export async function connectDB() {
  const uri = (process.env.MONGO_URI || '').trim();
  if (!uri || uri.includes('your_mongodb')) {
    console.warn('[db] MONGO_URI is not set. Edit backend/.env, then restart the server.');
    return false;
  }
  try {
    await tryConnect(uri);
  } catch (err) {
    // Some networks cannot resolve Atlas SRV records. Retry once with public DNS.
    if (uri.startsWith('mongodb+srv://') && /querySrv|ECONNREFUSED|ENOTFOUND|ETIMEOUT/i.test(err.message)) {
      console.warn('[db] SRV lookup failed, retrying with public DNS...');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      try {
        await tryConnect(uri);
      } catch (err2) {
        console.error('[db] MongoDB connection error:', err2.message);
        return false;
      }
    } else {
      console.error('[db] MongoDB connection error:', err.message);
      return false;
    }
  }
  console.log('[db] MongoDB connected');
  await migrateLegacyFields();
  return true;
}

// keep trying in the background so the app recovers without a restart
export function keepDbAlive() {
  setInterval(async () => {
    if (isDbReady() || connecting) return;
    connecting = connectDB().finally(() => { connecting = null; });
  }, 15000).unref();
}

// middleware: fail fast with a clear message instead of hanging
export async function requireDb(req, res, next) {
  // a reconnect usually takes a second or two: wait briefly instead of failing
  for (let i = 0; i < 20 && !isDbReady(); i++) await sleep(250);
  if (isDbReady()) return next();
  res.status(503).json({
    error: 'Database is not connected. Check MONGO_URI in backend/.env and restart the backend.',
  });
}
