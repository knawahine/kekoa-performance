import { useState } from 'react';
import { S } from '../lib/styles';

export default function SetLogger({ idx, log, onSave }) {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(log?.w || "");
  const [r, setR] = useState(log?.r || "");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          minWidth: 52,
          padding: "6px 8px",
          background: log ? "rgba(0,212,170,0.08)" : "#1a2744",
          border: `1px solid ${log ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.05)"}`,
          borderRadius: 6,
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, color: S.dm }}>SET {idx + 1}</div>
        {log ? (
          <div style={{ fontSize: 11, fontWeight: 700, color: S.gr }}>
            {log.w && `${log.w}lb `}{log.r}r
          </div>
        ) : (
          <div style={{ fontSize: 10, color: S.dm }}>—</div>
        )}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", background: "#1a2744", border: `1px solid ${S.bl}`, borderRadius: 6, padding: "4px 6px" }}>
      <span style={{ fontSize: 9, color: S.dm, fontWeight: 700, width: 20 }}>S{idx + 1}</span>
      <input
        type="number"
        placeholder="lbs"
        value={w}
        onChange={(e) => setW(e.target.value)}
        style={{ width: 40, background: "transparent", border: "none", borderBottom: `1px solid ${S.dr}`, color: S.tx, fontSize: 11, outline: "none", textAlign: "center", padding: 2 }}
      />
      <span style={{ fontSize: 9, color: S.dm }}>×</span>
      <input
        type="number"
        placeholder="reps"
        value={r}
        onChange={(e) => setR(e.target.value)}
        style={{ width: 34, background: "transparent", border: "none", borderBottom: `1px solid ${S.dr}`, color: S.tx, fontSize: 11, outline: "none", textAlign: "center", padding: 2 }}
      />
      <button
        onClick={() => { onSave({ w, r }); setOpen(false); }}
        style={{ background: S.bl, color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}
      >
        ✓
      </button>
    </div>
  );
}
