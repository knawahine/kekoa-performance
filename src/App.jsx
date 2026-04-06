import { useState, useEffect, useMemo, useRef } from 'react';
import { S } from './lib/styles';
import { today, loadState, saveState, getPhase, getPhaseKey, loadRemoteState } from './lib/helpers';
import { calcMacros } from './lib/macros';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { createSyncEngine, diffState } from './lib/sync';
import { compressImage, uploadPhoto } from './lib/photos';
import { migrateLocalToSupabase, isMigrated } from './lib/migrate';
import { calcStreaks, calcWeeklyConsistency, updatePersonalBests } from './lib/streaks';
import { SPLIT } from './data/workouts';
import { TM, OM, TGT } from './data/meals';
import { SUPPS } from './data/supplements';
import TodayTab from './components/TodayTab';
import MealsTab from './components/MealsTab';
import TrainingTab from './components/TrainingTab';
import RehabTab from './components/RehabTab';
import ProgressTab from './components/ProgressTab';
import ReviewTab from './components/ReviewTab';

// ── Supabase Sync Hook ──────────────────────────────────────
function useSupabaseSync(st) {
  const { user } = useAuth();
  const prevRef = useRef(st);
  const engineRef = useRef(null);

  // Initialize engine when user changes
  useEffect(() => {
    if (user) {
      engineRef.current = createSyncEngine(user.id);
      engineRef.current.retryQueue(st);
    }
    return () => {
      if (engineRef.current) engineRef.current.flush(st);
    };
  }, [user]);

  // Watch for state changes and sync
  useEffect(() => {
    if (!user || !engineRef.current) return;
    const prev = prevRef.current;
    prevRef.current = st;

    const changedTables = diffState(prev, st);
    for (const table of changedTables) {
      engineRef.current.debouncedSync(table, st);
    }
  }, [st, user]);

  // Flush on page unload
  useEffect(() => {
    const handleUnload = () => engineRef.current?.flush(st);
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [st]);

  // Retry queue on reconnect
  useEffect(() => {
    const handleOnline = () => {
      if (engineRef.current) engineRef.current.retryQueue(st);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [st]);
}

// ── Main App ─────────────────────────────────────────────────
export default function App({ initialOnboardState }) {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState("today");

  const defaultState = {
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
  };

  const [st, setSt] = useState(() => {
    // If coming from onboarding, use that state
    if (initialOnboardState) return initialOnboardState;
    // Otherwise load from localStorage or use defaults
    return loadState() || defaultState;
  });
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Save to localStorage on every change (existing behavior)
  useEffect(() => { saveState(st); }, [st]);

  // Sync to Supabase
  useSupabaseSync(st);

  // Load remote state on first auth
  useEffect(() => {
    if (!user || remoteLoaded) return;
    loadRemoteState(supabase, user.id)
      .then(async (remote) => {
        if (remote) {
          // Remote data exists — use it
          setSt((prev) => ({ ...prev, ...remote }));
        } else if (loadState() && !isMigrated()) {
          // No remote data but local data exists — migrate
          setMigrating(true);
          try {
            await migrateLocalToSupabase(user.id, loadState());
          } catch (err) {
            console.error('[migration] Failed:', err);
          }
          setMigrating(false);
        }
        setRemoteLoaded(true);
      })
      .catch((err) => {
        console.warn('[remote-load] Failed:', err.message);
        setRemoteLoaded(true);
      });
  }, [user, remoteLoaded]);

  // ── Photo upload handler (compress → Supabase Storage) ─────
  const handlePhotoUpload = async (weekNum, angle, file) => {
    try {
      const blob = await compressImage(file);
      const url = await uploadPhoto(user.id, weekNum, angle, blob);
      setSt((s) => ({ ...s, photos: { ...s.photos, [weekNum]: { ...(s.photos[weekNum] || {}), [angle]: url } } }));
    } catch (err) {
      console.error('Photo upload failed, falling back to base64:', err);
      // Fallback to base64 localStorage
      const reader = new FileReader();
      reader.onload = (ev) => setSt((s) => ({ ...s, photos: { ...s.photos, [weekNum]: { ...(s.photos[weekNum] || {}), [angle]: ev.target.result } } }));
      reader.readAsDataURL(file);
    }
  };

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
  const goMaintenance = () => {
    setSt((s) => ({
      ...s,
      mode: "maintenance",
      programs: (s.programs || []).map((p) =>
        p.active ? { ...p, paused: true } : p
      ),
    }));
  };

  const resumeProgram = () => {
    setSt((s) => ({
      ...s,
      mode: "cut",
      programs: (s.programs || []).map((p) =>
        p.active ? { ...p, paused: false } : p
      ),
    }));
  };

  // Find a resumable program: active with weeks > 0 while in maintenance
  // (supports both new paused flag AND legacy programs that were paused before the flag existed)
  const pausedProg = st.mode === "maintenance"
    ? (st.programs || []).find((p) => p.active && p.weeks > 0)
    : null;

  const updateStartDate = (newDate) => {
    if (!newDate) return;
    setSt((s) => ({
      ...s,
      startDate: newDate,
      programs: (s.programs || []).map((p) =>
        p.active ? { ...p, start: newDate } : p
      ),
    }));
  };

  // ── Gamification: Streaks, Consistency, Personal Bests ─────
  const streaks = useMemo(() => calcStreaks(st), [st.mealChecks, st.exLogs, st.suppChecks, st.streakFreezes]);
  const weeklyConsistency = useMemo(() => calcWeeklyConsistency(st, 8), [st.mealChecks, st.exLogs, st.suppChecks]);

  // Update personal bests whenever streaks change
  useEffect(() => {
    const newBests = updatePersonalBests(streaks, st.personalBests);
    const changed = Object.keys(newBests).some((k) => newBests[k] !== (st.personalBests || {})[k]);
    if (changed) {
      setSt((s) => ({ ...s, personalBests: newBests }));
    }
  }, [streaks]);

  const toggleStreakFreeze = () => {
    setSt((s) => ({
      ...s,
      streakFreezes: {
        ...(s.streakFreezes || {}),
        [cappedWk]: !(s.streakFreezes || {})[cappedWk],
      },
    }));
  };

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

      {/* Migration Overlay */}
      {migrating && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,14,23,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>☁️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Barlow Condensed'" }}>Migrating to cloud...</div>
            <div style={{ fontSize: 12, color: S.dm, marginTop: 8 }}>This only happens once</div>
          </div>
        </div>
      )}

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
            <button
              onClick={signOut}
              style={{
                background: "none", border: "none", color: S.dm, fontSize: 9,
                cursor: "pointer", padding: "2px 0", marginTop: 2,
                fontFamily: "'Barlow'", fontWeight: 600, letterSpacing: 0.5,
              }}
            >
              Sign Out
            </button>
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
        {tab === "today" && <TodayTab {...{ meals, mc, sc, tMeal, tSupp, consumed, tgt, split, isTr, score, mH, sH, cappedWk, isCut, goMaintenance, resumeProgram, pausedProg, startNew, totalWks, st, streaks, personalBests: st.personalBests, onToggleFreeze: toggleStreakFreeze, onUpdateStartDate: updateStartDate, activeProgramStart: activeProg.start }} />}
        {tab === "meals" && <MealsTab {...{ meals, tgt, mc, tMeal, isTr, setMF, baseMeals }} />}
        {tab === "training" && <TrainingTab {...{ si, pk, ph, cw: cappedWk, exLogs: st.exLogs[d] || {}, logEx, allExLogs: st.exLogs, todayStr: d }} />}
        {tab === "rehab" && <RehabTab {...{ cp: st.calfPhase, ss: st.sledStage, rehabChecks: st.rehabChecks, setSt, d }} />}
        {tab === "progress" && <ProgressTab {...{ st, setSt, cw: cappedWk, d, isCut, totalWks, onPhotoUpload: handlePhotoUpload, weeklyConsistency, personalBests: st.personalBests }} />}
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
