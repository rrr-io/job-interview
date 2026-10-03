import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CONFIG } from "../config";
import { prefersReducedMotion } from "../utils";
import "./Feedback.css";
import "./Window.css";

const STARS = 6;

// Logos are optional files, so a missing one never breaks the build
const ICONS = import.meta.glob("../assets/icons/*.svg", { eager: true, import: "default" });
const iconFor = (name) => ICONS[`../assets/icons/${name}.svg`];

// Whatever you pick, all six light up. Picking again changes nothing.
export default function Feedback({ open = true, rated, onRated, onReplay, onClose }) {
  const [lit, setLit] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [wiggle, setWiggle] = useState(0);

  const rate = () => {
    if (lit) {
      setWiggle((n) => n + 1);
      return;
    }
    setLit(STARS);
  };

  useEffect(() => {
    if (!lit) return;
    const fast = prefersReducedMotion();
    const enhance = setTimeout(() => setEnhanced(true), fast ? 0 : 500 + STARS * 60);
    const done = setTimeout(() => onRated?.(), fast ? 0 : 2000);
    return () => {
      clearTimeout(enhance);
      clearTimeout(done);
    };
  }, [lit, onRated]);

  // On the body, so it docks to the top of the real screen
  return createPortal(
    <div className={`feedback win win-pop ${open ? "" : "closed"}`} role="dialog" aria-label="Rate your experience">
      <div className="win-bar">
        <span className="win-title">Customer Satisfaction Survey</span>
        <span className="win-controls">
          <span aria-hidden="true">?</span>
          <button className="win-close" onClick={onClose} aria-label="Close the survey">
            ✕
          </button>
        </span>
      </div>

      <div className="win-body">
        <div className="feedback-message">
          <span className={`feedback-icon ${enhanced ? "ok" : ""}`} aria-hidden="true">
            {enhanced ? "✔" : "?"}
          </span>
          <div>
            {enhanced ? (
              <>
                <p className="finale-title">6/6. Excellent taste.</p>
                <p className="finale-body">Your feedback has been slightly enhanced.</p>
              </>
            ) : (
              <>
                <p className="finale-title">Rate your experience.</p>
                <p className="finale-body">Your honest feedback is very important to us.</p>
              </>
            )}
          </div>
        </div>

        <div key={wiggle} className={`feedback-stars ${wiggle ? "wiggle" : ""}`}>
          {Array.from({ length: STARS }, (_, i) => (
            <button
              key={i}
              className={`feedback-star ${i < lit ? "on" : ""}`}
              style={{ transitionDelay: lit && !wiggle ? `${i * 60}ms` : "0ms" }}
              aria-label={`${i + 1} of ${STARS} stars`}
              onClick={rate}
            >
              ★
            </button>
          ))}
        </div>

        <div className={`feedback-more ${rated ? "open" : ""}`}>
          <div>
            <p className="feedback-since">Oh, let me leave you my contacts.</p>
            <div className="feedback-links">
              {CONFIG.links.map((link) => (
                <a key={link.url} className="win-button" href={link.url} target="_blank" rel="noreferrer">
                  {iconFor(link.icon) && <img src={iconFor(link.icon)} alt="" />}
                  {link.label}
                </a>
              ))}
              <button className="win-button" onClick={onReplay}>
                REPLAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
