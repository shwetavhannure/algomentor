import { Routes, Route, Navigate } from 'react-router-dom';
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
      <Route path="/workspace/:id?" element={workspacePage()} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}