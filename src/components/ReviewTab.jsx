import { useState } from 'react';
import { S } from '../lib/styles';
import { CK_FIELDS } from '../data/rehab';
import { SPLIT, WK } from '../data/workouts';
import { today, weekDates } from '../lib/helpers';
import Card from './shared/Card';
import Label from './shared/Label';

// Build a lookup from exercise key to name across all days
const EX_NAMES = {};
for (const [dayIdx, exercises] of Object.entries(WK)) {
  for (const ex of exercises) {
    EX_NAMES[`${dayIdx}-${ex.id}`] = ex.nm;
  }
}

export default function ReviewTab({ st, startDate, maxWk }) {
  const safeMaxWk = Math.max(1, maxWk || 1);
  const safeStart = startDate || st.startDate || today();
  const [vw, setVw] = useState(safeMaxWk);
  const [expandedDay, setExpandedDay] = useState(null);
  const wkDates = weekDates(safeStart, vw);

  const wkWeights = st.weightLog.filter((e) => wkDates.includes(e.d));
  const wkCheckin = st.checkins[vw];
  const wkPhotos = st.photos[vw] || {};

  const mealsLogged = wkDates.reduce((a, dt) => {
    const mc = st.mealChecks[dt];
    if (!mc) return a;
    return a + Object.values(mc).filter(Boolean).length;
  }, 0);

  // Count days with at least one exercise
  const trainingDayCount = SPLIT.filter((s) => s.type === 'training').length;
  const daysWithLogs = wkDates.filter((dt) => {
    const el = st.exLogs[dt];
    return el && Object.keys(el).length > 0;
  }).length;

  return (
    <>
      {/* Week Selector */}
      <Card glow>
        <Label>REVIEW HISTORY</Label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <button onClick={() => { setVw(Math.max(1, vw - 1)); setExpandedDay(null); }} style={{ background: "rgba(56,145,255,0.1)", border: "1px solid rgba(56,145,255,0.2)", borderRadius: 8, padding: "8px 14px", color: S.bl, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>←</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, color: "#fff" }}>WEEK {vw}</div>
            <div style={{ fontSize: 10, color: S.dm }}>{wkDates[0]} — {wkDates[6]}</div>
          </div>
          <button onClick={() => { setVw(Math.min(safeMaxWk, vw + 1)); setExpandedDay(null); }} style={{ background: "rgba(56,145,255,0.1)", border: "1px solid rgba(56,145,255,0.2)", borderRadius: 8, padding: "8px 14px", color: S.bl, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>→</button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <Card style={{ flex: 1, textAlign: "center", padding: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: S.bl }}>{mealsLogged}</div>
          <div style={{ fontSize: 8, color: S.dm }}>MEALS LOGGED</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: S.gr }}>{daysWithLogs}/{trainingDayCount}</div>
          <div style={{ fontSize: 8, color: S.dm }}>DAYS TRAINED</div>
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

      {/* Workout Log — Weekly Split View */}
      <Card>
        <Label>WORKOUT LOG</Label>
        {wkDates.map((date, dayIdx) => {
          const split = SPLIT[dayIdx];
          const dayLogs = st.exLogs[date] || {};
          const exerciseKeys = Object.keys(dayLogs);
          const hasLogs = exerciseKeys.length > 0;
          const isOff = split.type === 'off';
          const isExpanded = expandedDay === dayIdx;
          const isFuture = date > today();

          return (
            <div key={dayIdx}>
              <button
                onClick={() => !isFuture && setExpandedDay(isExpanded ? null : dayIdx)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "8px 6px", marginBottom: 2,
                  borderRadius: 6, textAlign: "left",
                  cursor: isFuture ? "default" : "pointer",
                  background: isExpanded ? "rgba(56,145,255,0.06)" : "transparent",
                  border: isExpanded ? "1px solid rgba(56,145,255,0.15)" : "1px solid transparent",
                }}
              >
                {/* Icon */}
                <span style={{ fontSize: 16, flexShrink: 0 }}>{split.icon}</span>

                {/* Day + Session */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isExpanded ? S.bl : "#c8c4bb", flexShrink: 0 }}>
                      {split.day.slice(0, 3)}
                    </span>
                    <span style={{ fontSize: 10, color: S.dm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {split.session}
                    </span>
                  </div>
                  {isExpanded && hasLogs && (
                    <div style={{ fontSize: 9, color: S.dm, marginTop: 1 }}>
                      {exerciseKeys.length} exercise{exerciseKeys.length !== 1 ? 's' : ''} logged
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isFuture ? (
                    <span style={{ color: S.dr, fontSize: 10 }}>—</span>
                  ) : isOff ? (
                    <span style={{ fontSize: 8, color: S.dm, fontWeight: 700, letterSpacing: 0.5 }}>OFF</span>
                  ) : hasLogs ? (
                    <span style={{ color: S.gr, fontSize: 14, fontWeight: 900 }}>✓</span>
                  ) : (
                    <span style={{ color: S.rd, fontSize: 13, fontWeight: 900 }}>✕</span>
                  )}
                </div>

                {/* Expand chevron */}
                {!isOff && !isFuture && (
                  <span style={{ fontSize: 9, color: S.dm, flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                    ▼
                  </span>
                )}
              </button>

              {/* Expanded exercise details */}
              {isExpanded && (
                <div style={{ padding: "2px 8px 10px 34px" }}>
                  {!hasLogs && !isOff && (
                    <div style={{ fontSize: 11, color: S.dm, fontStyle: "italic", padding: "4px 0" }}>
                      No exercises logged
                    </div>
                  )}
                  {isOff && (
                    <div style={{ fontSize: 11, color: S.dm, padding: "4px 0" }}>
                      Recovery day — {split.sub}
                    </div>
                  )}
                  {exerciseKeys.map((key) => {
                    const sets = dayLogs[key];
                    const exName = EX_NAMES[key] || key;
                    const setArr = Object.values(sets).filter(Boolean);
                    return (
                      <div key={key} style={{ marginBottom: 6, padding: "4px 0", borderBottom: `1px solid ${S.bd}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#c8c4bb" }}>{exName}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                          {setArr.map((s, si) => (
                            <span key={si} style={{
                              fontSize: 10, color: S.gr,
                              background: "rgba(0,212,170,0.06)",
                              padding: "2px 6px", borderRadius: 4,
                            }}>
                              {s.w && `${s.w}lb × `}{s.r}r
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </Card>

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
                onClick={() => { setVw(w); setExpandedDay(null); }}
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
