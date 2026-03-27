import { SPLIT } from '../data/workouts';

/**
 * Get an ISO date string for N days ago
 */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * Get the SPLIT day index for a given date (0=Mon, 6=Sun)
 */
function splitIndex(dateStr) {
  const dow = new Date(dateStr).getDay();
  return dow === 0 ? 6 : dow - 1;
}

/**
 * Check if meals hit threshold for a date (4/5 = 80%)
 */
function isMealsHit(mealChecks, date) {
  const mc = mealChecks?.[date];
  if (!mc) return false;
  const checked = Object.values(mc).filter(Boolean).length;
  return checked >= 4; // 4 out of 5
}

/**
 * Check if training hit for a date
 * - Training day: at least 1 exercise logged
 * - Off day: auto-counts as hit
 */
function isTrainingHit(exLogs, date) {
  const si = splitIndex(date);
  const isOff = SPLIT[si]?.type === 'off';
  if (isOff) return true;
  const dayLogs = exLogs?.[date];
  if (!dayLogs) return false;
  return Object.keys(dayLogs).length >= 1;
}

/**
 * Check if supplements hit for a date (7/9 threshold)
 */
function isSuppsHit(suppChecks, date) {
  const sc = suppChecks?.[date];
  if (!sc) return false;
  const checked = Object.values(sc).filter(Boolean).length;
  return checked >= 7; // 7 out of 9
}

/**
 * Check if overall hit (all three categories)
 */
function isOverallHit(mealChecks, exLogs, suppChecks, date) {
  return (
    isMealsHit(mealChecks, date) &&
    isTrainingHit(exLogs, date) &&
    isSuppsHit(suppChecks, date)
  );
}

/**
 * Count consecutive days of a hit function going backward from today
 * @param {Function} hitFn - (date) => boolean
 * @param {Object} streakFreezes - { weekNum: true } freeze map
 * @param {string} startDate - program start date
 * @returns {number} streak count
 */
function countStreak(hitFn, streakFreezes, startDate) {
  let streak = 0;
  let freezeUsedThisWeek = {};

  for (let i = 0; i < 365; i++) {
    const date = daysAgo(i);
    // Don't count before program start
    if (startDate && date < startDate) break;

    if (hitFn(date)) {
      streak++;
    } else {
      // Check for streak freeze
      const weekNum = getWeekNumber(date, startDate);
      if (streakFreezes?.[weekNum] && !freezeUsedThisWeek[weekNum]) {
        freezeUsedThisWeek[weekNum] = true;
        streak++; // Freeze saves the streak
      } else {
        break; // Streak broken
      }
    }
  }
  return streak;
}

/**
 * Get week number for a date relative to start
 */
function getWeekNumber(date, startDate) {
  if (!startDate) return 1;
  return Math.max(1, Math.floor((new Date(date) - new Date(startDate)) / 604800000) + 1);
}

/**
 * Calculate all streaks from app state
 */
export function calcStreaks(st) {
  const startDate = st.programs?.find((p) => p.active)?.start || st.startDate;
  const freezes = st.streakFreezes || {};

  const meals = countStreak(
    (date) => isMealsHit(st.mealChecks, date),
    freezes, startDate
  );
  const training = countStreak(
    (date) => isTrainingHit(st.exLogs, date),
    freezes, startDate
  );
  const supps = countStreak(
    (date) => isSuppsHit(st.suppChecks, date),
    freezes, startDate
  );
  const overall = countStreak(
    (date) => isOverallHit(st.mealChecks, st.exLogs, st.suppChecks, date),
    freezes, startDate
  );

  return { meals, training, supps, overall };
}

/**
 * Calculate weekly consistency scores for the last N weeks
 * Returns array of { week, meals, training, supps, overall } percentages
 */
export function calcWeeklyConsistency(st, numWeeks = 8) {
  const startDate = st.programs?.find((p) => p.active)?.start || st.startDate;
  const weeks = [];

  for (let w = 0; w < numWeeks; w++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (w * 7 + new Date().getDay())); // Go to last Sunday
    weekStart.setDate(weekStart.getDate() - ((numWeeks - 1 - w) * 7 - w * 7)); // Adjust

    // Simpler: just go back w weeks from current week start
    const now = new Date();
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));

    const weekMonday = new Date(currentMonday);
    weekMonday.setDate(currentMonday.getDate() - (numWeeks - 1 - w) * 7);

    let mealsHit = 0, trainingHit = 0, suppsHit = 0, overallHit = 0;
    const daysInWeek = w === numWeeks - 1 ? (now.getDay() === 0 ? 7 : now.getDay()) : 7; // Current week may be partial

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekMonday);
      date.setDate(weekMonday.getDate() + d);
      const dateStr = date.toISOString().slice(0, 10);

      // Skip future dates
      if (date > now) continue;
      // Skip dates before program start
      if (startDate && dateStr < startDate) continue;

      if (isMealsHit(st.mealChecks, dateStr)) mealsHit++;
      if (isTrainingHit(st.exLogs, dateStr)) trainingHit++;
      if (isSuppsHit(st.suppChecks, dateStr)) suppsHit++;
      if (isOverallHit(st.mealChecks, st.exLogs, st.suppChecks, dateStr)) overallHit++;
    }

    const divisor = Math.max(1, w === numWeeks - 1 ? daysInWeek : 7);
    weeks.push({
      week: numWeeks - w,
      label: w === 0 ? 'This Wk' : w === 1 ? 'Last Wk' : `${w}w ago`,
      meals: Math.round((mealsHit / divisor) * 100),
      training: Math.round((trainingHit / divisor) * 100),
      supps: Math.round((suppsHit / divisor) * 100),
      overall: Math.round((overallHit / divisor) * 100),
    });
  }

  return weeks.reverse(); // Oldest first
}

/**
 * Get milestone badge for a streak count
 */
export function getMilestoneBadge(streak) {
  if (streak >= 84) return { name: 'Program Complete', ring: '#b9f2ff', glow: true, pulse: true };
  if (streak >= 60) return { name: 'Iron Discipline', ring: '#e5e4e2', glow: true, pulse: false };
  if (streak >= 30) return { name: 'Monthly Machine', ring: '#ffd700', glow: false, pulse: false };
  if (streak >= 14) return { name: 'Two Week Warrior', ring: '#c0c0c0', glow: false, pulse: false };
  if (streak >= 7) return { name: 'First Week Down', ring: '#cd7f32', glow: false, pulse: false };
  return null;
}

/**
 * Get color for a consistency percentage
 */
export function consistencyColor(pct) {
  if (pct >= 90) return '#00d4aa'; // green — elite
  if (pct >= 75) return '#3891ff'; // blue — strong
  if (pct >= 50) return '#f5a623'; // amber — needs attention
  return '#ff4757'; // red — falling off
}

/**
 * Calculate personal bests from state
 * We store them in st.personalBests = { meals, training, supps, overall }
 */
export function updatePersonalBests(currentStreaks, existingBests) {
  const bests = { ...(existingBests || {}) };
  if (currentStreaks.meals > (bests.meals || 0)) bests.meals = currentStreaks.meals;
  if (currentStreaks.training > (bests.training || 0)) bests.training = currentStreaks.training;
  if (currentStreaks.supps > (bests.supps || 0)) bests.supps = currentStreaks.supps;
  if (currentStreaks.overall > (bests.overall || 0)) bests.overall = currentStreaks.overall;
  return bests;
}
