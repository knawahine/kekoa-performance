export const REHAB_PHASES = {
  1: { nm: "Protection & Early Loading", wk: "0-2", ex: [{ nm: "Ankle Circles", dt: "20 each direction, each foot." }, { nm: "Towel Stretch (Gastroc)", dt: "Seated, leg straight, towel on foot. 20-30s, 3 reps. BOTH." }, { nm: "Towel Stretch (Soleus)", dt: "Slight knee bend. 20-30s, 3 reps. BOTH." }, { nm: "Seated Band Plantarflexion", dt: "Light band, push foot down. 3×20. BOTH." }, { nm: "Gentle Foam Roll", dt: "Light pressure, lateral gastroc & soleus BOTH. Avoid medial tear." }, { nm: "Elevation", dt: "Legs above heart, 5-10 min." }] },
  2: { nm: "Progressive Loading", wk: "3-4", ex: [{ nm: "AM: Ankle Circles", dt: "20 each dir, each foot." }, { nm: "AM: Towel Stretch Gastroc", dt: "Leg straight, 20-30s, 3 reps. BOTH." }, { nm: "AM: Towel Stretch Soleus", dt: "Knee bent. 20-30s, 3 reps. BOTH." }, { nm: "AM: Seated Band Plantarflex", dt: "3×20. BOTH." }, { nm: "Main: DL Iso Calf Raise Hold", dt: "4×15-20s. Progress R loading 60/40→70/30." }, { nm: "Main: DL Calf Raises (Straight)", dt: "2s up/2s down. 3×12-15." }, { nm: "Main: DL Calf Raises (Bent ~20°)", dt: "Soleus bias. 3×12-15." }, { nm: "Main: Soleus Wall Sit", dt: "Knees 90°, rise onto balls. 3×20-30s." }, { nm: "Main: SL Balance", dt: "Right leg, 30-45s, 3 sets. Eyes closed progression." }, { nm: "Main: Stair Walk-Ups", dt: "Push off R calf. 3-5 flights." }, { nm: "NEW: Bilateral Symmetry Test", dt: "SL calf raise max rep test each side. Record. Retest 2 wks." }, { nm: "NEW: Left Achilles Extra", dt: "DL calf raises biasing left 70/30. 1×15 straight + bent." }, { nm: "PM: Foam Roll", dt: "Lateral gastroc & soleus BOTH. 2 min/area." }, { nm: "PM: Wall Stretch Gastroc", dt: "Knee straight. 30s, 2 reps. BOTH." }, { nm: "PM: Wall Stretch Soleus", dt: "Knee bent. 30s, 2 reps. BOTH." }, { nm: "PM: Elevation", dt: "Legs above heart, 5-10 min." }] },
  3: { nm: "Strength Building", wk: "5-6", ex: [{ nm: "SL Calf Raise (Straight)", dt: "2s up/2s down. Partial→full. 3×8-10. Both sides." }, { nm: "SL Calf Raise (Bent ~20°)", dt: "3×8-10. Both sides." }, { nm: "Eccentric Calf Raise on Step", dt: "Rise both, shift R, lower 3-4s. 3×8. Scar remodeling." }, { nm: "Wall Lean Calf Raise 45°", dt: "3×10-12. Stage 1 horizontal force." }, { nm: "Leg Press Calf Raise", dt: "3×12-15. Progress weekly." }, { nm: "Brisk/Incline Walking", dt: "10-15 min. First locomotive loading." }, { nm: "NEW: Seated Calf Raise (L Achilles)", dt: "3×15, 3s eccentric. Soleus deficit." }, { nm: "NEW: Heel-Rise Height (Left)", dt: "2×8 SL calf raises, 2s hold at max height." }] },
  4: { nm: "Power & Plyometrics", wk: "7-8", ex: [{ nm: "Continue Phase 3 Heavy", dt: "All Phase 3 exercises 3×/week, heavier (4-6 reps)." }, { nm: "DL Pogo Hops", dt: "Quick small jumps, minimal contact. 3×30s." }, { nm: "DL Box Jumps", dt: 'Low box 12-16", soft landings. 3×6.' }, { nm: "Skipping", dt: "3-4 sets 30-60s. Progress to R emphasis." }, { nm: "Lateral Shuffles", dt: "20 yards, 4 sets each direction." }, { nm: "A-Skips & High Knees", dt: "3 sets of 20 yards each." }, { nm: "NEW: Slow Sled Push (Walk)", dt: "Light load, full ankle ext. 3-5 min. Stage 2." }, { nm: "NEW: Pre-Session Activation", dt: "5-min calf protocol. PERMANENT from here." }] },
  5: { nm: "Return to Sport", wk: "9+", ex: [{ nm: "Wk 9: Walk/Jog Intervals", dt: "1 min jog / 2 min walk × 6-8." }, { nm: "Wk 10: Extended Jog", dt: "2 min jog / 1 min walk × 6-8." }, { nm: "Wk 11: Continuous Jog", dt: "5 min→15 min build." }, { nm: "Wk 12: Tempo Changes", dt: "Add tempo changes + gradual acceleration." }, { nm: "Shuttle Run", dt: "50 yards, change dir every 10 yds, 5 reps." }, { nm: "Box Drill", dt: "20 yard square, 6 reps, alternate side." }, { nm: "SL Hops for Distance", dt: "3 sets of 6 each leg." }, { nm: "Progressive Sprinting", dt: "50%→70%→85%→100% over 2-3 weeks." }, { nm: "Sled Stage 5+6", dt: "Only after pain-free unloaded sprints. See Sled tracker." }] },
};

export const SLED = [
  { s: 1, e: "Wall lean calf raises 45°", w: "Ph 3", g: "3×12 pain-free" },
  { s: 2, e: "Slow sled push (walk)", w: "Ph 4", g: "5 min continuous" },
  { s: 3, e: "Moderate sled push", w: "Ph 4+", g: "No next-day symptoms" },
  { s: 4, e: "Fast sled push (jog)", w: "Ph 5", g: "Pain-free + symmetric" },
  { s: 5, e: "Sled sprint (submaximal)", w: "Ph 5", g: "Unloaded sprints pain-free" },
  { s: 6, e: "Loaded sled sprint", w: "Wk 13+", g: "Bilateral symmetry + full sprint" },
];

export const CK_FIELDS = [
  { k: "dietChanges", l: "DIET/CARDIO CHANGES FROM PREVIOUS WEEK", t: "text" },
  { k: "weeksLeft", l: "WEEKS LEFT (if for a show, how many weeks out)", t: "text" },
  { k: "adherence", l: "HOW WELL DID YOU FOLLOW THE PLAN (1-10)", t: "number" },
  { k: "weightChange", l: "WEIGHT LOSS/GAIN FROM PREVIOUS WEEK", t: "text" },
  { k: "cardioDuration", l: "CARDIO DURATION (heart rate 130-135 bpm)", t: "text" },
  { k: "avgSteps", l: "AVERAGE STEPS (GOAL 10k)", t: "text" },
  { k: "avgCalsBurnt", l: "AVERAGE CALORIES BURNT", t: "text" },
  { k: "sleep", l: "HOW WAS SLEEP?", t: "text" },
  { k: "pumps", l: "HOW ARE YOUR PUMPS?", t: "text" },
  { k: "strength", l: "HOW IS YOUR STRENGTH?", t: "text" },
  { k: "stress", l: "HOW ARE STRESS LEVELS?", t: "text" },
];
