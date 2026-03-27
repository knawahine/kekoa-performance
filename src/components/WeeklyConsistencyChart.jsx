import { S } from '../lib/styles';
import { consistencyColor } from '../lib/streaks';
import Card from './shared/Card';
import Label from './shared/Label';

const CATS = [
  { key: 'overall', label: 'Overall', icon: '🔥' },
  { key: 'meals', label: 'Meals', icon: '🍽️' },
  { key: 'training', label: 'Training', icon: '🏋️' },
  { key: 'supps', label: 'Supps', icon: '💊' },
];

export default function WeeklyConsistencyChart({ weeklyData, personalBests }) {
  if (!weeklyData || weeklyData.length === 0) return null;

  return (
    <Card>
      <Label>WEEKLY CONSISTENCY</Label>

      {/* Category rows */}
      {CATS.map((cat) => (
        <div key={cat.key} style={{ marginBottom: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: S.dm }}>
              {cat.icon} {cat.label.toUpperCase()}
            </span>
            {personalBests?.[cat.key] > 0 && (
              <span style={{ fontSize: 8, color: S.am, fontWeight: 600 }}>
                Best streak: {personalBests[cat.key]}d
              </span>
            )}
          </div>

          {/* Bar chart row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
            {weeklyData.map((week, i) => {
              const pct = week[cat.key] || 0;
              const color = consistencyColor(pct);
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {/* Percentage label */}
                  <div style={{ fontSize: 7, fontWeight: 700, color: pct > 0 ? color : S.dr }}>
                    {pct > 0 ? `${pct}%` : ''}
                  </div>
                  {/* Bar */}
                  <div style={{
                    width: '100%',
                    height: `${Math.max(2, pct * 0.35)}px`,
                    background: pct > 0 ? color : '#1a2744',
                    borderRadius: '2px 2px 0 0',
                    minHeight: 2,
                    transition: 'height 0.3s',
                  }} />
                  {/* Week label */}
                  <div style={{ fontSize: 7, color: S.dr, marginTop: 1 }}>
                    {week.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 10,
        marginTop: 6, paddingTop: 6,
        borderTop: `1px solid ${S.bd}`,
      }}>
        {[
          { label: '90%+', color: '#00d4aa' },
          { label: '75%+', color: '#3891ff' },
          { label: '50%+', color: '#f5a623' },
          { label: '<50%', color: '#ff4757' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: 1, background: l.color }} />
            <span style={{ fontSize: 7, color: S.dm, fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
