import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./ErrorCascade.css";

const ERRORS = [
  "Something went wrong. Redirecting you…",
  "Your session has expired. Your session has expired.",
  "Error 429: too many requests. It's ticketing day.",
  "Please do not refresh. Refreshing…",
  "Lightstick not paired. Please try again.",
  "Too many ENGENEs on this page.",
  "Seat not found. Seat not found. Seat not",
  "Merch sold out.",
  "Payment declined: too many photocards.",
];

// Spread over the whole viewport, as fractions of the free space so no popup gets cut off.
// The last ones land on top, so they stay readable.
const POSITIONS = [
  [0.1, 0.1],
  [0.9, 0.35],
  [0, 0.55],
  [0.85, 0.72],
  [0.75, 0],
  [0.15, 0.88],
  [1, 1],
  [0.05, 0.25],
  [0.5, 0.48],
];

export default function ErrorCascade() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => Math.min(ERRORS.length, c + 1)), 220);
    return () => clearInterval(id);
  }, []);

  return createPortal(
    <div className="errors" aria-live="assertive">
      {ERRORS.slice(0, count).map((message, i) => (
        <div key={i} className="error-popup" role="alert" style={{ "--x": POSITIONS[i][0], "--y": POSITIONS[i][1] }}>
          <div className="error-title">
            <span>Error</span>
            <span className="error-close" aria-hidden="true">
              ×
            </span>
          </div>
          <div className="error-body">
            <span className="error-icon" aria-hidden="true">
              !
            </span>
            <p>{message}</p>
          </div>
          <div className="error-actions">
            <span className="error-ok">OK</span>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
