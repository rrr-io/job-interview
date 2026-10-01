import { useEffect, useState } from "react";
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

// Scattered so most messages stay readable as they pile up
const POSITIONS = [
  [6, 10],
  [32, 30],
  [2, 46],
  [30, 60],
  [26, 4],
  [8, 70],
  [34, 82],
  [4, 24],
  [18, 40],
];

export default function ErrorCascade() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => Math.min(ERRORS.length, c + 1)), 160);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="errors" aria-live="assertive">
      {ERRORS.slice(0, count).map((message, i) => (
        <div key={i} className="error-popup" role="alert" style={{ left: `${POSITIONS[i][0]}%`, top: `${POSITIONS[i][1]}%` }}>
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
    </div>
  );
}
