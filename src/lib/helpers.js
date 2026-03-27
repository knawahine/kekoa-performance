export const LS_KEY = "kekoa-v4";

export const today = () => new Date().toISOString().slice(0, 10);

export const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY));
  } catch {
    return null;
  }
};

export const saveState = (s) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
};

export const getPhase = (w) => (w <= 4 ? 1 : w <= 8 ? 2 : 3);
export const getPhaseKey = (w) => (getPhase(w) === 1 ? "p1" : getPhase(w) === 2 ? "p2" : "p3");

export function dateToWeek(startDate, dateStr) {
  return Math.max(1, Math.floor((new Date(dateStr) - new Date(startDate)) / 604800000) + 1);
}

/**
 * Load all user data from Supabase and reconstruct the app state shape
 */
export async function loadRemoteState(supabase, userId) {
  const [
    { data: profile },
    { data: programs },
    { data: dailyLogs },
    { data: exerciseLogs },
    { data: mealOverrides },
    { data: checkins },
    { data: rehabChecks },
    { data: photos },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('programs').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('daily_logs').select('*').eq('user_id', userId),
    supabase.from('exercise_logs').select('*').eq('user_id', userId),
    supabase.from('meal_overrides').select('*').eq('user_id', userId),
    supabase.from('checkins').select('*').eq('user_id', userId),
    supabase.from('rehab_checks').select('*').eq('user_id', userId),
    supabase.from('photos').select('*').eq('user_id', userId),
  ]);

  if (!profile) return null; // No remote data

  return {
    startDate: profile.start_date,
    weight: profile.weight,
    mode: profile.mode || 'cut',
    calfPhase: profile.calf_phase ?? 2,
    sledStage: profile.sled_stage ?? 0,
    programs: (programs || []).map((p) => ({
      name: p.name,
      start: p.start_date,
      weeks: p.weeks,
      active: p.active,
    })),
    weightLog: (dailyLogs || [])
      .filter((d) => d.weight != null)
      .map((d) => ({ d: d.date, w: d.weight })),
    mealChecks: Object.fromEntries(
      (dailyLogs || []).map((d) => [d.date, d.meal_checks || {}])
    ),
    suppChecks: Object.fromEntries(
      (dailyLogs || []).map((d) => [d.date, d.supp_checks || {}])
    ),
    exLogs: (exerciseLogs || []).reduce((acc, e) => {
      if (!acc[e.date]) acc[e.date] = {};
      acc[e.date][e.exercise_key] = e.sets;
      return acc;
    }, {}),
    mealOverrides: (mealOverrides || []).reduce((acc, m) => {
      if (!acc[m.date]) acc[m.date] = {};
      acc[m.date][m.meal_id] = m.foods;
      return acc;
    }, {}),
    checkins: Object.fromEntries(
      (checkins || []).map((c) => [c.week_num, c.data])
    ),
    rehabChecks: Object.fromEntries(
      (rehabChecks || []).map((r) => [r.date, r.checks])
    ),
    photos: (photos || []).reduce((acc, p) => {
      if (!acc[p.week_num]) acc[p.week_num] = {};
      acc[p.week_num][p.angle] = p.url;
      return acc;
    }, {}),
  };
}

export function weekDates(startDate, weekNum) {
  try {
    const s = new Date(startDate || today());
    if (isNaN(s.getTime())) return Array(7).fill(today());
    s.setDate(s.getDate() + ((weekNum || 1) - 1) * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  } catch {
    return Array(7).fill(today());
  }
}
