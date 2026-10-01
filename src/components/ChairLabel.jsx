// Same coordinate system as the 1080x1350 pubmat, so the label sits on the seat
export default function ChairLabel({ text, typing }) {
  if (!text) return null;

  return (
    <svg className="layer" viewBox="0 0 1080 1350" aria-label={text} role="img">
      <text x="540" y="826" textAnchor="middle" className="chair-label">
        {text}
        {typing && <tspan className="chair-label-caret">|</tspan>}
      </text>
    </svg>
  );
}
