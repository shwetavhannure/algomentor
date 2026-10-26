import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/layout/Logo';
import ThemeToggle from '../components/ThemeToggle';
import GoogleButton from '../components/GoogleButton';
import { getErrorMessage } from '../utils/errors';
import { HINT_STEPS } from '../constants/topics';
import { inputCls, btnPrimary } from '../utils/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (mode === 'register' && !form.name.trim()) next.name = 'Name is required.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email.';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email.trim(), form.password);
      else await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* left: brand panel */}
      <aside className="hidden flex-col justify-between border-r border-slate-800 bg-slate-900 px-12 py-10 text-white lg:flex xl:px-16">
        <Logo light />

        <div className="max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Stop copying solutions. Learn to find them.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Get a hint only when you need one, and only as much as you need. You stay in charge of the thinking.
          </p>

          <ul className="mt-10 space-y-5">
            {HINT_STEPS.map((s) => (
              <li key={s.level} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/40">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span>
                  <span className="block font-semibold text-white">{s.title}</span>
                  <span className="block text-sm text-slate-400">{s.short}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-slate-500">AlgoMentor &copy; 2026</p>
      </aside>

      {/* right: form */}
      <main className="flex min-h-dvh flex-col bg-slate-50 px-4 py-5 sm:px-8 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div className="lg:invisible"><Logo /></div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
            <h1 className="text-center text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-300">
              {mode === 'login' ? 'Log in to continue practicing.' : 'It takes less than a minute.'}
            </p>

            <div className="mt-6">
              <GoogleButton />
            </div>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-600" />
              or
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === 'register' && (
                <div>
                  <input className={inputCls} placeholder="Name" value={form.name} onChange={setField('name')} autoComplete="name" />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
              )}
              <div>
                <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={setField('email')} autoComplete="email" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-12`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={setField('password')}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? (mode === 'login' ? 'Logging in...' : 'Creating account...') : mode === 'login' ? 'Log in' : 'Sign up'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button
                type="button"
                className="font-medium text-indigo-600 dark:text-indigo-400"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
              >
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
