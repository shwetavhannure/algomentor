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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Card 1: account and preferences, full width like the other pages */}
      <section className={`${cardCls} divide-y divide-slate-200 p-0 dark:divide-slate-800`}>
        <div className="grid gap-5 p-5 md:grid-cols-2">
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

        <div className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Editor settings</h2>
          <EditorSettingsForm settings={settings} onChange={changeSettings} wide />
        </div>

        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-sm font-semibold">Theme</h2>
            <p className="text-xs text-slate-500">Currently {theme}</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Card 2: account actions */}
      <section className={`${cardCls} grid gap-3 sm:grid-cols-2`}>
        <button type="button" className={`${btnGhost} w-full`} onClick={logout} disabled={loggingOut}>
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
        >
          <Trash2 className="h-4 w-4" /> Delete account
        </button>
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
