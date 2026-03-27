import { useState, useEffect } from 'react';
import { S } from '../lib/styles';
import { fetchTemplates, KEKOA_TEMPLATE } from '../lib/templates';

export default function ChoosePath({ data, onUpdate, onNext, onBack }) {
  const [selected, setSelected] = useState(data.path || null);
  const [templates, setTemplates] = useState([]);
  const [programName, setProgramName] = useState(data.programName || '');
  const [programWeeks, setProgramWeeks] = useState(data.programWeeks || '');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (selected === 'template') {
      setLoadingTemplates(true);
      fetchTemplates().then(({ splits }) => {
        setTemplates(splits);
        setLoadingTemplates(false);
      }).catch(() => setLoadingTemplates(false));
    }
  }, [selected]);

  const handleNext = () => {
    if (selected === 'program') {
      onUpdate({ path: 'program', programName, programWeeks: parseInt(programWeeks) || 12, mode: 'cut' });
    } else if (selected === 'template') {
      onUpdate({
        path: 'template',
        programName: KEKOA_TEMPLATE.name,
        programWeeks: KEKOA_TEMPLATE.weeks,
        mode: KEKOA_TEMPLATE.mode,
        useTemplate: true,
      });
    } else if (selected === 'maintenance') {
      onUpdate({ path: 'maintenance', programName: 'Maintenance', programWeeks: 0, mode: 'maintenance' });
    }
    onNext();
  };

  const options = [
    {
      id: 'template',
      icon: '📋',
      title: 'Use a Template',
      desc: "Start with Kekoa's 12-Week Performance Cut. Includes full training split, meal plans, and supplement stack. You can customize everything after.",
      color: S.bl,
    },
    {
      id: 'program',
      icon: '🎯',
      title: 'Start a Program',
      desc: 'Create your own structured program with a set number of weeks. Name it, set the duration, and build your plan.',
      color: S.gr,
    },
    {
      id: 'maintenance',
      icon: '🧘',
      title: 'Maintenance Mode',
      desc: 'No program, no end date. Track meals, training, and progress indefinitely. Great for staying consistent without a deadline.',
      color: S.am,
    },
  ];

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
        STEP 2 OF 4
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800,
        color: '#fff', marginBottom: 20,
      }}>
        Choose Your Path
      </div>

      {/* Path Options */}
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setSelected(opt.id)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            width: '100%', padding: '14px', marginBottom: 8, borderRadius: 10,
            background: selected === opt.id ? `${opt.color}10` : 'rgba(18,24,38,0.85)',
            border: `1px solid ${selected === opt.id ? `${opt.color}40` : 'rgba(255,255,255,0.05)'}`,
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: selected === opt.id ? opt.color : '#fff' }}>
              {opt.title}
            </div>
            <div style={{ fontSize: 11, color: S.dm, marginTop: 4, lineHeight: 1.5 }}>
              {opt.desc}
            </div>
          </div>
        </button>
      ))}

      {/* Custom program fields */}
      {selected === 'program' && (
        <div style={{
          marginTop: 12, padding: 14,
          background: 'rgba(18,24,38,0.85)', borderRadius: 10,
          border: `1px solid rgba(0,212,170,0.15)`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 4 }}>PROGRAM NAME</div>
          <input
            value={programName} onChange={(e) => setProgramName(e.target.value)}
            placeholder="e.g. 8-Week Bulk"
            style={inputStyle}
          />
          <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 4, marginTop: 8 }}>DURATION (WEEKS)</div>
          <input
            type="number"
            value={programWeeks} onChange={(e) => setProgramWeeks(e.target.value)}
            placeholder="12"
            style={inputStyle}
          />
        </div>
      )}

      {/* Template preview */}
      {selected === 'template' && (
        <div style={{
          marginTop: 12, padding: 14,
          background: 'rgba(56,145,255,0.04)', borderRadius: 10,
          border: '1px solid rgba(56,145,255,0.15)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.bl, marginBottom: 6 }}>
            {KEKOA_TEMPLATE.name}
          </div>
          <div style={{ fontSize: 11, color: S.dm, lineHeight: 1.6 }}>
            <div>5 training days + 2 recovery days</div>
            <div>5 meals/day with full macro targets</div>
            <div>9 supplements tracked daily</div>
            <div>3-phase periodization (Foundation → Intensity → Peak)</div>
            <div style={{ color: S.gr, fontWeight: 600, marginTop: 4 }}>
              ✓ Fully customizable after setup
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button onClick={onBack} style={{
          flex: 1, background: 'rgba(56,145,255,0.08)', border: `1px solid rgba(56,145,255,0.2)`,
          color: S.bl, borderRadius: 8, padding: '12px', fontSize: 12,
          fontWeight: 700, cursor: 'pointer',
        }}>
          BACK
        </button>
        <button
          onClick={handleNext}
          disabled={!selected || (selected === 'program' && !programName)}
          style={{
            flex: 2,
            background: (!selected || (selected === 'program' && !programName)) ? '#1a2744' : S.bl,
            color: (!selected || (selected === 'program' && !programName)) ? S.dm : '#fff',
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
