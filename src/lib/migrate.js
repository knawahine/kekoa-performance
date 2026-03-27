import { supabase } from './supabase';
import { compressImage, base64ToBlob, uploadPhoto } from './photos';

const MIGRATED_KEY = 'kekoa-migrated';

/**
 * Check if migration has already been done
 */
export function isMigrated() {
  return localStorage.getItem(MIGRATED_KEY) === 'true';
}

/**
 * Migrate all localStorage state to Supabase
 */
export async function migrateLocalToSupabase(userId, state) {
  if (isMigrated()) return;

  // 1. Profile
  await supabase.from('profiles').upsert({
    id: userId,
    start_date: state.startDate,
    weight: state.weight,
    mode: state.mode || 'cut',
    calf_phase: state.calfPhase ?? 2,
    sled_stage: state.sledStage ?? 0,
    updated_at: new Date().toISOString(),
  });

  // 2. Programs
  const programRows = (state.programs || []).map((p) => ({
    user_id: userId,
    name: p.name,
    start_date: p.start,
    weeks: p.weeks,
    active: p.active,
  }));
  if (programRows.length) {
    await supabase.from('programs').insert(programRows);
  }

  // 3. Daily logs (mealChecks, suppChecks, weightLog)
  const dates = new Set();
  if (state.mealChecks) Object.keys(state.mealChecks).forEach((d) => dates.add(d));
  if (state.suppChecks) Object.keys(state.suppChecks).forEach((d) => dates.add(d));
  if (state.weightLog) state.weightLog.forEach((e) => dates.add(e.d));

  const dailyRows = [...dates].map((date) => {
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
  if (dailyRows.length) {
    // Batch in chunks of 100
    for (let i = 0; i < dailyRows.length; i += 100) {
      await supabase.from('daily_logs').upsert(dailyRows.slice(i, i + 100), { onConflict: 'user_id,date' });
    }
  }

  // 4. Exercise logs
  if (state.exLogs) {
    const exRows = [];
    for (const [date, exercises] of Object.entries(state.exLogs)) {
      for (const [exerciseKey, sets] of Object.entries(exercises)) {
        exRows.push({
          user_id: userId,
          date,
          exercise_key: exerciseKey,
          sets,
          updated_at: new Date().toISOString(),
        });
      }
    }
    for (let i = 0; i < exRows.length; i += 100) {
      await supabase.from('exercise_logs').upsert(exRows.slice(i, i + 100), { onConflict: 'user_id,date,exercise_key' });
    }
  }

  // 5. Meal overrides
  if (state.mealOverrides) {
    const moRows = [];
    for (const [date, meals] of Object.entries(state.mealOverrides)) {
      for (const [mealId, foods] of Object.entries(meals)) {
        moRows.push({ user_id: userId, date, meal_id: mealId, foods, updated_at: new Date().toISOString() });
      }
    }
    if (moRows.length) {
      await supabase.from('meal_overrides').upsert(moRows, { onConflict: 'user_id,date,meal_id' });
    }
  }

  // 6. Checkins
  if (state.checkins) {
    const ckRows = Object.entries(state.checkins).map(([weekNum, data]) => ({
      user_id: userId,
      week_num: parseInt(weekNum),
      data,
      updated_at: new Date().toISOString(),
    }));
    if (ckRows.length) {
      await supabase.from('checkins').upsert(ckRows, { onConflict: 'user_id,week_num' });
    }
  }

  // 7. Rehab checks
  if (state.rehabChecks) {
    const rhRows = Object.entries(state.rehabChecks).map(([date, checks]) => ({
      user_id: userId,
      date,
      checks,
      updated_at: new Date().toISOString(),
    }));
    if (rhRows.length) {
      await supabase.from('rehab_checks').upsert(rhRows, { onConflict: 'user_id,date' });
    }
  }

  // 8. Photos (convert base64 → Storage)
  if (state.photos) {
    for (const [weekNum, angles] of Object.entries(state.photos)) {
      for (const [angle, value] of Object.entries(angles)) {
        if (!value) continue;
        try {
          if (value.startsWith('data:')) {
            // Base64 — convert and upload
            const rawBlob = base64ToBlob(value);
            // Compress via canvas
            const img = new Image();
            const url = await new Promise((resolve, reject) => {
              img.onload = async () => {
                try {
                  const canvas = document.createElement('canvas');
                  let { width, height } = img;
                  const max = 1200;
                  if (width > max || height > max) {
                    if (width > height) {
                      height = Math.round((height / width) * max);
                      width = max;
                    } else {
                      width = Math.round((width / height) * max);
                      height = max;
                    }
                  }
                  canvas.width = width;
                  canvas.height = height;
                  canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                  const compressedBlob = await new Promise((res) =>
                    canvas.toBlob((b) => res(b), 'image/jpeg', 0.85)
                  );
                  const photoUrl = await uploadPhoto(userId, parseInt(weekNum), angle, compressedBlob);
                  resolve(photoUrl);
                } catch (err) {
                  reject(err);
                }
              };
              img.onerror = reject;
              img.src = value; // base64 data URL works as src
            });
          }
          // If it's already a URL (http), skip — already uploaded
        } catch (err) {
          console.warn(`[migrate] Failed to upload photo week ${weekNum} ${angle}:`, err.message);
        }
      }
    }
  }

  // Mark as migrated
  localStorage.setItem(MIGRATED_KEY, 'true');
}
