import { useState, useRef, useMemo } from 'react';
import { S } from '../lib/styles';
import { CK_FIELDS } from '../data/rehab';
import Card from './shared/Card';
import Label from './shared/Label';
import WeeklyConsistencyChart from './WeeklyConsistencyChart';

export default function ProgressTab({ st, setSt, cw, d, isCut, totalWks, onPhotoUpload, weeklyConsistency, personalBests }) {
  const [wIn, setWIn] = useState("");
  const fR = useRef();
  const [pT, setPT] = useState("front");

  // ── Auto-populate check-in form ──────────────────────
  const prevCheckin = st.checkins[cw - 1] || {};

  // Auto-calculate weeksLeft
  const autoWeeksLeft = isCut ? String(Math.max(0, totalWks - cw)) : "N/A";

  // Auto-calculate weightChange: current weight vs previous week's weight
  const autoWeightChange = useMemo(() => {
    const thisWeekWeight = st.weight;
    // Find a weight entry from roughly last week (5+ days ago)
    const prevWeekWeightEntry = [...(st.weightLog || [])]
      .sort((a, b) => b.d.localeCompare(a.d))
      .find((e) => {
        const daysAgo = (new Date() - new Date(e.d)) / 86400000;
        return daysAgo >= 5;
      });

    if (prevWeekWeightEntry && thisWeekWeight) {
      const diff = thisWeekWeight - prevWeekWeightEntry.w;
      const sign = diff >= 0 ? "+" : "";
      return `${sign}${diff.toFixed(1)} lbs`;
    }
    return "";
  }, [st.weight, st.weightLog]);

  // Build initial form: saved data > auto-calculated > previous week's data
  const [form, setForm] = useState(() => {
    const existing = st.checkins[cw];
    if (existing) return existing;

    const prefilled = {};
    for (const field of CK_FIELDS) {
      if (field.k === "weeksLeft") {
        prefilled[field.k] = autoWeeksLeft;
      } else if (field.k === "weightChange") {
        prefilled[field.k] = autoWeightChange;
      } else if (prevCheckin[field.k]) {
        prefilled[field.k] = prevCheckin[field.k];
      }
    }
    return prefilled;
  });
  const [saved, setSaved] = useState(!!st.checkins[cw]);

  const logW = () => {
    const w = parseFloat(wIn);
    if (!w) return;
    setSt((s) => ({ ...s, weight: w, weightLog: [...s.weightLog.filter((e) => e.d !== d), { d, w }] }));
    setWIn("");
  };

  const sorted = [...st.weightLog].sort((a, b) => a.d.localeCompare(b.d)).slice(-7);
  const photos = st.photos[cw] || {};

  const handleP = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (onPhotoUpload) {
      onPhotoUpload(cw, pT, f);
    } else {
      const r = new FileReader();
      r.onload = (ev) => setSt((s) => ({ ...s, photos: { ...s.photos, [cw]: { ...photos, [pT]: ev.target.result } } }));
      r.readAsDataURL(f);
    }
  };

  // Show "AUTO" tag for fields that were auto-populated (not yet saved by user)
  const isAuto = (key) => {
    if (st.checkins[cw]?.[key]) return false;
    if (key === "weeksLeft" || key === "weightChange") return !!form[key];
    return !!prevCheckin[key] && form[key] === prevCheckin[key];
  };

  return (
    <>
      {/* Quick Stats */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[
          { l: "WEIGHT", v: st.weight, u: "lbs", c: S.bl },
          { l: "WEEK", v: cw, u: isCut ? `/${totalWks}` : "", c: S.gr },
          { l: "TARGET", v: "<10", u: "% BF", c: S.am },
        ].map((s) => (
          <Card key={s.l} style={{ flex: 1, textAlign: "center", padding: 10 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: S.dm, marginTop: 2 }}>{s.u}</div>
            <div style={{ fontSize: 8, color: S.dr }}>{s.l}</div>
          </Card>
        ))}
      </div>

      {/* Weigh-In */}
      <Card>
        <Label>WEIGH-IN</Label>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="number"
            placeholder={`Current: ${st.weight}`}
            value={wIn}
            onChange={(e) => setWIn(e.target.value)}
            style={{ flex: 1, background: "#1a2744", border: "1px solid rgba(56,145,255,0.15)", borderRadius: 6, padding: "8px 10px", color: S.tx, fontSize: 13, outline: "none", minWidth: 0 }}
          />
          <button onClick={logW} style={{ background: S.bl, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>LOG</button>
        </div>
      </Card>

      {/* Weight Trend */}
      {sorted.length > 1 && (
        <Card>
          <Label>WEIGHT TREND</Label>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
            {sorted.map((e, i) => {
              const mn = Math.min(...sorted.map((x) => x.w));
              const mx = Math.max(...sorted.map((x) => x.w));
              const r = mx - mn || 3;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: S.bl }}>{e.w}</div>
                  <div style={{ width: "100%", height: `${Math.max(10, ((e.w - mn) / r) * 100)}%`, background: `linear-gradient(180deg,${S.bl},#1a5fb4)`, borderRadius: "3px 3px 0 0", minHeight: 6 }} />
                  <div style={{ fontSize: 8, color: S.dm }}>{e.d.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Weekly Consistency */}
      <WeeklyConsistencyChart weeklyData={weeklyConsistency} personalBests={personalBests} />

      {/* Weekly Check-In */}
      <Card>
        <Label>WEEK {cw} CHECK-IN</Label>
        {!saved && Object.keys(prevCheckin).length > 0 && (
          <div style={{ fontSize: 9, color: S.dm, marginBottom: 8, padding: "4px 8px", background: "rgba(56,145,255,0.04)", borderRadius: 4 }}>
            Pre-filled from Week {cw - 1}. Edit any field to update.
          </div>
        )}
        {CK_FIELDS.map((f) => (
          <div key={f.k} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.dm, letterSpacing: 0.5 }}>{f.l}</div>
              {!saved && isAuto(f.k) && (
                <span style={{ fontSize: 7, color: S.bl, fontWeight: 600, letterSpacing: 0.5 }}>AUTO</span>
              )}
            </div>
            {saved ? (
              <div style={{ fontSize: 12, color: "#c8c4bb", padding: "6px 8px", background: "rgba(0,212,170,0.04)", borderRadius: 6, minHeight: 20 }}>{form[f.k] || "—"}</div>
            ) : (
              <input
                type={f.t === "number" ? "number" : "text"}
                value={form[f.k] || ""}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                placeholder={
                  f.k === "weeksLeft" ? (isCut ? `${Math.max(0, totalWks - cw)} weeks` : "N/A") :
                  f.k === "weightChange" ? "e.g. -1.5 lbs" :
                  undefined
                }
                style={{
                  width: "100%", background: "#1a2744",
                  border: `1px solid ${isAuto(f.k) ? "rgba(56,145,255,0.2)" : "rgba(56,145,255,0.12)"}`,
                  borderRadius: 6, padding: "8px 10px",
                  color: isAuto(f.k) ? "rgba(232,230,225,0.6)" : S.tx,
                  fontSize: 12, outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  if (isAuto(f.k)) e.target.select();
                }}
              />
            )}
          </div>
        ))}
        {!saved && (
          <button
            onClick={() => { setSt((s) => ({ ...s, checkins: { ...s.checkins, [cw]: form } })); setSaved(true); }}
            style={{ width: "100%", background: S.bl, color: "#fff", border: "none", borderRadius: 6, padding: "10px 0", fontWeight: 700, fontSize: 12, cursor: "pointer", marginTop: 4 }}
          >
            SAVE CHECK-IN
          </button>
        )}
        {saved && (
          <button
            onClick={() => setSaved(false)}
            style={{ width: "100%", background: "rgba(56,145,255,0.08)", border: "1px solid rgba(56,145,255,0.2)", color: S.bl, borderRadius: 6, padding: "8px 0", fontWeight: 700, fontSize: 11, cursor: "pointer", marginTop: 4 }}
          >
            EDIT CHECK-IN
          </button>
        )}
      </Card>

      {/* Progress Photos */}
      <Card>
        <Label color={S.gr}>WEEK {cw} PROGRESS PHOTOS</Label>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {["front", "side", "back"].map((t) => (
            <button
              key={t}
              onClick={() => { setPT(t); fR.current?.click(); }}
              style={{
                flex: 1, background: photos[t] ? "rgba(0,212,170,0.06)" : "#1a2744",
                border: `1px solid ${photos[t] ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.05)"}`,
                borderRadius: 8, padding: photos[t] ? "0" : "20px 8px", cursor: "pointer", overflow: "hidden",
                textAlign: "center", aspectRatio: "3/4", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}
            >
              {photos[t] ? (
                <img src={photos[t]} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} alt={t} />
              ) : (
                <>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📷</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: S.dm, textTransform: "uppercase", letterSpacing: 1 }}>{t}</div>
                </>
              )}
            </button>
          ))}
        </div>
        <input ref={fR} type="file" accept="image/*" onChange={handleP} style={{ display: "none" }} />
      </Card>
    </>
  );
}
