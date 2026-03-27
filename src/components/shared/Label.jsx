import { S } from '../../lib/styles';

export default function Label({ children, color }) {
  return (
    <div
      style={{
        fontFamily: "'Barlow Condensed',system-ui",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 2.5,
        color: color || S.bl,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}
