import { FDB } from '../data/foods';

// Compute macros for `grams` of `name` using an explicit food map.
// The food map is keyed by food name with { p, c, f, cal } per 100g.
export function calcMacrosWith(foodMap, name, grams) {
  const d = foodMap[name];
  if (!d) return { p: 0, c: 0, f: 0, cal: 0 };
  const m = grams / 100;
  return {
    p: +(d.p * m).toFixed(1),
    c: +(d.c * m).toFixed(1),
    f: +(d.f * m).toFixed(1),
    cal: Math.round(d.cal * m),
  };
}

// Back-compat wrapper: uses the built-in food database only.
export function calcMacros(name, grams) {
  return calcMacrosWith(FDB, name, grams);
}
