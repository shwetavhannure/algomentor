export function getErrorMessage(err) {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.code === 'ERR_NETWORK' || (err?.request && !err?.response)) {
    return 'Cannot reach the server. Start the backend (npm run dev in the backend folder) and try again.';
  }
  if (err?.code === 'ECONNABORTED') return 'The server took too long to respond. Try again.';
  return err?.message || 'Something went wrong.';
}

export function isGoogleConfigured() {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return Boolean(id && id !== 'your_google_oauth_client_id_here');
}
