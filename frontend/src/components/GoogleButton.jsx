import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, isGoogleConfigured } from '../utils/errors';

export default function GoogleButton() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  if (!isGoogleConfigured()) {
    return (
      <button
        type="button"
        disabled
        className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800"
      >
        Continue with Google
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
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => toast.error('Google sign-in failed.')}
        width={String(width)}
        text="continue_with"
      />
    </div>
  );
}