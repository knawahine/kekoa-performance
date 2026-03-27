import { supabase } from './supabase';

const QUEUE_KEY = 'kekoa-sync-queue';

// Maps state keys to their Supabase table
const TABLE_MAP = {
  profiles: ['weight', 'mode', 'calfPhase', 'sledStage'],
  daily_logs: ['mealChecks', 'suppChecks', 'weightLog'],
  exercise_logs: ['exLogs'],
  meal_overrides: ['mealOverrides'],
  checkins: ['checkins'],
  rehab_checks: ['rehabChecks'],
  programs: ['programs'],
};

/**
 * Compare two state objects and return which tables need syncing
 */
export function diffState(prev, next) {
  if (!prev || !next) return [];
  const changed = [];
  for (const [table, keys] of Object.entries(TABLE_MAP)) {
    if (keys.some((k) => prev[k] !== next[k])) {
      changed.push(table);
    }
  }
  return changed;
}

/**
 * Create a sync engine bound to a specific user
 */
export function createSyncEngine(userId) {
  const timers = new Map();

  // ── Per-table sync functions ──────────────────────────────

  async function syncProfiles(state) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      start_date: state.startDate,
      weight: state.weight,
      mode: state.mode,
      calf_phase: state.calfPhase,
      sled_stage: state.sledStage,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async function syncPrograms(state) {
    // Delete all existing and reinsert (array is small)
    await supabase.from('programs').delete().eq('user_id', userId);
    const rows = (state.programs || []).map((p) => ({
      user_id: userId,
      name: p.name,
      start_date: p.start,
      weeks: p.weeks,
      active: p.active,
    }));
    if (rows.length) {
      const { error } = await supabase.from('programs').insert(rows);
      if (error) throw error;
    }
  }

  async function syncDailyLogs(state) {
    // Collect all unique dates from mealChecks, suppChecks, weightLog
    const dates = new Set();
    if (state.mealChecks) Object.keys(state.mealChecks).forEach((d) => dates.add(d));
    if (state.suppChecks) Object.keys(state.suppChecks).forEach((d) => dates.add(d));
    if (state.weightLog) state.weightLog.forEach((e) => dates.add(e.d));

    const rows = [...dates].map((date) => {
      const weightEntry = state.weightLog?.find((e) => e.d === date);
      return {
        user_id: userId,
        date,
        weight: weightEntry?.w ?? null,
        meal_checks: state.mealChecks?.[date] || {},
        supp_checks: state.suppChecks?.[date] || {},
        updated_at: new Date().toISOString(),
      };
    });

    if (rows.length) {
      const { error } = await supabase
        .from('daily_logs')
        .upsert(rows, { onConflict: 'user_id,date' });
      if (error) throw error;
    }
  }

  async function syncExerciseLogs(state) {
    if (!state.exLogs) return;
    const rows = [];
    for (const [date, exercises] of Object.entries(state.exLogs)) {
      for (const [exerciseKey, sets] of Object.entries(exercises)) {
        rows.push({
          user_id: userId,
          date,
          exercise_key: exerciseKey,
          sets,
          updated_at: new Date().toISOString(),
        });
      }
    }
    if (rows.length) {
      const { error } = await supabase
        .from('exercise_logs')
        .upsert(rows, { onConflict: 'user_id,date,exercise_key' });
      if (error) throw error;
    }
  }

  async function syncMealOverrides(state) {
    if (!state.mealOverrides) return;
    const rows = [];
    for (const [date, meals] of Object.entries(state.mealOverrides)) {
      for (const [mealId, foods] of Object.entries(meals)) {
        rows.push({
          user_id: userId,
          date,
          meal_id: mealId,
          foods,
          updated_at: new Date().toISOString(),
        });
      }
    }
    if (rows.length) {
      const { error } = await supabase
        .from('meal_overrides')
        .upsert(rows, { onConflict: 'user_id,date,meal_id' });
      if (error) throw error;
    }
  }

  async function syncCheckins(state) {
    if (!state.checkins) return;
    const rows = Object.entries(state.checkins).map(([weekNum, data]) => ({
      user_id: userId,
      week_num: parseInt(weekNum),
      data,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length) {
      const { error } = await supabase
        .from('checkins')
        .upsert(rows, { onConflict: 'user_id,week_num' });
      if (error) throw error;
    }
  }

  async function syncRehabChecks(state) {
    if (!state.rehabChecks) return;
    const rows = Object.entries(state.rehabChecks).map(([date, checks]) => ({
      user_id: userId,
      date,
      checks,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length) {
      const { error } = await supabase
        .from('rehab_checks')
        .upsert(rows, { onConflict: 'user_id,date' });
      if (error) throw error;
    }
  }

  // ── Dispatcher ────────────────────────────────────────────

  const syncFns = {
    profiles: syncProfiles,
    programs: syncPrograms,
    daily_logs: syncDailyLogs,
    exercise_logs: syncExerciseLogs,
    meal_overrides: syncMealOverrides,
    checkins: syncCheckins,
    rehab_checks: syncRehabChecks,
  };

  async function sync(table, state) {
    try {
      await syncFns[table](state);
    } catch (err) {
      console.warn(`[sync] ${table} failed:`, err.message);
      if (!navigator.onLine) {
        enqueue({ table, timestamp: Date.now() });
      }
    }
  }

  function debouncedSync(table, state) {
    if (timers.has(table)) clearTimeout(timers.get(table));
    timers.set(
      table,
      setTimeout(() => {
        timers.delete(table);
        sync(table, state);
      }, 300)
    );
  }

  function flush(state) {
    for (const [table, timer] of timers.entries()) {
      clearTimeout(timer);
      timers.delete(table);
      sync(table, state);
    }
  }

  // ── Offline Queue ─────────────────────────────────────────

  function enqueue(op) {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      queue.push(op);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  }

  async function retryQueue(state) {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (!queue.length) return;
      const remaining = [];
      for (const op of queue) {
        try {
          await syncFns[op.table](state);
        } catch {
          remaining.push(op);
        }
      }
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } catch {}
  }

  return { sync, debouncedSync, flush, retryQueue };
}
