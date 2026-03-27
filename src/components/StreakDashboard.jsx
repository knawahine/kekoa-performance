import { S } from '../lib/styles';
import { getMilestoneBadge } from '../lib/streaks';
import Card from './shared/Card';
import Label from './shared/Label';

const CATEGORIES = [
  { key: 'overall', icon: '🔥', label: 'OVERALL', color: S.am },
  { key: 'meals', icon: '🍽️', label: 'MEALS', color: S.gr },
  { key: 'training', icon: '🏋️', label: 'TRAINING', color: S.bl },
  { key: 'supps', icon: '💊', label: 'SUPPS', color: '#c084fc' },
];

export default function StreakDashboard({ streaks, personalBests, streakFreezeUsed, onToggleFreeze, currentWeek }) {
  return (
    <Card glow>
      <Label>STREAKS</Label>

      {/* Streak badges row */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 8 }}>
        {CATEGORIES.map((cat) => {
          const count = streaks[cat.key] || 0;
          const badge = getMilestoneBadge(count);
          const pb = personalBests?.[cat.key] || 0;

          return (
            <div key={cat.key} style={{ textAlign: 'center', flex: 1 }}>
              {/* Badge circle */}
              <div style={{
                width: cat.key === 'overall' ? 52 : 42,
                height: cat.key === 'overall' ? 52 : 42,
                borderRadius: '50%',
                border: `3px solid ${badge ? badge.ring : 'rgba(255,255,255,0.08)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 4px',
                background: badge?.glow ? `rgba(${cat.key === 'overall' ? '245,166,35' : '56,145,255'},0.08)` : 'transparent',
                boxShadow: badge?.glow ? `0 0 12px ${badge.ring}30` : 'none',
                animation: badge?.pulse ? 'pulse 2s ease-in-out infinite' : 'none',
              }}>
                <span style={{ fontSize: cat.key === 'overall' ? 14 : 12 }}>{cat.icon}</span>
                <span style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: cat.key === 'overall' ? 16 : 13,
                  fontWeight: 900,
                  color: count > 0 ? cat.color : S.dm,
                  lineHeight: 1,
                }}>
                  {count}
                </span>
              </div>
              <div style={{ fontSize: 7, fontWeight: 700, color: S.dm, letterSpacing: 1 }}>{cat.label}</div>

              {/* Personal best indicator */}
              {pb > 0 && count >= pb && count > 0 && (
                <div style={{ fontSize: 7, color: S.am, fontWeight: 700, marginTop: 1 }}>BEST!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestone badge display */}
      {(() => {
        const overallBadge = getMilestoneBadge(streaks.overall || 0);
        if (!overallBadge) return null;
        return (
          <div style={{
            textAlign: 'center',
            padding: '6px 0 2px',
            borderTop: `1px solid ${S.bd}`,
            marginTop: 4,
          }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: overallBadge.ring,
              letterSpacing: 1,
            }}>
              {overallBadge.name.toUpperCase()}
            </span>
          </div>
        );
      })()}

      {/* Streak Freeze */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 8, padding: '6px 0',
        borderTop: `1px solid ${S.bd}`,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: S.dm }}>
            ❄️ Streak Freeze (1/week)
          </div>
          <div style={{ fontSize: 9, color: S.dr }}>
            Protects streak on sick/travel days
          </div>
        </div>
        <button
          onClick={onToggleFreeze}
          style={{
            background: streakFreezeUsed
              ? 'rgba(56,145,255,0.12)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${streakFreezeUsed ? 'rgba(56,145,255,0.3)' : S.bd}`,
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 10,
            fontWeight: 700,
            color: streakFreezeUsed ? S.bl : S.dm,
            cursor: 'pointer',
          }}
        >
          {streakFreezeUsed ? '❄️ ACTIVE' : 'USE'}
        </button>
      </div>

      {/* CSS animation for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </Card>
  );
}
