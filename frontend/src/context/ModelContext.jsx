import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { getErrorMessage } from '../utils/errors';

const ModelContext = createContext(null);
const STORAGE_KEY = 'algomentor_model';

export function ModelProvider({ children }) {
  const [models, setModels] = useState([]);
  const [details, setDetails] = useState([]);
  const [defaultModel, setDefaultModel] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await api.get('/models');
        if (cancelled) return;
        setModels(data.models || []);
        setDetails(data.details || []);
        setDefaultModel(data.defaultModel || '');
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (data.models || []).includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(data.defaultModel || data.models?.[0] || '');
        }
      } catch {
        if (!cancelled) {
          setModels([]);
          setDefaultModel('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pickModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem(STORAGE_KEY, model);
  };

  return (
    <ModelContext.Provider
      value={{
        models,
        details,
        defaultModel,
        selectedModel,
        setSelectedModel: pickModel,
        loading,
        getErrorMessage,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModels() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error('useModels must be used inside ModelProvider');
  return ctx;
}
