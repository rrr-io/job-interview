import { useEffect, useState } from "react";
import { CAPTCHAS } from "../captchas";
import "./Captcha.css";

const pickOther = (current) => {
  const pool = CAPTCHAS.filter((c) => c !== current);
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function Captcha({ onVerified }) {
  const [captcha, setCaptcha] = useState(() => pickOther(null));
  const [selected, setSelected] = useState(() => new Set());
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!verified) return;
    const timer = setTimeout(() => onVerified(captcha.member), 1100);
    return () => clearTimeout(timer);
  }, [verified, onVerified, captcha]);

  const toggle = (i) => {
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const reload = () => {
    setCaptcha((c) => pickOther(c));
    setSelected(new Set());
    setError(null);
  };

  const verify = () => {
    const missed = captcha.tiles.findIndex((_, i) => !selected.has(i));
    if (missed === -1) setVerified(true);
    else setError(captcha.tiles[missed].missed);
  };

  if (verified) {
    return (
      <div className="cap cap-ok" role="status">
        <span className="cap-check" aria-hidden="true" />
        Verified. You're an ENGENE.
      </div>
    );
  }

  return (
    <div className="cap">
      <div className="cap-head">
        <span>Select all images with</span>
        <strong>{captcha.member}</strong>
        <span>Click verify once there are none left.</span>
      </div>

      <div className="cap-grid">
        {captcha.tiles.map((tile, i) => (
          <button
            key={tile.src}
            className={`cap-tile ${selected.has(i) ? "on" : ""}`}
            aria-pressed={selected.has(i)}
            onClick={() => toggle(i)}
          >
            <img src={tile.src} alt={tile.alt} draggable="false" />
          </button>
        ))}
      </div>

      {error && (
        <p className="cap-error" role="alert">
          Please try again. {error}
        </p>
      )}

      <div className="cap-foot">
        <button className="cap-reload" onClick={reload} aria-label="Get a new challenge">
          ↻
        </button>
        <button className="cap-verify" onClick={verify}>
          Verify
        </button>
      </div>
    </div>
  );
}
