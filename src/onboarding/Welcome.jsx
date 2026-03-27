import { S } from '../lib/styles';

export default function Welcome({ onNext }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      {/* Brand */}
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700,
        letterSpacing: 3, color: S.bl, marginBottom: 4,
      }}>
        PERFORMANCE TRACKING
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 48, fontWeight: 800,
        color: '#fff', lineHeight: 1,
      }}>
        KEKOA
      </div>
      <div style={{ fontSize: 13, color: S.dm, marginTop: 12, lineHeight: 1.6 }}>
        Train smarter. Eat better. Track everything.
      </div>

      {/* Emoji row */}
      <div style={{ fontSize: 28, margin: '32px 0', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <span>💪</span><span>🍽️</span><span>📊</span><span>🔥</span>
      </div>

      {/* Features */}
      <div style={{ textAlign: 'left', maxWidth: 280, margin: '0 auto 32px' }}>
        {[
          { icon: '🏋️', text: 'Log workouts with set/rep tracking' },
          { icon: '🥗', text: 'Track meals, macros & supplements' },
          { icon: '📈', text: 'Weekly check-ins & progress photos' },
          { icon: '☁️', text: 'Cloud sync across all devices' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>{f.icon}</span>
            <span style={{ fontSize: 12, color: '#c8c4bb' }}>{f.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        style={{
          width: '100%', maxWidth: 300, background: S.bl, color: '#fff',
          border: 'none', borderRadius: 10, padding: '14px', fontSize: 14,
          fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
          fontFamily: "'Barlow'",
        }}
      >
        GET STARTED
      </button>
    </div>
  );
}
