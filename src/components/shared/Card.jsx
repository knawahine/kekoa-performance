import { S } from '../../lib/styles';

export default function Card({ children, glow, style }) {
  return (
    <div
      style={{
        background: S.cd,
        border: `1px solid ${glow ? "rgba(56,145,255,0.25)" : S.bd}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        ...(glow ? { boxShadow: "0 0 20px rgba(56,145,255,0.08)" } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
