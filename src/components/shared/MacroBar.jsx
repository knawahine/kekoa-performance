import { S } from '../../lib/styles';

export default function MacroBar({ label, cur, max, color }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        <span style={{ color: S.dm }}>{label}</span>
        <span style={{ color: cur >= max * 0.95 ? S.gr : S.tx }}>
          {Math.round(cur)}/{max}
          {label !== "CALORIES" ? "g" : ""}
        </span>
      </div>
      <div
        style={{
          height: 5,
          background: "#1a2744",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, (cur / max) * 100)}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}
