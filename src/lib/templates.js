import { supabase } from './supabase';
import { SPLIT, WK } from '../data/workouts';
import { TM, OM, TGT } from '../data/meals';
import { SUPPS } from '../data/supplements';

/**
 * Kekoa's 12-Week Performance Cut template data
 */
export const KEKOA_TEMPLATE = {
  name: "12-Week Performance Cut",
  weeks: 12,
  mode: "cut",
  split: SPLIT,
  exercises: WK,
  trainingMeals: TM,
  offDayMeals: OM,
  targets: TGT,
  supplements: SUPPS,
};

/**
 * Seed Kekoa's template into the database (runs once, idempotent)
 */
export async function seedDefaultTemplate(userId) {
  // Check if template already exists
  const { data: existing } = await supabase
    .from('custom_splits')
    .select('id')
    .eq('is_template', true)
    .eq('name', 'Kekoa 12-Week Performance Cut')
    .limit(1);

  if (existing && existing.length > 0) return; // Already seeded

  // Seed the training split template
  await supabase.from('custom_splits').insert({
    user_id: userId,
    name: 'Kekoa 12-Week Performance Cut',
    days: SPLIT,
    exercises: WK,
    is_template: true,
    shared_by: userId,
  });

  // Seed the meal plan template (training day)
  await supabase.from('custom_meals').insert({
    user_id: userId,
    name: 'Kekoa Performance Cut — Training Day',
    type: 'training',
    meals: TM,
    targets: TGT.tr,
    supplements: SUPPS,
    is_template: true,
    shared_by: userId,
  });

  // Seed the meal plan template (off day)
  await supabase.from('custom_meals').insert({
    user_id: userId,
    name: 'Kekoa Performance Cut — Off Day',
    type: 'off',
    meals: OM,
    targets: TGT.off,
    supplements: SUPPS,
    is_template: true,
    shared_by: userId,
  });
}

/**
 * Fetch available templates for browsing
 */
export async function fetchTemplates() {
  const [{ data: splits }, { data: meals }] = await Promise.all([
    supabase.from('custom_splits').select('*').eq('is_template', true),
    supabase.from('custom_meals').select('*').eq('is_template', true),
  ]);
  return { splits: splits || [], meals: meals || [] };
}

/**
 * Clone a template for a specific user
 * Returns the initial state values to merge
 */
export function buildStateFromTemplate(template) {
  // template = { split, trainingMeals, offDayMeals, targets, supplements }
  return {
    mode: 'cut',
    // The actual workout/meal data is baked into the app's data/ files
    // so cloning a template just means creating the program with the right settings
  };
}
