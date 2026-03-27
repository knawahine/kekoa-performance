import { useState, useEffect, useMemo } from 'react';
import { S } from './lib/styles';
import { today, loadState, saveState, getPhase, getPhaseKey } from './lib/helpers';
import { calcMacros } from './lib/macros';
import { SPLIT } from './data/workouts';
import { TM, OM, TGT } from './data/meals';
import { SUPPS } from './data/supplements';
import TodayTab from './components/TodayTab';
import MealsTab from './components/MealsTab';
import TrainingTab from './components/TrainingTab';
import RehabTab from './components/RehabTab';
import ProgressTab from './components/ProgressTab';
import ReviewTab from './components/ReviewTab';

export default function App() {
  const [tab, setTab] = useState("today");
  const [st, setSt] = useState(() => loadState() || {
    startDate: today(),
    weight: 220,
    weightLog: [],
    mealChecks: {},
    suppChecks: {},
    exLogs: {},
    mealOverrides: {},
    calfPhase: 2,
    sledStage: 0,
    checkins: {},
    rehabChecks: {},
    photos: {},
    mode: "cut",
    programs: [{ name: "12-Week Performance Cut", start: today(), weeks: 12, active: true }],
  });

  useEffect(() => { saveState(st); }, [st]);

  const d = today();
  const dow = new Date().getDay();
  const si = dow === 0 ? 6 : dow - 1;
  const activeProg = st.programs?.find((p) => p.active) || st.programs?.[0] || { start: st.startDate || today(), weeks: 12, name: "12-Week Performance Cut" };
  const isCut = st.mode === "cut";
  const cw = Math.max(1, Math.floor((new Date() - new Date(activeProg.start)) / 604800000) + 1);
  const cappedWk = isCut ? Math.min(cw, activeProg.weeks || 12) : cw;
  const totalWks = isCut ? (activeProg.weeks || 12) : cw;
  const split = SPLIT[si];
  const isTr = split.type === "training";
  const ph = getPhase(Math.min(cappedWk, 12));
  const pk = getPhaseKey(Math.min(cappedWk, 12));
  const tgt = isTr ? TGT.tr : TGT.off;

  const baseMeals = isTr ? TM : OM;
  const meals = useMemo(() => {
    const ov = st.mealOverrides[d];
    if (!ov) return baseMeals;
    return baseMeals.map((m) => {
      const mo = ov[m.id];
      if (!mo) return m;
      return { ...m, foods: mo };
    });
  }, [baseMeals, st.mealOverrides, d]);

  const mc = st.mealChecks[d] || {};
  const sc = st.suppChecks[d] || {};

  const consumed = meals.reduce((a, m) => {
    if (!mc[m.id]) return a;
    m.foods.forEach((f) => {
      const x = calcMacros(f.n, f.g);
      a.p += x.p;
      a.c += x.c;
      a.f += x.f;
      a.cal += x.cal;
    });
    return a;
  }, { p: 0, c: 0, f: 0, cal: 0 });

  const tMeal = (id) => setSt((s) => ({ ...s, mealChecks: { ...s.mealChecks, [d]: { ...mc, [id]: !mc[id] } } }));
  const tSupp = (i) => setSt((s) => ({ ...s, suppChecks: { ...s.suppChecks, [d]: { ...sc, [i]: !sc[i] } } }));
  const mH = meals.filter((m) => mc[m.id]).length;
  const sH = SUPPS.filter((_, i) => sc[i]).length;
  const score = Math.round((mH / meals.length) * 70 + (sH / SUPPS.length) * 30);
  const setMF = (mid, foods) => setSt((s) => ({ ...s, mealOverrides: { ...s.mealOverrides, [d]: { ...s.mealOverrides[d], [mid]: foods } } }));
  const logEx = (day, eid, si2, data) => setSt((s) => ({ ...s, exLogs: { ...s.exLogs, [d]: { ...s.exLogs[d], [`${day}-${eid}`]: { ...s.exLogs[d]?.[`${day}-${eid}`], [si2]: data } } } }));

  const startNew = (name, weeks) => {
    const newProg = { name, start: today(), weeks: parseInt(weeks) || 0, active: true };
    setSt((s) => ({ ...s, mode: weeks > 0 ? "cut" : "maintenance", programs: (s.programs || []).map((p) => ({ ...p, active: false })).concat(newProg) }));
  };
  const goMaintenance = () => setSt((s) => ({ ...s, mode: "maintenance" }));

  const tabs = [
    { id: "today", l: "Today", i: "📋" },
    { id: "meals", l: "Meals", i: "🍽️" },
    { id: "training", l: "Training", i: "🏋️" },
    { id: "rehab", l: "Rehab", i: "🦵" },
    { id: "progress", l: "Progress", i: "📊" },
    { id: "review", l: "Review", i: "📖" },
  ];

  return (
    <div style={{ fontFamily: "'Barlow',system-ui,sans-serif", background: S.bg, color: S.tx, minHeight: "100vh", minHeight: "100dvh", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0d1520,#1a2744)", padding: "18px 18px 14px", borderBottom: "1px solid rgba(56,145,255,0.12)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: isCut ? S.bl : S.gr }}>{isCut ? "PERFORMANCE CUT" : "MAINTENANCE"}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 24, fontWeight: 800, color: "#fff" }}>KEKOA</div>
            {activeProg.name && <div style={{ fontSize: 10, color: S.dm }}>{activeProg.name}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: isCut ? S.bl : S.gr, fontFamily: "'Barlow Condensed'", lineHeight: 1 }}>WK {cappedWk}</div>
            <div style={{ fontSize: 10, color: S.dm }}>{isCut ? `of ${totalWks}` : "ongoing"}</div>
          </div>
        </div>
        {isCut && (
          <div style={{ marginTop: 10, height: 3, background: "#1a2744", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${Math.min(100, (cappedWk / totalWks) * 100)}%`, background: `linear-gradient(90deg,${S.bl},${S.gr})`, borderRadius: 2 }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 14px 0" }}>
        {tab === "today" && <TodayTab {...{ meals, mc, sc, tMeal, tSupp, consumed, tgt, split, isTr, score, mH, sH, cappedWk, isCut, goMaintenance, startNew, totalWks, st }} />}
        {tab === "meals" && <MealsTab {...{ meals, tgt, mc, tMeal, isTr, setMF, baseMeals }} />}
        {tab === "training" && <TrainingTab {...{ si, pk, ph, cw: cappedWk, exLogs: st.exLogs[d] || {}, logEx }} />}
        {tab === "rehab" && <RehabTab {...{ cp: st.calfPhase, ss: st.sledStage, rehabChecks: st.rehabChecks, setSt, d }} />}
        {tab === "progress" && <ProgressTab {...{ st, setSt, cw: cappedWk, d, isCut, totalWks }} />}
        {tab === "review" && <ReviewTab st={st} startDate={activeProg.start} maxWk={cappedWk} />}
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "rgba(10,14,23,0.96)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(56,145,255,0.1)",
        display: "flex", justifyContent: "space-around",
        padding: "7px 0 calc(12px + env(safe-area-inset-bottom, 0px))",
        zIndex: 100,
      }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none",
              color: tab === t.id ? S.bl : "#4a5568",
              fontSize: 9, fontWeight: 700, fontFamily: "'Barlow'",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 1, padding: "3px 6px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: 17 }}>{t.i}</span>
            <span>{t.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
