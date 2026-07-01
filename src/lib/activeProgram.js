// Resolves which program data the live tabs should use: an active imported
// program's data overrides the built-in defaults, falling back to defaults for
// any section the imported PDF did not contain (null) or when no import is active.

import { SPLIT, WK } from '../data/workouts';
import { TM, OM, TGT } from '../data/meals';
import { SUPPS } from '../data/supplements';
import { FDB } from '../data/foods';

// activeProg: the active program object from state (may have imported: true).
// importedData: bundle from toAppProgramData (split, wk, trainingMeals,
//   offMeals, targets, supps, foods) loaded for the active imported program,
//   or null when none is active.
export function resolveProgramData(activeProg, importedData) {
  const useImport = !!(activeProg?.imported && importedData);

  if (!useImport) {
    return { SPLIT, WK, TM, OM, TGT, SUPPS, FDB };
  }

  return {
    SPLIT: importedData.split || SPLIT,
    WK: importedData.wk || WK,
    TM: importedData.trainingMeals || TM,
    OM: importedData.offMeals || OM,
    TGT: importedData.targets || TGT,
    SUPPS: importedData.supps || SUPPS,
    // Merge built-in foods with imported custom foods (imported wins on name clash).
    FDB: { ...FDB, ...(importedData.foods || {}) },
  };
}
