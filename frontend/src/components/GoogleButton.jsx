import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, isGoogleConfigured } from '../utils/errors';

const btnCls =
  'flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function GoogleButton() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  if (!isGoogleConfigured()) {
    return (
      <button type="button" disabled className={`${btnCls} cursor-not-allowed opacity-60`}>
        <GoogleLogo /> Continue with Google
      </button>
    );
  }

  const onSuccess = async (response) => {
    try {
      await googleLogin(response.credential);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // the Google button needs a pixel width, keep it inside small screens
  const width = Math.min(340, window.innerWidth - 64);

  return (
    <div className="flex justify-center">
      <div className="group relative" style={{ width }}>
        {/* what the user sees: always the same plain button */}
        <div className={`${btnCls} group-hover:bg-slate-50 dark:group-hover:bg-slate-700`}>
          <GoogleLogo /> Continue with Google
        </div>

        {/* Google's real button, invisible, on top so the click works */}
        <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 [&_iframe]:!h-10">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => toast.error('Google sign-in failed.')}
            width={String(width)}
            text="continue_with"
          />
        </div>
      </div>
    </div>
  );
}