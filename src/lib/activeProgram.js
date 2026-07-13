// Resolves which program data the live tabs should use. An imported program
// carries its full data bundle on `activeProg.data` (self-contained), which
// overrides the built-in defaults, falling back to defaults for any section the
// imported PDF did not contain (null) or when no import is active.

import { SPLIT, WK } from '../data/workouts';
import { TM, OM, TGT } from '../data/meals';
import { SUPPS } from '../data/supplements';
import { FDB } from '../data/foods';

// activeProg: the active program object from state. When it was imported from a
// PDF, activeProg.imported is true and activeProg.data holds the bundle
// { split, wk, trainingMeals, offMeals, targets, supps, foods }.
export function resolveProgramData(activeProg) {
  const d = activeProg?.imported ? activeProg.data : null;

  if (!d) {
    return { SPLIT, WK, TM, OM, TGT, SUPPS, FDB };
  }

  return {
    SPLIT: d.split || SPLIT,
    WK: d.wk || WK,
    TM: d.trainingMeals || TM,
    OM: d.offMeals || OM,
    TGT: d.targets || TGT,
    SUPPS: d.supps || SUPPS,
    // Merge built-in foods with imported custom foods (imported wins on name clash).
    FDB: { ...FDB, ...(d.foods || {}) },
  };
}
