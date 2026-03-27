import { useState } from 'react';
import { S } from '../lib/styles';
import { SPLIT, WK } from '../data/workouts';
import Card from './shared/Card';
import Label from './shared/Label';
import SetLogger from './SetLogger';

export default function TrainingTab({ si: dsi, pk, ph, cw, exLogs, logEx }) {
  const [vd, setVd] = useState(dsi);
  const sp = SPLIT[vd];
  const exs = WK[vd] || [];
  const has = exs.length > 0;
  const pN = ["Foundation & Volume", "Intensity & Density", "Peak Performance"];

  return (
    <>
      <Card glow>
        <Label>PHASE {ph} — {pN[ph - 1].toUpperCase()}</Label>
        <div style={{ fontSize: 12, color: "#c8c4bb" }}>Week {cw}</div>
      </Card>

      <Card>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 800, color: "#fff" }}>
          {sp.icon} {sp.session}
        </div>
        <div style={{ fontSize: 11, color: S.dm, marginTop: 2 }}>{sp.sub}</div>
        <div style={{ marginTop: 6, fontSize: 11, color: S.gr, fontWeight: 600 }}>🫀 {sp.cardio}</div>
      </Card>

      {!has && (
        <Card>
          <Label color={S.gr}>RECOVERY DAY</Label>
          <div style={{ fontSize: 12, color: "#c8c4bb", lineHeight: 1.6 }}>
            {vd === 3
              ? "Foam rolling • Couch stretch • Pigeon 3 min/side • PNF achilles/calf • Jefferson curl • Breathing 5 min • Sauna"
              : "Full rest. Optional walk."}
          </div>
        </Card>
      )}

      {has && exs.map((ex) => {
        if (ex.wu) {
          return (
            <Card key={ex.id} style={{ background: "rgba(56,145,255,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.bl, marginBottom: 4 }}>{ex.nm}</div>
              <div style={{ fontSize: 11, color: S.dm, lineHeight: 1.5 }}>{ex.note}</div>
            </Card>
          );
        }
        const rps = typeof ex.rp === "object" ? ex.rp[pk] : ex.rp;
        const sts = typeof ex.st === "object" ? ex.st[pk] : ex.st;
        const nS = parseInt(sts) || 4;
        const logs = exLogs[`${vd}-${ex.id}`] || {};
        return (
          <Card key={ex.id} style={ex.ach ? { border: "1px solid rgba(245,166,35,0.25)", background: "rgba(245,166,35,0.04)" } : {}}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700, color: ex.ach ? S.am : "#fff" }}>{ex.nm}</div>
              <div style={{ fontSize: 10, color: S.dm }}>{ex.rs}</div>
            </div>
            <div style={{ fontSize: 11, color: S.gr, fontWeight: 600, marginBottom: 4 }}>{sts} × {rps}</div>
            {ex.note && <div style={{ fontSize: 10, color: S.dm, marginBottom: 4, lineHeight: 1.4 }}>{ex.note}</div>}
            {ex.prog && <div style={{ fontSize: 10, color: S.bl, marginBottom: 4 }}>↗ {ex.prog}</div>}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Array.from({ length: nS }, (_, i) => (
                <SetLogger key={i} idx={i} log={logs[i]} onSave={(data) => logEx(vd, ex.id, i, data)} />
              ))}
            </div>
          </Card>
        );
      })}

      {/* Weekly Split Selector */}
      <Card>
        <Label>WEEKLY SPLIT — TAP TO VIEW</Label>
        {SPLIT.map((s, i) => {
          const ic = i === vd;
          return (
            <button
              key={s.day}
              onClick={() => setVd(i)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "6px 8px", marginBottom: 3, borderRadius: 6,
                background: ic ? "rgba(56,145,255,0.1)" : "transparent",
                border: ic ? "1px solid rgba(56,145,255,0.2)" : "1px solid transparent",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ic ? S.bl : "#c8c4bb" }}>{s.day}</div>
                <div style={{ fontSize: 10, color: S.dm }}>{s.session}</div>
              </div>
              {i === dsi && <span style={{ fontSize: 8, color: S.gr, fontWeight: 700, letterSpacing: 1 }}>TODAY</span>}
            </button>
          );
        })}
      </Card>
    </>
  );
}
