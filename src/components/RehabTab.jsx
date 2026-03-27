import { useState } from 'react';
import { S } from '../lib/styles';
import { REHAB_PHASES, SLED } from '../data/rehab';
import Card from './shared/Card';
import Label from './shared/Label';

export default function RehabTab({ cp, ss, rehabChecks, setSt, d }) {
  const [vp, setVp] = useState(cp);
  const ph = REHAB_PHASES[vp];
  const dc = rehabChecks[d] || {};
  const tR = (p, i) => {
    const k = `${p}-${i}`;
    setSt((s) => ({ ...s, rehabChecks: { ...s.rehabChecks, [d]: { ...dc, [k]: !dc[k] } } }));
  };
  const ck = (p, i) => !!dc[`${p}-${i}`];
  const allDone = ph.ex.every((_, i) => ck(vp, i));

  return (
    <>
      <Card glow>
        <Label color={S.am}>RIGHT CALF REHAB — V2</Label>
        <div style={{ fontSize: 11, color: "#8899b3", lineHeight: 1.4 }}>
          Root cause: contralateral compensation. Bilateral symmetry is permanent.
        </div>
      </Card>

      {/* Phase Progression */}
      <Card>
        <Label>PHASE PROGRESSION — TAP TO VIEW</Label>
        {Object.entries(REHAB_PHASES).map(([k, p]) => {
          const n = parseInt(k);
          const a = n === vp;
          const dn = n < cp;
          return (
            <button
              key={n}
              onClick={() => { setVp(n); setSt((s) => ({ ...s, calfPhase: Math.max(s.calfPhase, n) })); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginBottom: 4, borderRadius: 8,
                background: a ? "rgba(245,166,35,0.06)" : dn ? "rgba(0,212,170,0.04)" : "transparent",
                border: `1px solid ${a ? "rgba(245,166,35,0.2)" : dn ? "rgba(0,212,170,0.12)" : S.bd}`,
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: dn ? S.gr : a ? S.am : "#1a2744", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: dn || a ? S.bg : S.dm, flexShrink: 0 }}>
                {dn ? "✓" : n}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: a ? S.am : dn ? S.gr : "#8899b3" }}>{p.nm}</div>
                <div style={{ fontSize: 10, color: S.dm }}>Weeks {p.wk}</div>
              </div>
            </button>
          );
        })}
      </Card>

      {/* Current Phase Exercises */}
      <Card>
        <Label color={vp === cp ? S.am : S.gr}>PHASE {vp}: {ph.nm.toUpperCase()}</Label>
        {allDone && (
          <div style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: S.gr, fontWeight: 700 }}>
            ✓ ALL COMPLETE TODAY
          </div>
        )}
        {ph.ex.map((e, i) => (
          <button
            key={i}
            onClick={() => tR(vp, i)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10, width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 8,
              background: ck(vp, i) ? "rgba(0,212,170,0.05)" : "transparent",
              border: `1px solid ${ck(vp, i) ? "rgba(0,212,170,0.15)" : S.bd}`,
              cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${ck(vp, i) ? S.gr : S.dr}`, background: ck(vp, i) ? S.gr : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {ck(vp, i) && <span style={{ color: S.bg, fontSize: 11, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: ck(vp, i) ? S.gr : S.tx, opacity: ck(vp, i) ? 0.7 : 1 }}>{e.nm}</div>
              <div style={{ fontSize: 10, color: S.dm, marginTop: 1, lineHeight: 1.4 }}>{e.dt}</div>
            </div>
          </button>
        ))}
      </Card>

      {/* Sled Sprint Re-Intro */}
      <Card>
        <Label color={S.rd}>SLED SPRINT RE-INTRO</Label>
        <div style={{ fontSize: 10, color: S.rd, fontWeight: 600, marginBottom: 8 }}>⚠️ Pain-free unloaded sprints first.</div>
        {SLED.map((s) => (
          <button
            key={s.s}
            onClick={() => setSt((st) => ({ ...st, sledStage: s.s <= ss ? s.s - 1 : s.s }))}
            style={{
              display: "flex", alignItems: "flex-start", gap: 8, width: "100%", padding: "6px 8px", marginBottom: 3, borderRadius: 6,
              cursor: "pointer", textAlign: "left", background: "transparent",
              border: `1px solid ${s.s === ss + 1 ? "rgba(56,145,255,0.12)" : "transparent"}`,
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${s.s <= ss ? S.gr : S.dr}`, background: s.s <= ss ? S.gr : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontSize: 9 }}>
              {s.s <= ss && <span style={{ color: S.bg, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.s <= ss ? S.dm : "#c8c4bb" }}>Stage {s.s}: {s.e}</div>
              <div style={{ fontSize: 9, color: S.dm }}>{s.w} — {s.g}</div>
            </div>
          </button>
        ))}
      </Card>
    </>
  );
}
