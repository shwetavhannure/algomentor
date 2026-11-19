import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';
import { AppShell, WorkspaceShell } from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Try from './pages/Try';
import Workspace from './pages/Workspace';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';
import { lastWorkspaceStorageKey } from './utils/workspace';
import { PRACTICE_LIBRARY } from './data/practiceLibrary';
import api from './api/client';
import { getErrorMessage } from './utils/errors';

function WorkspaceEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const storageKey = lastWorkspaceStorageKey(user);
    const lastProblemId = localStorage.getItem(storageKey);
    if (lastProblemId) {
      navigate(`/workspace/${lastProblemId}`, { replace: true });
      return () => { cancelled = true; };
    }

    const starter = PRACTICE_LIBRARY.find((problem) => problem.topic === 'Arrays' && problem.difficulty === 'Easy') || PRACTICE_LIBRARY[0];
    const prepareWorkspace = async () => {
      try {
        const { data: listData } = await api.get('/problems', {
          params: { topic: starter.topic, difficulty: starter.difficulty },
        });
        let problem = listData.problems.find((item) => item.catalogId === starter.id);
        if (!problem) {
          const { data } = await api.post('/problems', {
            ...starter,
            catalogId: starter.id,
            language: user?.preferredLanguage || 'javascript',
            userCode: '',
          });
          problem = data.problem;
        }
        if (cancelled) return;
        localStorage.setItem(storageKey, problem._id);
        navigate(`/workspace/${problem._id}`, { replace: true });
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    };

    prepareWorkspace();
    return () => { cancelled = true; };
  }, [user, navigate]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-semibold">Workspace could not load</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <div className="mt-5 flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Try again</button>
          <Link to="/problems" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Choose a problem</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
      Opening your starter problem...
    </div>
  );
}

function page(element) {
  return (
    <ProtectedRoute>
      <AppShell>{element}</AppShell>
    </ProtectedRoute>
  );
}

function workspacePage() {
  return (
    <ProtectedRoute>
      <WorkspaceShell>
        <Workspace />
      </WorkspaceShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/try" element={<Try />} />
      <Route path="/dashboard" element={page(<Dashboard />)} />
      <Route path="/problems" element={page(<Problems />)} />
      <Route path="/revision" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profile" element={page(<Profile />)} />
      <Route path="/workspace" element={page(<WorkspaceEntry />)} />
      <Route path="/workspace/:id" element={workspacePage()} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
