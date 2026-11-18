import { useState } from 'react';
import { LogOut, Trash2, Loader2, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../utils/errors';
import { DEFAULT_EDITOR_SETTINGS } from '../constants/topics';
import EditorSettingsForm from '../components/EditorSettingsForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ThemeToggle from '../components/ThemeToggle';
import { inputCls, btnGhost, cardCls } from '../utils/ui';

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:hover:bg-slate-800 dark:hover:text-white';

export default function Profile() {
  const { user, updateUserLocal, logout, loggingOut } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState(user.name);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const settings = { ...DEFAULT_EDITOR_SETTINGS, ...(user.editorSettings || {}) };

  const startEdit = () => {
    setName(user.name);
    setEditing(true);
  };

  const cancelEdit = () => {
    setName(user.name);
    setEditing(false);
  };

  const saveName = async (e) => {
    e?.preventDefault();
    const next = name.trim();
    if (!next) return toast.error('Name is required.');
    if (next === user.name) return setEditing(false);
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name: next });
      updateUserLocal({ name: data.user.name });
      setName(data.user.name);
      setEditing(false);
      toast.success('Name updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changeSettings = async (partial) => {
    updateUserLocal({ editorSettings: { ...settings, ...partial } });
    try {
      await api.put('/auth/settings', { editorSettings: partial });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const deleteAccount = async () => {
    setConfirmDelete(false);
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted');
      logout();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <header>
        <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Your account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Profile & preferences</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your personal details and coding workspace.</p>
      </header>

      <section className={`${cardCls} divide-y divide-slate-200 p-0 dark:divide-slate-800`}>
        <div className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold">Account details</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your name and sign-in information.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <form onSubmit={saveName}>
              <label htmlFor="profile-name" className="mb-2 block text-sm font-semibold">Name</label>
              <div className="relative">
                <input
                  id="profile-name"
                  className={`${inputCls} ${editing ? 'pr-24' : 'pr-12'} ${editing ? '' : 'bg-slate-50 dark:bg-slate-900/60'}`}
                  value={name}
                  readOnly={!editing}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                  autoFocus={editing}
                  maxLength={60}
                />
                <div className="absolute right-1 top-1 flex items-center gap-0.5">
                  {editing ? (
                    <>
                      <button type="submit" disabled={saving} className={`${iconBtn} text-teal-600 dark:text-teal-400`} aria-label="Save name">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                      </button>
                      <button type="button" disabled={saving} onClick={cancelEdit} className={iconBtn} aria-label="Cancel editing">
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={startEdit} className={iconBtn} aria-label="Edit name">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>

          <div>
            <label htmlFor="profile-email" className="mb-2 block text-sm font-semibold">Email</label>
            <input id="profile-email" className={`${inputCls} bg-slate-50 dark:bg-slate-900/60`} value={user.email} readOnly />
            <p className="mt-2 text-xs text-slate-500">
              {user.authProvider === 'google' ? 'Signed in with Google' : 'Signed in with email and password'}
            </p>
          </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold">Editor settings</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">Choose how code appears in your workspace.</p>
          <EditorSettingsForm settings={settings} onChange={changeSettings} wide />
        </div>

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The app is currently using the {theme} theme.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className={`${cardCls} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="text-sm font-semibold">Account actions</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign out on this device or permanently remove your account.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <button type="button" className={`${btnGhost} !h-10 w-full sm:w-auto`} onClick={logout} disabled={loggingOut}>
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70 sm:w-auto"
          >
            <Trash2 className="h-4 w-4" /> Delete account
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Delete your account?"
        message="All your problems, hints and settings will be permanently deleted. This cannot be undone."
        confirmLabel="Delete account"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
      />
    </div>
  );
}
