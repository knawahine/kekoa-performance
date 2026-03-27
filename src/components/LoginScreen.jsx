import { useState } from 'react';
import { S } from '../lib/styles';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setSignupSuccess(true);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div style={{
      fontFamily: "'Barlow',system-ui,sans-serif",
      background: S.bg,
      color: S.tx,
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet" />

      {/* Logo/Brand */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
          color: S.bl,
          marginBottom: 4,
        }}>
          PERFORMANCE TRACKING
        </div>
        <div style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 42,
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1,
        }}>
          KEKOA
        </div>
        <div style={{ fontSize: 12, color: S.dm, marginTop: 8 }}>
          Train. Track. Transform.
        </div>
      </div>

      {/* Form Card */}
      <div style={{
        background: S.cd,
        border: `1px solid ${S.bd}`,
        borderRadius: 14,
        padding: 24,
        width: '100%',
        maxWidth: 360,
      }}>
        {signupSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: S.gr, marginBottom: 8 }}>
              Check your email
            </div>
            <div style={{ fontSize: 12, color: S.dm, lineHeight: 1.5 }}>
              We sent a confirmation link to <strong style={{ color: S.tx }}>{email}</strong>. Click it to activate your account, then sign in.
            </div>
            <button
              onClick={() => { setSignupSuccess(false); setMode('signin'); }}
              style={{
                marginTop: 16, width: '100%', background: S.bl, color: '#fff',
                border: 'none', borderRadius: 8, padding: '12px', fontSize: 13,
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              BACK TO SIGN IN
            </button>
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: "'Barlow Condensed'",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              color: S.bl,
              textTransform: 'uppercase',
              marginBottom: 16,
              textAlign: 'center',
            }}>
              {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.25)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 11,
                color: S.rd,
                marginBottom: 12,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: '100%', background: '#1a2744',
                  border: '1px solid rgba(56,145,255,0.15)',
                  borderRadius: 8, padding: '12px 14px',
                  color: S.tx, fontSize: 14, outline: 'none',
                  marginBottom: 8, boxSizing: 'border-box',
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                style={{
                  width: '100%', background: '#1a2744',
                  border: '1px solid rgba(56,145,255,0.15)',
                  borderRadius: 8, padding: '12px 14px',
                  color: S.tx, fontSize: 14, outline: 'none',
                  marginBottom: 12, boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', background: S.bl, color: '#fff',
                  border: 'none', borderRadius: 8, padding: '12px',
                  fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  letterSpacing: 1,
                }}
              >
                {loading ? '...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '16px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: S.bd }} />
              <span style={{ fontSize: 10, color: S.dm, fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: S.bd }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${S.bd}`,
                borderRadius: 8, padding: '11px',
                fontSize: 12, fontWeight: 600, color: S.tx,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Toggle mode */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                style={{
                  background: 'none', border: 'none', color: S.bl,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
