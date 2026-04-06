import { useState } from 'react';
import { S } from '../lib/styles';
import Card from './shared/Card';
import Label from './shared/Label';
import MacroBar from './shared/MacroBar';
import StreakDashboard from './StreakDashboard';
import { SUPPS } from '../data/supplements';

export default function TodayTab({ meals, mc, sc, tMeal, tSupp, consumed, tgt, split, isTr, score, mH, sH, cappedWk, isCut, goMaintenance, resumeProgram, pausedProg, startNew, totalWks, st, streaks, personalBests, onToggleFreeze, onUpdateStartDate, activeProgramStart }) {
  const [showMode, setShowMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWks, setNewWks] = useState("");
  const [confirmMaint, setConfirmMaint] = useState(false);
  const programDone = isCut && cappedWk >= totalWks;
  const activeProg = st.programs?.find((p) => p.active);

  return (
    <>
      {programDone && (
        <Card style={{ background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.25)" }}>
          <Label color={S.gr}>PROGRAM COMPLETE 🎉</Label>
          <div style={{ fontSize: 12, color: "#c8c4bb", marginBottom: 8 }}>
            Your {totalWks}-week cut is done. What's next?
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { goMaintenance(); }} style={{ flex: 1, background: "rgba(0,212,170,0.12)", border: "1px solid rgba(0,212,170,0.3)", color: S.gr, borderRadius: 8, padding: "10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>MAINTENANCE MODE</button>
            <button onClick={() => setShowMode(true)} style={{ flex: 1, background: "rgba(56,145,255,0.12)", border: "1px solid rgba(56,145,255,0.3)", color: S.bl, borderRadius: 8, padding: "10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>NEW PROGRAM</button>
          </div>
        </Card>
      )}

      {/* Today's Session Card */}
      <Card glow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: S.dm, fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>
              {split.icon} {split.session}
            </div>
            <div style={{ fontSize: 11, color: S.dm }}>{split.sub}</div>
            <div style={{ display: "inline-block", background: isTr ? "rgba(56,145,255,0.12)" : "rgba(0,212,170,0.12)", color: isTr ? S.bl : S.gr, fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, marginTop: 6, letterSpacing: 1 }}>
              {isTr ? "TRAINING" : "OFF"} — {tgt.cal} kcal
            </div>
          </div>
          <div style={{ width: 58, height: 58, borderRadius: "50%", border: `3px solid ${score >= 80 ? S.gr : score >= 50 ? S.am : S.rd}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 7, fontWeight: 700, color: S.dm }}>SCORE</div>
          </div>
        </div>
      </Card>

      {/* Streaks */}
      <StreakDashboard
        streaks={streaks}
        personalBests={personalBests}
        streakFreezeUsed={!!(st.streakFreezes || {})[cappedWk]}
        onToggleFreeze={onToggleFreeze}
        currentWeek={cappedWk}
      />

      {/* Macros */}
      <Card>
        <Label>MACROS</Label>
        <MacroBar label="PROTEIN" cur={consumed.p} max={tgt.p} color={S.bl} />
        <MacroBar label="CARBS" cur={consumed.c} max={tgt.c} color={S.gr} />
        <MacroBar label="FAT" cur={consumed.f} max={tgt.f} color={S.am} />
        <MacroBar label="CALORIES" cur={consumed.cal} max={tgt.cal} color="#8899b3" />
      </Card>

      {/* Meals Checklist */}
      <Card>
        <Label>MEALS — {mH}/{meals.length}</Label>
        {meals.map((m) => (
          <button
            key={m.id}
            onClick={() => tMeal(m.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: mc[m.id] ? "rgba(0,212,170,0.06)" : "transparent", border: `1px solid ${mc[m.id] ? "rgba(0,212,170,0.18)" : S.bd}`, borderRadius: 8, padding: "8px 12px", marginBottom: 4, cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${mc[m.id] ? S.gr : S.dr}`, background: mc[m.id] ? S.gr : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {mc[m.id] && <span style={{ color: S.bg, fontSize: 12, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: mc[m.id] ? S.gr : S.tx }}>{m.nm}</div>
              <div style={{ fontSize: 10, color: S.dm }}>{m.tm}</div>
            </div>
          </button>
        ))}
      </Card>

      {/* Supplements Checklist */}
      <Card>
        <Label>SUPPLEMENTS — {sH}/{SUPPS.length}</Label>
        {SUPPS.map((s, i) => (
          <button
            key={i}
            onClick={() => tSupp(i)}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: sc[i] ? "rgba(0,212,170,0.06)" : "transparent", border: `1px solid ${sc[i] ? "rgba(0,212,170,0.18)" : S.bd}`, borderRadius: 8, padding: "7px 12px", marginBottom: 3, cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sc[i] ? S.gr : S.dr}`, background: sc[i] ? S.gr : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {sc[i] && <span style={{ color: S.bg, fontSize: 10, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: sc[i] ? S.gr : S.tx }}>{s.n}</div>
              <div style={{ fontSize: 10, color: S.dm }}>{s.t} — {s.d}</div>
            </div>
          </button>
        ))}
      </Card>

      {/* Program Settings */}
      {!programDone && (
        <button onClick={() => setShowMode(!showMode)} style={{ width: "100%", background: "rgba(56,145,255,0.04)", border: "1px dashed rgba(56,145,255,0.15)", borderRadius: 8, padding: "8px", fontSize: 10, color: S.dm, cursor: "pointer", marginBottom: 12 }}>
          ⚙️ Program Settings
        </button>
      )}
      {showMode && (
        <Card>
          <Label>PROGRAM SETTINGS</Label>

          {/* Start Date Editor */}
          <div style={{ marginBottom: 12, padding: "10px 12px", background: "rgba(56,145,255,0.04)", border: "1px solid rgba(56,145,255,0.12)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 4, letterSpacing: 0.5 }}>PROGRAM START DATE</div>
            <input
              type="date"
              value={activeProgramStart || ''}
              onChange={(e) => onUpdateStartDate(e.target.value)}
              style={{
                width: "100%", background: "#1a2744",
                border: "1px solid rgba(56,145,255,0.2)",
                borderRadius: 6, padding: "8px 10px",
                color: S.tx, fontSize: 13, outline: "none",
                boxSizing: "border-box",
                colorScheme: "dark",
              }}
            />
            <div style={{ fontSize: 9, color: S.dm, marginTop: 4 }}>
              Week {cappedWk}{isCut ? ` of ${totalWks}` : ''} — changing this recalculates everything
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, marginBottom: 6, letterSpacing: 1 }}>PROGRAM MODE</div>

          {/* Resume paused program */}
          {pausedProg && st.mode === "maintenance" && (() => {
            const pausedWk = Math.max(1, Math.floor((new Date() - new Date(pausedProg.start)) / 604800000) + 1);
            const pausedCapped = Math.min(pausedWk, pausedProg.weeks || pausedWk);
            return (
              <button onClick={resumeProgram} style={{ width: "100%", background: "rgba(56,145,255,0.08)", border: "1px solid rgba(56,145,255,0.25)", borderRadius: 8, padding: "10px 12px", marginBottom: 6, cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.bl }}>Resume Program</div>
                <div style={{ fontSize: 10, color: "#c8c4bb", marginTop: 2 }}>{pausedProg.name} — Week {pausedCapped}{pausedProg.weeks ? ` of ${pausedProg.weeks}` : ''}</div>
              </button>
            );
          })()}

          {/* Switch to maintenance */}
          {isCut && !confirmMaint && (
            <button onClick={() => setConfirmMaint(true)} style={{ width: "100%", background: "transparent", border: `1px solid ${S.bd}`, borderRadius: 8, padding: "10px", marginBottom: 6, cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.tx }}>Switch to Maintenance</div>
              <div style={{ fontSize: 10, color: S.dm }}>Pause your program and track indefinitely.</div>
            </button>
          )}

          {/* Already in maintenance */}
          {st.mode === "maintenance" && !pausedProg && (
            <div style={{ width: "100%", background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 8, padding: "10px", marginBottom: 6, textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.gr }}>Maintenance Mode Active</div>
              <div style={{ fontSize: 10, color: S.dm }}>No end date. Tracking meals, training, recovery.</div>
            </div>
          )}

          {/* Confirmation dialog */}
          {confirmMaint && (
            <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 8, padding: "12px", marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.am, marginBottom: 6 }}>⚠️ Pause Program?</div>
              <div style={{ fontSize: 11, color: "#c8c4bb", lineHeight: 1.5, marginBottom: 10 }}>
                You are on <strong style={{ color: "#fff" }}>Week {cappedWk}</strong> of <strong style={{ color: "#fff" }}>{activeProg?.name || 'your program'}</strong>.
                Switching to Maintenance will pause your program. You can resume it anytime.
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setConfirmMaint(false)} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${S.bd}`, color: S.dm, borderRadius: 6, padding: "8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>CANCEL</button>
                <button onClick={() => { goMaintenance(); setConfirmMaint(false); }} style={{ flex: 1, background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.3)", color: S.am, borderRadius: 6, padding: "8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>PAUSE & SWITCH</button>
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: S.dm, margin: "8px 0 6px", letterSpacing: 1 }}>START A NEW PROGRAM:</div>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Program name (e.g. 8-Week Bulk)" style={{ width: "100%", background: "#1a2744", border: `1px solid ${S.bd}`, borderRadius: 6, padding: "8px 10px", color: S.tx, fontSize: 12, marginBottom: 6, outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" value={newWks} onChange={(e) => setNewWks(e.target.value)} placeholder="Weeks (0=no end)" style={{ flex: 1, background: "#1a2744", border: `1px solid ${S.bd}`, borderRadius: 6, padding: "8px 10px", color: S.tx, fontSize: 12, outline: "none" }} />
            <button onClick={() => { if (newName) startNew(newName, newWks); setShowMode(false); setNewName(""); setNewWks(""); }} style={{ background: S.bl, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>START</button>
          </div>
        </Card>
      )}
    </>
  );
}
