import { OAuth2Client } from 'google-auth-library';

const DUMMY_CLIENT_ID = 'your_google_oauth_client_id_here';

export function isGoogleConfigured() {
  const id = process.env.GOOGLE_CLIENT_ID;
  return Boolean(id && id !== DUMMY_CLIENT_ID);
}

export async function verifyGoogleCredential(credential) {
  if (!isGoogleConfigured()) {
    const err = new Error('Google sign-in is not configured on the server.');
    err.statusCode = 503;
    throw err;
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  let payload;
  try {
    if (credential.startsWith('ya29.')) {
      // access token from the custom "Continue with Google" button
      const info = await client.getTokenInfo(credential);
      if (info.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error('wrong audience');
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!res.ok) throw new Error('userinfo failed');
      payload = await res.json();
    } else {
      // id token (kept so older logins still work)
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    }
  } catch {
    const err = new Error('Invalid Google sign-in token.');
    err.statusCode = 401;
    throw err;
  }

  if (!payload?.email_verified) {
    const err = new Error('Google account email is not verified.');
    err.statusCode = 401;
    throw err;
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture,
  };
}