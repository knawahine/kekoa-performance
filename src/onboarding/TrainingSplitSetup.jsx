import { useState } from 'react';
import { S } from '../lib/styles';
import { SPLIT } from '../data/workouts';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TrainingSplitSetup({ data, onUpdate, onNext, onBack }) {
  const [choice, setChoice] = useState(data.splitChoice || (data.useTemplate ? 'template' : null));

  // Custom split state
  const [trainingDays, setTrainingDays] = useState(
    data.customSplit?.trainingDays || [true, true, true, false, true, true, false]
  );
  const [dayNames, setDayNames] = useState(
    data.customSplit?.dayNames || DAYS.map(() => '')
  );

  const toggleDay = (i) => {
    const next = [...trainingDays];
    next[i] = !next[i];
    setTrainingDays(next);
  };

  const handleNext = () => {
    if (choice === 'template') {
      onUpdate({ splitChoice: 'template' });
    } else if (choice === 'custom') {
      onUpdate({
        splitChoice: 'custom',
        customSplit: { trainingDays, dayNames },
      });
    } else {
      onUpdate({ splitChoice: 'skip' });
    }
    onNext();
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700,
        letterSpacing: 2.5, color: S.bl, textTransform: 'uppercase', marginBottom: 6,
      }}>
        STEP 4 OF 4
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800,
        color: '#fff', marginBottom: 20,
      }}>
        Training Split
      </div>

      {/* Template option */}
      <button
        onClick={() => setChoice('template')}
        style={{
          width: '100%', padding: '14px', marginBottom: 8, borderRadius: 10,
          background: choice === 'template' ? 'rgba(56,145,255,0.06)' : 'rgba(18,24,38,0.85)',
          border: `1px solid ${choice === 'template' ? 'rgba(56,145,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: choice === 'template' ? S.bl : '#fff' }}>
          📋 Use Template Split
        </div>
        <div style={{ fontSize: 11, color: S.dm, marginTop: 4, lineHeight: 1.5 }}>
          5-day split: Upper Push, Lower Power, SAM, Upper Pull, Lower Strength + Plyo. Includes full exercise library with phase progressions.
        </div>
        {choice === 'template' && (
          <div style={{ marginTop: 10 }}>
            {SPLIT.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 0', fontSize: 11,
              }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ color: S.dm, width: 28, fontSize: 10, fontWeight: 600 }}>{s.day.slice(0, 3)}</span>
                <span style={{ color: s.type === 'training' ? '#c8c4bb' : S.dm, fontWeight: s.type === 'training' ? 600 : 400 }}>
                  {s.session}
                </span>
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Custom option */}
      <button
        onClick={() => setChoice('custom')}
        style={{
          width: '100%', padding: '14px', marginBottom: 8, borderRadius: 10,
          background: choice === 'custom' ? 'rgba(0,212,170,0.06)' : 'rgba(18,24,38,0.85)',
          border: `1px solid ${choice === 'custom' ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.05)'}`,
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: choice === 'custom' ? S.gr : '#fff' }}>
          🛠️ Build My Own Split
        </div>
        <div style={{ fontSize: 11, color: S.dm, marginTop: 4 }}>
          Pick training days and name your sessions. Add exercises later from the app.
        </div>
      </button>

      {choice === 'custom' && (
        <div style={{
          padding: 14, borderRadius: 10,
          background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.15)',
          marginBottom: 8,
        }}>
          {DAYS.map((day, i) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <button
                onClick={() => toggleDay(i)}
                style={{
                  width: 24, height: 24, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${trainingDays[i] ? S.gr : S.dr}`,
                  background: trainingDays[i] ? S.gr : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 12, color: S.bg, fontWeight: 900,
                }}
              >
                {trainingDays[i] && '✓'}
              </button>
              <span style={{ fontSize: 11, fontWeight: 600, color: S.dm, width: 24 }}>{day.slice(0, 3)}</span>
              {trainingDays[i] && (
                <input
                  value={dayNames[i]}
                  onChange={(e) => { const next = [...dayNames]; next[i] = e.target.value; setDayNames(next); }}
                  placeholder={`e.g. ${['Upper Push', 'Leg Day', 'SAM', 'Recovery', 'Upper Pull', 'Lower Power', 'Rest'][i]}`}
                  style={{
                    flex: 1, background: '#1a2744',
                    border: '1px solid rgba(56,145,255,0.1)',
                    borderRadius: 6, padding: '6px 10px',
                    color: S.tx, fontSize: 11, outline: 'none',
                  }}
                />
              )}
              {!trainingDays[i] && <span style={{ fontSize: 10, color: S.dm }}>Off / Recovery</span>}
            </div>
          ))}
        </div>
      )}

      {/* Skip option */}
      <button
        onClick={() => setChoice('skip')}
        style={{
          width: '100%', padding: '14px', marginBottom: 8, borderRadius: 10,
          background: choice === 'skip' ? 'rgba(245,166,35,0.06)' : 'rgba(18,24,38,0.85)',
          border: `1px solid ${choice === 'skip' ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.05)'}`,
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: choice === 'skip' ? S.am : '#fff' }}>
          ⏭️ Skip For Now
        </div>
        <div style={{ fontSize: 11, color: S.dm, marginTop: 4 }}>Log exercises ad-hoc during sessions.</div>
      </button>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={onBack} style={{
          flex: 1, background: 'rgba(56,145,255,0.08)', border: `1px solid rgba(56,145,255,0.2)`,
          color: S.bl, borderRadius: 8, padding: '12px', fontSize: 12,
          fontWeight: 700, cursor: 'pointer',
        }}>
          BACK
        </button>
        <button
          onClick={handleNext}
          disabled={!choice}
          style={{
            flex: 2, background: !choice ? '#1a2744' : S.bl,
            color: !choice ? S.dm : '#fff',
            border: 'none', borderRadius: 8, padding: '12px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
          }}
        >
          FINISH SETUP
        </button>
      </div>
    </div>
  );
}
