import { useState } from 'react';
import { S } from '../lib/styles';
import { calcMacros } from '../lib/macros';
import { FL } from '../data/foods';
import Card from './shared/Card';
import Label from './shared/Label';

export default function MealsTab({ meals, tgt, mc, tMeal, isTr, setMF, baseMeals }) {
  const [addTo, setAddTo] = useState(null);
  const [nF, setNF] = useState("");
  const [nG, setNG] = useState("");
  const [eI, setEI] = useState(null);
  const [eG, setEG] = useState("");
  const [sub, setSub] = useState(null);
  const [sF, setSF] = useState("");
  const [sG, setSG] = useState("");

  const rm = (mid, fi) => { const m = meals.find((x) => x.id === mid); if (!m) return; const nf = [...m.foods]; nf.splice(fi, 1); setMF(mid, nf); };
  const add = (mid) => { if (!nF || !nG) return; const m = meals.find((x) => x.id === mid); if (!m) return; setMF(mid, [...m.foods, { n: nF, g: parseFloat(nG) || 0 }]); setAddTo(null); setNF(""); setNG(""); };
  const uG = (mid, fi, g) => { const m = meals.find((x) => x.id === mid); if (!m) return; setMF(mid, m.foods.map((f, i) => (i === fi ? { ...f, g: parseFloat(g) || 0 } : f))); };
  const doSub = (mid, fi) => { if (!sF) return; const m = meals.find((x) => x.id === mid); if (!m) return; setMF(mid, m.foods.map((f, i) => (i === fi ? { n: sF, g: parseFloat(sG) || f.g } : f))); setSub(null); setSF(""); setSG(""); };
  const reset = (mid) => { const b = baseMeals.find((m) => m.id === mid); if (b) setMF(mid, b.foods); };

  return (
    <>
      {/* Macro Targets */}
      <Card glow>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          {[
            { l: "CAL", v: tgt.cal, c: "#fff" },
            { l: "P", v: tgt.p + "g", c: S.bl },
            { l: "C", v: tgt.c + "g", c: S.gr },
            { l: "F", v: tgt.f + "g", c: S.am },
          ].map((m) => (
            <div key={m.l}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 800, color: m.c, lineHeight: 1 }}>{m.v}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.dm, letterSpacing: 1.5, marginTop: 2 }}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, fontWeight: 700, color: isTr ? S.bl : S.gr, letterSpacing: 1 }}>
          {isTr ? "TRAINING DAY" : "OFF DAY — HIGHER FATS"}
        </div>
      </Card>

      {/* Each Meal */}
      {meals.map((meal) => {
        const mt = meal.foods.reduce((a, f) => { const m = calcMacros(f.n, f.g); return { p: a.p + m.p, c: a.c + m.c, f: a.f + m.f, cal: a.cal + m.cal }; }, { p: 0, c: 0, f: 0, cal: 0 });
        return (
          <Card key={meal.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 700, color: "#fff" }}>{meal.nm}</div>
                <div style={{ fontSize: 10, color: S.dm }}>{meal.tm}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => reset(meal.id)} style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 6, padding: "4px 8px", fontSize: 9, color: S.rd, fontWeight: 700, cursor: "pointer" }}>↺</button>
                <button onClick={() => tMeal(meal.id)} style={{ width: 28, height: 28, borderRadius: 7, border: `2px solid ${mc[meal.id] ? S.gr : S.dr}`, background: mc[meal.id] ? S.gr : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {mc[meal.id] && <span style={{ color: S.bg, fontWeight: 900, fontSize: 14 }}>✓</span>}
                </button>
              </div>
            </div>

            {/* Food Items */}
            {meal.foods.map((f, fi) => {
              const fm = calcMacros(f.n, f.g);
              const isE = eI?.mid === meal.id && eI?.fi === fi;
              const isS = sub?.mid === meal.id && sub?.fi === fi;
              return (
                <div key={fi} style={{ padding: "5px 0", borderBottom: `1px solid ${S.bd}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: "2 1 80px", fontWeight: 600, color: "#c8c4bb", fontSize: 11 }}>{f.n}</div>
                    {isE ? (
                      <div style={{ display: "flex", gap: 3, flex: "1 0 auto" }}>
                        <input type="number" value={eG} onChange={(e) => setEG(e.target.value)} style={{ width: 48, background: "#1a2744", border: `1px solid ${S.bl}`, borderRadius: 4, padding: "2px 4px", color: S.tx, fontSize: 11, outline: "none" }} autoFocus />
                        <button onClick={() => { uG(meal.id, fi, eG); setEI(null); }} style={{ background: S.bl, color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>OK</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEI({ mid: meal.id, fi }); setEG(String(f.g)); }} style={{ flex: "0 0 auto", background: "rgba(56,145,255,0.06)", border: "1px solid rgba(56,145,255,0.1)", borderRadius: 4, padding: "2px 4px", color: S.dm, fontSize: 10, cursor: "pointer", textAlign: "center" }}>
                        {f.g}g ✏️
                      </button>
                    )}
                    <div style={{ width: 30, textAlign: "right", color: S.bl, fontWeight: 600, fontSize: 10 }}>{Math.round(fm.p)}P</div>
                    <div style={{ width: 30, textAlign: "right", color: S.gr, fontWeight: 600, fontSize: 10 }}>{Math.round(fm.c)}C</div>
                    <div style={{ width: 26, textAlign: "right", color: S.am, fontWeight: 600, fontSize: 10 }}>{Math.round(fm.f)}F</div>
                    <button onClick={() => { setSub({ mid: meal.id, fi }); setSF(f.n); setSG(String(f.g)); }} style={{ background: "rgba(56,145,255,0.08)", border: "none", borderRadius: 4, padding: "2px 5px", fontSize: 8, color: S.bl, cursor: "pointer", fontWeight: 600 }}>SUB</button>
                    <button onClick={() => rm(meal.id, fi)} style={{ background: "rgba(255,71,87,0.08)", border: "none", borderRadius: 4, padding: "2px 5px", fontSize: 9, color: S.rd, cursor: "pointer", fontWeight: 700 }}>✕</button>
                  </div>
                  {isS && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      <select value={sF} onChange={(e) => setSF(e.target.value)} style={{ flex: "2 1 120px", background: "#1a2744", border: `1px solid ${S.bl}`, borderRadius: 4, padding: "4px", color: S.tx, fontSize: 10, outline: "none" }}>
                        {FL.map((fn) => (<option key={fn} value={fn}>{fn}</option>))}
                      </select>
                      <input type="number" value={sG} onChange={(e) => setSG(e.target.value)} placeholder="g" style={{ width: 48, background: "#1a2744", border: `1px solid ${S.bl}`, borderRadius: 4, padding: "4px", color: S.tx, fontSize: 10, outline: "none" }} />
                      <button onClick={() => doSub(meal.id, fi)} style={{ background: S.bl, color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>✓</button>
                      <button onClick={() => setSub(null)} style={{ background: S.dr, color: S.dm, border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 9, cursor: "pointer" }}>✕</button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Meal Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 6, fontSize: 11, fontWeight: 700, padding: "4px 0", borderTop: `1px solid ${S.bd}` }}>
              <span style={{ color: S.bl }}>{Math.round(mt.p)}P</span>
              <span style={{ color: S.gr }}>{Math.round(mt.c)}C</span>
              <span style={{ color: S.am }}>{Math.round(mt.f)}F</span>
              <span style={{ color: "#8899b3" }}>{Math.round(mt.cal)} cal</span>
            </div>

            {/* Add Food */}
            {addTo === meal.id ? (
              <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                <select value={nF} onChange={(e) => setNF(e.target.value)} style={{ flex: "2 1 120px", background: "#1a2744", border: `1px solid ${S.gr}`, borderRadius: 4, padding: "4px", color: S.tx, fontSize: 10, outline: "none" }}>
                  <option value="">Select food...</option>
                  {FL.map((fn) => (<option key={fn} value={fn}>{fn}</option>))}
                </select>
                <input type="number" value={nG} onChange={(e) => setNG(e.target.value)} placeholder="g" style={{ width: 48, background: "#1a2744", border: `1px solid ${S.gr}`, borderRadius: 4, padding: "4px", color: S.tx, fontSize: 10, outline: "none" }} />
                <button onClick={() => add(meal.id)} style={{ background: S.gr, color: S.bg, border: "none", borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>ADD</button>
                <button onClick={() => setAddTo(null)} style={{ background: S.dr, color: S.dm, border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 9, cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setAddTo(meal.id)} style={{ marginTop: 6, width: "100%", background: "rgba(0,212,170,0.06)", border: "1px dashed rgba(0,212,170,0.2)", borderRadius: 6, padding: "6px", fontSize: 10, color: S.gr, fontWeight: 700, cursor: "pointer" }}>
                + ADD FOOD
              </button>
            )}
          </Card>
        );
      })}

      {/* Refeed Note */}
      <Card style={{ background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.2)" }}>
        <Label color={S.am}>REFEED</Label>
        <div style={{ fontSize: 11, color: "#c8c4bb" }}>
          Pick one day/week. Replace <strong style={{ color: S.am }}>Meal 5 only</strong>. Meals 1-4 on plan.
        </div>
      </Card>
    </>
  );
}
