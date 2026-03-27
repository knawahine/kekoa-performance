import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { supabase } from './lib/supabase.js';
import App from './App.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import OnboardingFlow from './onboarding/OnboardingFlow.jsx';
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
  const [checkingOnboard, setCheckingOnboard] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardState, setOnboardState] = useState(null);

  // Check if user has completed onboarding
  useEffect(() => {
    if (!user) {
      setNeedsOnboarding(false);
      return;
    }
    setCheckingOnboard(true);
    supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        // If no profile row or onboarded is false/null → needs onboarding
        setNeedsOnboarding(!data || !data.onboarded);
        setCheckingOnboard(false);
      })
      .catch(() => {
        // On error (e.g., table doesn't exist yet), skip onboarding
        setNeedsOnboarding(false);
        setCheckingOnboard(false);
      });
  }, [user]);

  if (loading || checkingOnboard) return <SplashScreen />;
  if (!user) return <LoginScreen />;

  if (needsOnboarding && !onboardState) {
    return (
      <OnboardingFlow
        onComplete={(initialState) => {
          setOnboardState(initialState);
          setNeedsOnboarding(false);
        }}
      />
    );
  }

  return <App initialOnboardState={onboardState} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </StrictMode>,
);
