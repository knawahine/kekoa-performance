import { S } from '../lib/styles';

export default function Done({ data, onEnterApp }) {
  const isTemplate = data.useTemplate || data.mealChoice === 'template' || data.splitChoice === 'template';
  const isMaintenance = data.mode === 'maintenance';

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>

      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 800,
        color: '#fff', lineHeight: 1.2, marginBottom: 8,
      }}>
        You're Ready
      </div>

      <div style={{ fontSize: 13, color: S.dm, marginBottom: 32, lineHeight: 1.6 }}>
        {data.name ? `${data.name}, your ` : 'Your '}
        {isMaintenance
          ? 'maintenance tracker is set up.'
          : `${data.programName || 'program'} is ready to go.`
        }
      </div>

      {/* Summary card */}
      <div style={{
        background: 'rgba(18,24,38,0.85)',
        border: '1px solid rgba(56,145,255,0.15)',
        borderRadius: 14, padding: 20,
        textAlign: 'left', marginBottom: 32,
        maxWidth: 320, margin: '0 auto 32px',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700,
          letterSpacing: 2, color: S.bl, marginBottom: 12,
        }}>
          YOUR SETUP
        </div>

        {[
          { label: 'Program', value: data.programName || 'Maintenance', icon: '🎯' },
          { label: 'Duration', value: data.programWeeks ? `${data.programWeeks} weeks` : 'Ongoing', icon: '📅' },
          { label: 'Weight', value: data.weight ? `${data.weight} lbs` : '—', icon: '⚖️' },
          { label: 'Meals', value: data.mealChoice === 'template' ? 'Template plan' : data.mealChoice === 'targets' ? 'Custom targets' : 'Set up later', icon: '🍽️' },
          { label: 'Training', value: data.splitChoice === 'template' ? 'Template split' : data.splitChoice === 'custom' ? 'Custom split' : 'Set up later', icon: '🏋️' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 0', borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.05)` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ fontSize: 11, color: S.dm }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#c8c4bb' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {isTemplate && (
        <div style={{
          fontSize: 11, color: S.dm, marginBottom: 24, lineHeight: 1.5,
          maxWidth: 280, margin: '0 auto 24px',
        }}>
          💡 Everything is fully customizable. Swap foods, adjust portions, modify exercises — make it yours.
        </div>
      )}

      <button
        onClick={onEnterApp}
        style={{
          width: '100%', maxWidth: 300, background: `linear-gradient(135deg, ${S.bl}, ${S.gr})`,
          color: '#fff', border: 'none', borderRadius: 10, padding: '14px',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
          fontFamily: "'Barlow'",
        }}
      >
        LET'S GO
      </button>
    </div>
  );
}
