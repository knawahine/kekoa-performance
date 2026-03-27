import { useState } from 'react';
import { S } from '../lib/styles';

export default function ProfileSetup({ data, onUpdate, onNext, onBack }) {
  const [name, setName] = useState(data.name || '');
  const [height, setHeight] = useState(data.height || '');
  const [weight, setWeight] = useState(data.weight || '');
  const [bfTarget, setBfTarget] = useState(data.bodyFatTarget || '');

  const handleNext = () => {
    onUpdate({ name, height, weight: parseFloat(weight) || 220, bodyFatTarget: bfTarget });
    onNext();
  };

  const inputStyle = {
    width: '100%', background: '#1a2744',
    border: '1px solid rgba(56,145,255,0.15)',
    borderRadius: 8, padding: '12px 14px',
    color: S.tx, fontSize: 14, outline: 'none',
    boxSizing: 'border-box', marginBottom: 4,
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700,
        letterSpacing: 2.5, color: S.bl, textTransform: 'uppercase', marginBottom: 6,
      }}>
        STEP 1 OF 4
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800,
        color: '#fff', marginBottom: 20,
      }}>
        About You
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 4, letterSpacing: 0.5 }}>NAME *</div>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 4, letterSpacing: 0.5 }}>HEIGHT</div>
        <input
          value={height} onChange={(e) => setHeight(e.target.value)}
          placeholder="e.g. 5'10 or 178cm"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 4, letterSpacing: 0.5 }}>CURRENT WEIGHT (lbs) *</div>
        <input
          type="number"
          value={weight} onChange={(e) => setWeight(e.target.value)}
          placeholder="220"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 4, letterSpacing: 0.5 }}>BODY FAT TARGET (optional)</div>
        <input
          value={bfTarget} onChange={(e) => setBfTarget(e.target.value)}
          placeholder="e.g. <10%"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} style={{
          flex: 1, background: 'rgba(56,145,255,0.08)', border: `1px solid rgba(56,145,255,0.2)`,
          color: S.bl, borderRadius: 8, padding: '12px', fontSize: 12,
          fontWeight: 700, cursor: 'pointer',
        }}>
          BACK
        </button>
        <button
          onClick={handleNext}
          disabled={!name || !weight}
          style={{
            flex: 2, background: (!name || !weight) ? '#1a2744' : S.bl,
            color: (!name || !weight) ? S.dm : '#fff',
            border: 'none', borderRadius: 8, padding: '12px', fontSize: 13,
            fontWeight: 700, cursor: (!name || !weight) ? 'default' : 'pointer',
            letterSpacing: 1,
          }}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
