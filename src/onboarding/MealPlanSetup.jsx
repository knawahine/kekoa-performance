import { useState } from 'react';
import { S } from '../lib/styles';
import { TM, OM, TGT } from '../data/meals';
import { calcMacros } from '../lib/macros';

export default function MealPlanSetup({ data, onUpdate, onNext, onBack }) {
  const [choice, setChoice] = useState(data.mealChoice || (data.useTemplate ? 'template' : null));

  // Custom targets (if user wants to set their own)
  const [customCal, setCustomCal] = useState(data.customTargets?.cal || '');
  const [customP, setCustomP] = useState(data.customTargets?.p || '');
  const [customC, setCustomC] = useState(data.customTargets?.c || '');
  const [customF, setCustomF] = useState(data.customTargets?.f || '');

  const handleNext = () => {
    if (choice === 'template') {
      onUpdate({ mealChoice: 'template' });
    } else if (choice === 'targets') {
      onUpdate({
        mealChoice: 'targets',
        customTargets: {
          cal: parseInt(customCal) || 2500,
          p: parseInt(customP) || 200,
          c: parseInt(customC) || 250,
          f: parseInt(customF) || 70,
        },
      });
    } else {
      onUpdate({ mealChoice: 'skip' });
    }
    onNext();
  };

  const inputStyle = {
    width: '100%', background: '#1a2744',
    border: '1px solid rgba(56,145,255,0.15)',
    borderRadius: 8, padding: '10px 12px',
    color: S.tx, fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };

  // Calculate template totals
  const tmTotal = TM.reduce((a, m) => {
    m.foods.forEach((f) => { const x = calcMacros(f.n, f.g); a.p += x.p; a.c += x.c; a.f += x.f; a.cal += x.cal; });
    return a;
  }, { p: 0, c: 0, f: 0, cal: 0 });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700,
        letterSpacing: 2.5, color: S.bl, textTransform: 'uppercase', marginBottom: 6,
      }}>
        STEP 3 OF 4
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800,
        color: '#fff', marginBottom: 20,
      }}>
        Meal Plan
      </div>

      {/* Option: Use template meals */}
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
          🍽️ Use Template Meals
        </div>
        <div style={{ fontSize: 11, color: S.dm, marginTop: 4, lineHeight: 1.5 }}>
          {data.useTemplate ? "Pre-built 5-meal plan optimized for your cut." : "5 meals/day with full macro targets."}
          {" "}You can swap foods and adjust portions anytime.
        </div>
        {choice === 'template' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            {[
              { l: 'CAL', v: TGT.tr.cal, c: '#fff' },
              { l: 'P', v: `${TGT.tr.p}g`, c: S.bl },
              { l: 'C', v: `${TGT.tr.c}g`, c: S.gr },
              { l: 'F', v: `${TGT.tr.f}g`, c: S.am },
            ].map((m) => (
              <div key={m.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 800, color: m.c }}>{m.v}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: S.dm }}>{m.l}</div>
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Option: Set custom targets */}
      <button
        onClick={() => setChoice('targets')}
        style={{
          width: '100%', padding: '14px', marginBottom: 8, borderRadius: 10,
          background: choice === 'targets' ? 'rgba(0,212,170,0.06)' : 'rgba(18,24,38,0.85)',
          border: `1px solid ${choice === 'targets' ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.05)'}`,
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: choice === 'targets' ? S.gr : '#fff' }}>
          🎯 Set My Own Targets
        </div>
        <div style={{ fontSize: 11, color: S.dm, marginTop: 4, lineHeight: 1.5 }}>
          Enter your own daily protein, carbs, fat, and calorie targets. Log meals as you go.
        </div>
      </button>

      {choice === 'targets' && (
        <div style={{
          padding: 14, borderRadius: 10,
          background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.15)',
          marginBottom: 8,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.dm, marginBottom: 3 }}>CALORIES</div>
              <input type="number" value={customCal} onChange={(e) => setCustomCal(e.target.value)} placeholder="2500" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.dm, marginBottom: 3 }}>PROTEIN (g)</div>
              <input type="number" value={customP} onChange={(e) => setCustomP(e.target.value)} placeholder="200" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.dm, marginBottom: 3 }}>CARBS (g)</div>
              <input type="number" value={customC} onChange={(e) => setCustomC(e.target.value)} placeholder="250" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.dm, marginBottom: 3 }}>FAT (g)</div>
              <input type="number" value={customF} onChange={(e) => setCustomF(e.target.value)} placeholder="70" style={inputStyle} />
            </div>
          </div>
        </div>
      )}

      {/* Option: Skip */}
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
        <div style={{ fontSize: 11, color: S.dm, marginTop: 4 }}>Add a meal plan later from the app.</div>
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
          NEXT
        </button>
      </div>
    </div>
  );
}
