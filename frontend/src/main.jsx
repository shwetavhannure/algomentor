import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ModelProvider } from './context/ModelContext';

// a placeholder id keeps the provider from crashing when no real id is set
const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'not-configured';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GoogleOAuthProvider clientId={googleId}>
          <AuthProvider>
            <ModelProvider>
              <App />
              <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            </ModelProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);