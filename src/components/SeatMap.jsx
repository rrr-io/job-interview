import { useEffect, useMemo, useState } from "react";
import "./SeatMap.css";

const CENTER = { x: 160, y: 18 };
const FREE_SEAT = { row: 0, angle: 0 };

// Fan-shaped rows of seats around the stage, with two aisles
function buildSeats() {
  const seats = [];
  for (let row = 0; row < 12; row++) {
    const radius = 72 + row * 14;
    const step = 11 / radius;
    for (let a = -0.75; a <= 0.75 + 1e-9; a += step) {
      if (Math.abs(Math.abs(a) - 0.3) < step * 0.9) continue;
      seats.push({
        x: CENTER.x + radius * Math.sin(a),
        y: CENTER.y + radius * Math.cos(a),
        free: row === FREE_SEAT.row && Math.abs(a - FREE_SEAT.angle) < step / 2,
      });
    }
  }
  return seats;
}

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function SeatMap({ onPick }) {
  const seats = useMemo(buildSeats, []);
  const [picked, setPicked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!picked) return;
    const timer = setTimeout(onPick, 1200);
    return () => clearTimeout(timer);
  }, [picked, onPick]);

  const pick = () => setPicked(true);

  return (
    <div className="seats">
      <div className="seats-timer">
        Time left to complete your application <strong>{formatTime(timeLeft)}</strong>
      </div>

      <h2>Choose your seat</h2>
      <p className="seats-count">1 seat available</p>

      <svg className="seats-map" viewBox="0 0 320 256" role="group" aria-label="Seat map">
        <rect x="95" y="0" width="130" height="34" rx="4" className="seats-stage" />
        <text x="160" y="22" textAnchor="middle" className="seats-stage-label">
          STAGE
        </text>

        {seats.map((seat, i) =>
          seat.free ? (
            <g
              key={i}
              className={`seat-free ${picked ? "picked" : ""}`}
              role="button"
              tabIndex={0}
              aria-label="Section EMGP, row 1, seat 1. Available"
              onClick={pick}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick()}
            >
              <circle cx={seat.x} cy={seat.y} r="12" className="seat-pulse" />
              <circle cx={seat.x} cy={seat.y} r="5.5" />
            </g>
          ) : (
            <circle key={i} cx={seat.x} cy={seat.y} r="3.6" className="seat-taken" />
          )
        )}
      </svg>

      <div className="seats-legend">
        <span>
          <i className="dot free" /> Available
        </span>
        <span>
          <i className="dot taken" /> Unavailable
        </span>
      </div>

      {picked && (
        <div className="tq-toast" role="status">
          Sec EMGP · Row 1 · Seat 01 reserved
        </div>
      )}
    </div>
  );
}
