import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { setUnauthorizedHandler } from '../api/client';
import { getErrorMessage } from '../utils/errors';

const AuthContext = createContext(null);
const TOKEN_KEY = 'algomentor_token';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const loggingOutRef = useRef(false);

  // short pause + toast so the transition does not feel abrupt
  const logout = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setLoggingOut(true);
    const t = toast.loading('Logging out...');
    await sleep(700);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    navigate('/auth');
    toast.success('Logged out', { id: t });
    loggingOutRef.current = false;
    setLoggingOut(false);
  }, [navigate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      navigate('/auth');
    });
  }, [navigate]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      // only an invalid token should wipe the session, not a temporary server problem
      if (err?.response?.status === 401) localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const persistSession = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    await sleep(700);
    persistSession(data.token, data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    toast.success('Account created! Setting things up...');
    await sleep(800);
    persistSession(data.token, data.user);
    return data.user;
  };

  const googleLogin = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    persistSession(data.token, data.user);
    return data.user;
  };

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  };

  const updateUserLocal = (partial) => {
    setUser((u) => (u ? { ...u, ...partial } : u));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        loggingOut,
        refreshUser,
        updateUserLocal,
        getErrorMessage,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
