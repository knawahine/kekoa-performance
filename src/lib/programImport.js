// Program import: read a PDF, send it to the parse-program Edge Function,
// convert the parsed JSON into the in-memory shapes the app's tabs expect,
// and persist the result to Supabase.

import { supabase } from './supabase';
import { today } from './helpers';
import { FDB } from '../data/foods';

// ── PDF → base64 ─────────────────────────────────────────────
export function readPdfAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || '';
      // result is "data:application/pdf;base64,XXXX" — strip the prefix.
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to read PDF file.'));
    reader.readAsDataURL(file);
  });
}

// ── Load the user's saved custom foods ───────────────────────
export async function fetchUserFoods(userId) {
  const { data, error } = await supabase
    .from('user_foods')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.warn('[import] fetchUserFoods failed:', error.message);
    return {};
  }
  return userFoodsToMap(data || []);
}

// Convert user_foods rows into an FDB-style map keyed by name.
export function userFoodsToMap(rows) {
  const map = {};
  for (const r of rows) {
    map[r.name] = {
      p: r.protein_per_100g ?? 0,
      c: r.carbs_per_100g ?? 0,
      f: r.fat_per_100g ?? 0,
      cal: r.cal_per_100g ?? 0,
    };
  }
  return map;
}

// ── Call the Edge Function ───────────────────────────────────
export async function parseProgramPdf(file, userId) {
  const pdfBase64 = await readPdfAsBase64(file);
  const userFoodMap = userId ? await fetchUserFoods(userId) : {};
  const knownFoods = [
    ...Object.keys(FDB),
    ...Object.keys(userFoodMap),
  ];

  const { data, error } = await supabase.functions.invoke('parse-program', {
    body: { pdfBase64, knownFoods },
  });

  if (error) {
    // supabase-js wraps non-2xx responses; surface any server message.
    let detail = error.message || 'Edge Function call failed.';
    try {
      const ctx = await error.context?.json?.();
      if (ctx?.error) detail = ctx.error;
      if (ctx?.raw) console.warn('[import] raw model output:', ctx.raw);
      if (ctx?.detail) console.warn('[import] server detail:', ctx.detail);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  if (data?.error) {
    throw new Error(data.error + (data.raw ? '' : ''));
  }
  return data;
}

// ── Shape conversion: parsed JSON → app in-memory shapes ─────

// Map a parsed split into SPLIT (day metadata) and WK (exercises by index).
// Returns { split: [...7], wk: {0..6: [...]} } or nulls if absent.
export function splitToAppShape(training_split) {
  if (!Array.isArray(training_split)) return { split: null, wk: null };
  const split = [];
  const wk = {};
  training_split.forEach((d, i) => {
    split.push({
      day: d.day || '',
      session: d.session_name || '',
      sub: d.subtitle || '',
      type: d.type === 'off' ? 'off' : 'training',
      icon: d.type === 'off' ? '😴' : '🏋️',
      cardio: d.cardio || '',
    });
    const exs = Array.isArray(d.exercises) ? d.exercises : [];
    wk[i] = exs.map((e, j) => ({
      id: `ex${i}-${j}`,
      nm: e.name || '',
      st: e.sets != null ? String(e.sets) : '',
      // The app's UI shows reps per phase (p1/p2/p3); imported programs have a
      // single reps value, so mirror it across all three phases.
      rp: { p1: e.reps || '', p2: e.reps || '', p3: e.reps || '' },
      rs: e.rest || '',
      prog: e.progression || '',
      note: e.notes || '',
    }));
  });
  return { split, wk };
}

// Map a parsed meal list into the app meal shape ({id,nm,tm,foods:[{n,g}]}).
function mealsToAppShape(list, prefix) {
  if (!Array.isArray(list)) return null;
  return list.map((m, i) => ({
    id: `${prefix}${i + 1}`,
    nm: m.name || `Meal ${i + 1}`,
    tm: m.time || '',
    foods: (Array.isArray(m.foods) ? m.foods : []).map((f) => ({
      n: f.name || '',
      g: Number(f.grams) || 0,
    })),
  }));
}

// Convert macro_targets {training:{cal,p,c,f}, off:{...}} → TGT {tr, off}.
function targetsToAppShape(macro_targets) {
  if (!macro_targets) return null;
  const pick = (o) =>
    o ? { cal: +o.cal || 0, p: +o.p || 0, c: +o.c || 0, f: +o.f || 0 } : null;
  const tr = pick(macro_targets.training);
  const off = pick(macro_targets.off);
  if (!tr && !off) return null;
  return { tr: tr || off, off: off || tr };
}

// Convert supplements [{name,timing,dose}] → SUPPS [{n,t,d}].
function suppsToAppShape(supplements) {
  if (!Array.isArray(supplements)) return null;
  return supplements.map((s) => ({
    n: s.name || '',
    t: s.timing || '',
    d: s.dose || '',
  }));
}

// Full conversion of parsed JSON into the bundle the tabs consume.
// `userFoodMap` is an FDB-style map of the verified unknown foods.
export function toAppProgramData(parsed, userFoodMap = {}) {
  const { split, wk } = splitToAppShape(parsed?.training_split);
  return {
    split,
    wk,
    trainingMeals: mealsToAppShape(parsed?.meals?.training_day, 'im'),
    offMeals: mealsToAppShape(parsed?.meals?.off_day, 'io'),
    targets: targetsToAppShape(parsed?.macro_targets),
    supps: suppsToAppShape(parsed?.supplements),
    foods: { ...userFoodMap },
  };
}

// ── Load saved imported data for the active program ──────────
// Rebuilds the in-memory bundle (split/wk/meals/targets/supps/foods) from the
// user's custom_splits / custom_meals / user_foods rows for a given program name.
export async function loadImportedData(userId, programName) {
  if (!userId || !programName) return null;
  try {
    const [{ data: splits }, { data: customMeals }, { data: foods }] = await Promise.all([
      supabase.from('custom_splits').select('*').eq('user_id', userId).eq('name', programName).eq('is_template', false).order('created_at', { ascending: false }),
      supabase.from('custom_meals').select('*').eq('user_id', userId).eq('name', programName).eq('is_template', false).order('created_at', { ascending: false }),
      supabase.from('user_foods').select('*').eq('user_id', userId),
    ]);

    const splitRow = (splits || [])[0];
    const training = (customMeals || []).find((m) => m.type === 'training');
    const off = (customMeals || []).find((m) => m.type === 'off');
    const foodMap = userFoodsToMap(foods || []);

    if (!splitRow && !training && !off) return null;

    return {
      split: splitRow?.days || null,
      wk: splitRow?.exercises || null,
      trainingMeals: training?.meals || null,
      offMeals: off?.meals || null,
      targets:
        training?.targets || off?.targets
          ? { tr: training?.targets || off?.targets || {}, off: off?.targets || training?.targets || {} }
          : null,
      supps: training?.supplements || off?.supplements || null,
      foods: foodMap,
    };
  } catch (err) {
    console.warn('[import] loadImportedData failed:', err.message);
    return null;
  }
}

// ── Persist to Supabase ──────────────────────────────────────
// verifiedFoods: array of { name, protein_per_100g, carbs_per_100g, fat_per_100g, cal_per_100g }
export async function saveImportedProgram({ userId, programName, weeks, parsed, verifiedFoods }) {
  const name = programName || 'Imported Program';
  const wk = parseInt(weeks) || 0;

  // 1. Save unknown foods to user_foods.
  if (Array.isArray(verifiedFoods) && verifiedFoods.length) {
    const rows = verifiedFoods.map((f) => ({
      user_id: userId,
      name: f.name,
      protein_per_100g: Number(f.protein_per_100g) || 0,
      carbs_per_100g: Number(f.carbs_per_100g) || 0,
      fat_per_100g: Number(f.fat_per_100g) || 0,
      cal_per_100g: Number(f.cal_per_100g) || 0,
    }));
    const { error } = await supabase
      .from('user_foods')
      .upsert(rows, { onConflict: 'user_id,name' });
    if (error) throw new Error('Saving foods failed: ' + error.message);
  }

  // 2. Save split.
  let splitId = null;
  if (Array.isArray(parsed?.training_split)) {
    const { split, wk: exercises } = splitToAppShape(parsed.training_split);
    const { data, error } = await supabase
      .from('custom_splits')
      .insert({
        user_id: userId,
        name,
        days: split,
        exercises,
        is_template: false,
      })
      .select()
      .single();
    if (error) throw new Error('Saving split failed: ' + error.message);
    splitId = data.id;
  }

  // 3. Save meals (training + off) as custom_meals rows.
  const mealIds = {};
  const supps = suppsToAppShape(parsed?.supplements) || [];
  const targets = targetsToAppShape(parsed?.macro_targets);
  const trainingMeals = mealsToAppShape(parsed?.meals?.training_day, 'im');
  const offMeals = mealsToAppShape(parsed?.meals?.off_day, 'io');

  if (trainingMeals) {
    const { data, error } = await supabase
      .from('custom_meals')
      .insert({
        user_id: userId,
        name,
        type: 'training',
        meals: trainingMeals,
        targets: targets?.tr || {},
        supplements: supps,
        is_template: false,
      })
      .select()
      .single();
    if (error) throw new Error('Saving training meals failed: ' + error.message);
    mealIds.training = data.id;
  }
  if (offMeals) {
    const { data, error } = await supabase
      .from('custom_meals')
      .insert({
        user_id: userId,
        name,
        type: 'off',
        meals: offMeals,
        targets: targets?.off || {},
        supplements: supps,
        is_template: false,
      })
      .select()
      .single();
    if (error) throw new Error('Saving off-day meals failed: ' + error.message);
    mealIds.off = data.id;
  }

  // 4. Deactivate existing programs, insert the new active one.
  await supabase
    .from('programs')
    .update({ active: false })
    .eq('user_id', userId)
    .eq('active', true);

  const start = today();
  const { error: progErr } = await supabase.from('programs').insert({
    user_id: userId,
    name,
    start_date: start,
    weeks: wk,
    active: true,
  });
  if (progErr) throw new Error('Saving program failed: ' + progErr.message);

  // Program object for app state (mirrors the in-memory `programs` shape,
  // with import markers so the app knows to override built-in data).
  return {
    name,
    start,
    weeks: wk,
    active: true,
    imported: true,
    splitId,
    mealIds,
  };
}
