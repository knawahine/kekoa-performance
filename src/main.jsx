import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import App from './App.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import { S } from './lib/styles.js';
import './index.css';

function SplashScreen() {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed',system-ui,sans-serif",
      background: S.bg,
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2 }}>KEKOA</div>
      <div style={{ fontSize: 11, color: S.dm, marginTop: 6, letterSpacing: 2 }}>LOADING...</div>
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user) return <LoginScreen />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </StrictMode>,
);
