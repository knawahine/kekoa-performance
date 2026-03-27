import { FDB } from '../data/foods';

export function calcMacros(name, grams) {
  const d = FDB[name];
  if (!d) return { p: 0, c: 0, f: 0, cal: 0 };
  const m = grams / 100;
  return {
    p: +(d.p * m).toFixed(1),
    c: +(d.c * m).toFixed(1),
    f: +(d.f * m).toFixed(1),
    cal: Math.round(d.cal * m),
  };
}
