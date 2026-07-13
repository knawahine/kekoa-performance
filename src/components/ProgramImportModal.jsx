import { useState, useEffect } from 'react';
import { S } from '../lib/styles';
import { useAuth } from '../context/AuthContext';
import { parseProgramPdf, saveImportedProgram } from '../lib/programImport';
import Card from './shared/Card';
import Label from './shared/Label';

// Expandable section card.
function Section({ title, count, children }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <Label>{title}</Label>
        <span style={{ fontSize: 11, color: S.dm }}>
          {count != null ? `${count} ` : ''}{open ? '▲' : '▼'}
        </span>
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </Card>
  );
}

const inputStyle = {
  width: '100%', background: '#1a2744', border: `1px solid ${S.bd}`,
  borderRadius: 6, padding: '8px 10px', color: S.tx, fontSize: 12,
  outline: 'none', boxSizing: 'border-box',
};

export default function ProgramImportModal({ file, onClose, onImported }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState('uploading'); // uploading | review | saving | error
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(null);
  const [foods, setFoods] = useState([]); // editable unknown-food rows
  const [programName, setProgramName] = useState('Imported Program');
  const [weeks, setWeeks] = useState('');

  const [attempt, setAttempt] = useState(0);

  // Parse the PDF on mount (and on each retry via `attempt`).
  useEffect(() => {
    let cancelled = false;
    setPhase('uploading');
    setError('');
    (async () => {
      try {
        const data = await parseProgramPdf(file, user?.id);
        if (cancelled) return;
        setParsed(data);
        const unknown = Array.isArray(data.unknown_foods) ? data.unknown_foods : [];
        setFoods(unknown.map((f) => ({
          name: f.name || '',
          protein_per_100g: f.protein_per_100g ?? '',
          carbs_per_100g: f.carbs_per_100g ?? '',
          fat_per_100g: f.fat_per_100g ?? '',
          cal_per_100g: f.cal_per_100g ?? '',
          estimated: f.estimated !== false,
        })));
        setPhase('review');
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to parse program.');
        setPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, [file, user, attempt]);

  const updateFood = (i, key, value) => {
    setFoods((prev) => prev.map((f, j) => (j === i ? { ...f, [key]: value, estimated: false } : f)));
  };

  const foodsValid = foods.every((f) =>
    f.protein_per_100g !== '' && f.carbs_per_100g !== '' &&
    f.fat_per_100g !== '' && f.cal_per_100g !== '');

  const handleConfirm = async () => {
    setPhase('saving');
    try {
      const verifiedFoods = foods.map((f) => ({
        name: f.name,
        protein_per_100g: f.protein_per_100g,
        carbs_per_100g: f.carbs_per_100g,
        fat_per_100g: f.fat_per_100g,
        cal_per_100g: f.cal_per_100g,
      }));
      const programPayload = await saveImportedProgram({
        userId: user.id,
        programName,
        weeks,
        parsed,
        verifiedFoods,
      });
      onImported(programPayload);
    } catch (err) {
      setError(err.message || 'Failed to save program.');
      setPhase('error');
    }
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(10,14,23,0.97)',
    zIndex: 9999, overflowY: 'auto',
    maxWidth: 480, margin: '0 auto',
  };
  const pad = { padding: '18px 14px 40px' };

  // ── Uploading / saving spinner ──────────────────────────────
  if (phase === 'uploading' || phase === 'saving') {
    return (
      <div style={overlay}>
        <div style={{ ...pad, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{phase === 'uploading' ? '📄' : '☁️'}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'Barlow Condensed'" }}>
            {phase === 'uploading' ? 'Parsing your program…' : 'Saving program…'}
          </div>
          <div style={{ fontSize: 12, color: S.dm, marginTop: 8 }}>
            {phase === 'uploading' ? 'Claude is reading your PDF' : 'Almost done'}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div style={overlay}>
        <div style={pad}>
          <Card>
            <Label color={S.rd}>IMPORT FAILED</Label>
            <div style={{ fontSize: 12, color: '#c8c4bb', lineHeight: 1.5, marginTop: 8, wordBreak: 'break-word' }}>{error || 'Something went wrong while parsing your PDF.'}</div>
            <div style={{ fontSize: 10, color: S.dm, lineHeight: 1.5, marginTop: 10 }}>
              Tip: if this keeps happening, the PDF may be very large or scanned as images. Try a text-based PDF, or a shorter one.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => setAttempt((a) => a + 1)} style={{ flex: 1, background: S.bl, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                TRY AGAIN
              </button>
              <button onClick={onClose} style={{ flex: 1, background: 'transparent', color: S.dm, border: `1px solid ${S.bd}`, borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                CLOSE
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Review ──────────────────────────────────────────────────
  const split = Array.isArray(parsed?.training_split) ? parsed.training_split : [];
  const trMeals = parsed?.meals?.training_day || [];
  const offMeals = parsed?.meals?.off_day || [];
  const mt = parsed?.macro_targets;
  const supps = Array.isArray(parsed?.supplements) ? parsed.supplements : [];

  return (
    <div style={overlay}>
      <div style={pad}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800, color: '#fff' }}>REVIEW PROGRAM</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.dm, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 11, color: S.dm, marginBottom: 14, lineHeight: 1.5 }}>
          Verify the extracted program below, then confirm to make it your active program.
        </div>

        {/* Program name + weeks */}
        <Card>
          <Label>PROGRAM DETAILS</Label>
          <input value={programName} onChange={(e) => setProgramName(e.target.value)} placeholder="Program name" style={{ ...inputStyle, marginBottom: 6 }} />
          <input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} placeholder="Weeks (0 = no end date)" style={inputStyle} />
        </Card>

        {/* Training split */}
        <Section title="TRAINING SPLIT" count={split.length ? `${split.length} days` : 'none'}>
          {split.length === 0 && <div style={{ fontSize: 11, color: S.dm }}>Not found in PDF — built-in split will be kept.</div>}
          {split.map((d, i) => (
            <div key={i} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${S.bd}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: d.type === 'off' ? S.gr : '#fff' }}>
                {d.day} — {d.session_name || (d.type === 'off' ? 'Off' : 'Training')}
              </div>
              {d.subtitle && <div style={{ fontSize: 10, color: S.dm }}>{d.subtitle}</div>}
              {Array.isArray(d.exercises) && d.exercises.map((e, j) => (
                <div key={j} style={{ fontSize: 10, color: '#c8c4bb', marginTop: 3 }}>
                  • {e.name} — {e.sets}×{e.reps}{e.rest ? ` · rest ${e.rest}` : ''}
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* Meals */}
        <Section title="MEALS" count={`${trMeals.length}+${offMeals.length}`}>
          {[['Training Day', trMeals], ['Off Day', offMeals]].map(([label, list]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.bl, marginBottom: 4 }}>{label}</div>
              {(!list || list.length === 0) && <div style={{ fontSize: 10, color: S.dm }}>None found.</div>}
              {Array.isArray(list) && list.map((m, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{m.name}{m.time ? ` · ${m.time}` : ''}</div>
                  {Array.isArray(m.foods) && m.foods.map((f, j) => (
                    <div key={j} style={{ fontSize: 10, color: '#c8c4bb' }}>· {f.name} — {f.grams}g</div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* Macro targets */}
        <Section title="MACRO TARGETS">
          {!mt && <div style={{ fontSize: 11, color: S.dm }}>Not found in PDF.</div>}
          {mt && [['Training', mt.training], ['Off', mt.off]].map(([label, t]) => (
            t ? (
              <div key={label} style={{ fontSize: 11, color: '#c8c4bb', marginBottom: 4 }}>
                <strong style={{ color: S.bl }}>{label}:</strong> {t.cal} cal · {t.p}p / {t.c}c / {t.f}f
              </div>
            ) : null
          ))}
        </Section>

        {/* Supplements */}
        <Section title="SUPPLEMENTS" count={supps.length || 'none'}>
          {supps.length === 0 && <div style={{ fontSize: 11, color: S.dm }}>None found.</div>}
          {supps.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: '#c8c4bb', marginBottom: 3 }}>
              • {s.name}{s.timing ? ` — ${s.timing}` : ''}{s.dose ? ` (${s.dose})` : ''}
            </div>
          ))}
        </Section>

        {/* Unknown foods — editable */}
        {foods.length > 0 && (
          <Card glow>
            <Label color={S.am}>NEW FOODS — VERIFY MACROS (per 100g)</Label>
            <div style={{ fontSize: 10, color: S.dm, margin: '4px 0 10px', lineHeight: 1.5 }}>
              These foods aren't in your database. Claude estimated their macros — please verify or correct each value.
            </div>
            {foods.map((f, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${S.bd}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{f.name}</span>
                  {f.estimated && (
                    <span style={{ fontSize: 8, fontWeight: 700, color: S.am, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 4, padding: '1px 5px', letterSpacing: 0.5 }}>
                      ESTIMATED — VERIFY
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['protein_per_100g', 'P'], ['carbs_per_100g', 'C'], ['fat_per_100g', 'F'], ['cal_per_100g', 'Cal']].map(([key, lbl]) => (
                    <div key={key} style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: S.dm, marginBottom: 2, textAlign: 'center' }}>{lbl}</div>
                      <input
                        type="number"
                        value={f[key]}
                        onChange={(e) => updateFood(i, key, e.target.value)}
                        style={{ ...inputStyle, padding: '6px 4px', fontSize: 11, textAlign: 'center' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!foodsValid}
          style={{
            width: '100%', marginTop: 8,
            background: foodsValid ? S.bl : 'rgba(56,145,255,0.3)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '12px', fontWeight: 800, fontSize: 13,
            cursor: foodsValid ? 'pointer' : 'not-allowed',
            fontFamily: "'Barlow Condensed'", letterSpacing: 1,
          }}
        >
          {foodsValid ? 'CONFIRM & ACTIVATE PROGRAM' : 'FILL IN ALL FOOD MACROS TO CONTINUE'}
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 8, background: 'transparent', color: S.dm, border: `1px solid ${S.bd}`, borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
