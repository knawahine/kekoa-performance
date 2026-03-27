import { useState } from 'react';
import { S } from '../lib/styles';
import { CK_FIELDS } from '../data/rehab';
import { today, weekDates } from '../lib/helpers';
import Card from './shared/Card';
import Label from './shared/Label';

export default function ReviewTab({ st, startDate, maxWk }) {
  const safeMaxWk = Math.max(1, maxWk || 1);
  const safeStart = startDate || st.startDate || today();
  const [vw, setVw] = useState(safeMaxWk);
  const wkDates = weekDates(safeStart, vw);

  const wkWeights = st.weightLog.filter((e) => wkDates.includes(e.d));
  const wkCheckin = st.checkins[vw];
  const wkPhotos = st.photos[vw] || {};

  const mealsLogged = wkDates.reduce((a, dt) => {
    const mc = st.mealChecks[dt];
    if (!mc) return a;
    return a + Object.values(mc).filter(Boolean).length;
  }, 0);

  const exEntries = wkDates.reduce((a, dt) => {
    const el = st.exLogs[dt];
    if (!el) return a;
    Object.entries(el).forEach(([key, sets]) => {
      const nm = key.split("-").slice(1).join("-");
      const setArr = Object.values(sets);
      a.push({ nm, sets: setArr });
    });
    return a;
  }, []);

  return (
    <>
      {/* Week Selector */}
      <Card glow>
        <Label>REVIEW HISTORY</Label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <button onClick={() => setVw(Math.max(1, vw - 1))} style={{ background: "rgba(56,145,255,0.1)", border: "1px solid rgba(56,145,255,0.2)", borderRadius: 8, padding: "8px 14px", color: S.bl, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>←</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, color: "#fff" }}>WEEK {vw}</div>
            <div style={{ fontSize: 10, color: S.dm }}>{wkDates[0]} — {wkDates[6]}</div>
          </div>
          <button onClick={() => setVw(Math.min(safeMaxWk, vw + 1))} style={{ background: "rgba(56,145,255,0.1)", border: "1px solid rgba(56,145,255,0.2)", borderRadius: 8, padding: "8px 14px", color: S.bl, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>→</button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <Card style={{ flex: 1, textAlign: "center", padding: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: S.bl }}>{mealsLogged}</div>
          <div style={{ fontSize: 8, color: S.dm }}>MEALS LOGGED</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: S.gr }}>{exEntries.length}</div>
          <div style={{ fontSize: 8, color: S.dm }}>EXERCISES</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: S.am }}>{wkWeights.length}</div>
          <div style={{ fontSize: 8, color: S.dm }}>WEIGH-INS</div>
        </Card>
      </div>

      {/* Weight Entries */}
      {wkWeights.length > 0 && (
        <Card>
          <Label>WEIGHT LOG</Label>
          {wkWeights.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: `1px solid ${S.bd}` }}>
              <span style={{ color: S.dm }}>{new Date(e.d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
              <span style={{ fontWeight: 700, color: S.bl }}>{e.w} lbs</span>
            </div>
          ))}
        </Card>
      )}

      {/* Exercise Log */}
      {exEntries.length > 0 && (
        <Card>
          <Label>WORKOUT LOG</Label>
          {exEntries.map((e, i) => (
            <div key={i} style={{ marginBottom: 6, padding: "4px 0", borderBottom: `1px solid ${S.bd}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c8c4bb" }}>{e.nm}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                {e.sets.map((s, si) => s && (
                  <span key={si} style={{ fontSize: 10, color: S.gr, background: "rgba(0,212,170,0.06)", padding: "2px 6px", borderRadius: 4 }}>
                    {s.w && `${s.w}lb×`}{s.r}r
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Check-In */}
      {wkCheckin ? (
        <Card>
          <Label>CHECK-IN</Label>
          {CK_FIELDS.map((f) => wkCheckin[f.k] && (
            <div key={f.k} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.dm }}>{f.l}</div>
              <div style={{ fontSize: 12, color: "#c8c4bb" }}>{wkCheckin[f.k]}</div>
            </div>
          ))}
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 12, color: S.dm, textAlign: "center", padding: 12 }}>No check-in saved for Week {vw}</div>
        </Card>
      )}

      {/* Photos */}
      {wkPhotos.front || wkPhotos.side || wkPhotos.back ? (
        <Card>
          <Label color={S.gr}>PROGRESS PHOTOS</Label>
          <div style={{ display: "flex", gap: 6 }}>
            {["front", "side", "back"].map((t) =>
              wkPhotos[t] ? (
                <div key={t} style={{ flex: 1, borderRadius: 8, overflow: "hidden", aspectRatio: "3/4" }}>
                  <img src={wkPhotos[t]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={t} />
                </div>
              ) : (
                <div key={t} style={{ flex: 1, background: "#1a2744", borderRadius: 8, aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: S.dm }}>
                  No {t}
                </div>
              )
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 12, color: S.dm, textAlign: "center", padding: 12 }}>No photos for Week {vw}</div>
        </Card>
      )}

      {/* Week Quick Nav */}
      <Card>
        <Label>JUMP TO WEEK</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {Array.from({ length: safeMaxWk }, (_, i) => {
            const w = i + 1;
            const hasDat = !!st.checkins[w] || !!st.photos?.[w]?.front;
            return (
              <button
                key={w}
                onClick={() => setVw(w)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: w === vw ? "rgba(56,145,255,0.2)" : hasDat ? "rgba(0,212,170,0.06)" : "#1a2744",
                  border: `1px solid ${w === vw ? "rgba(56,145,255,0.4)" : hasDat ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.05)"}`,
                  color: w === vw ? S.bl : hasDat ? S.gr : S.dm,
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
}
