import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "../utils";
import "./Glitch.css";

const randomSlices = (intensity) =>
  Array.from({ length: 4 + Math.floor(Math.random() * 5) }, () => {
    const top = Math.random() * 92;
    const height = 1 + Math.random() * 9;
    return {
      top,
      bottom: Math.max(0, 100 - top - height),
      shift: (Math.random() - 0.5) * 14 * intensity,
      split: Math.random() > 0.4,
    };
  });

const BAR_COLORS = ["#000000", "#1a1a1a", "#777777", "#ffffff"];

// Full-width bars of noise, so the glitch spills out of the pubmat onto the whole screen
const randomBars = (intensity) =>
  Array.from({ length: Math.round((3 + Math.random() * 6) * intensity) }, () => ({
    top: Math.random() * 100,
    height: 0.3 + Math.random() * 4 * intensity,
    left: Math.random() * 30 - 15,
    width: 40 + Math.random() * 90,
    color: BAR_COLORS[Math.floor(Math.random() * BAR_COLORS.length)],
    opacity: 0.35 + Math.random() * 0.6,
  }));

export default function Glitch({ src, intensity }) {
  const [slices, setSlices] = useState([]);
  const [bars, setBars] = useState([]);

  useEffect(() => {
    if (!intensity || prefersReducedMotion()) {
      setSlices([]);
      setBars([]);
      return;
    }
    const tick = () => {
      setSlices(randomSlices(intensity));
      setBars(randomBars(intensity));
    };
    tick();
    const id = setInterval(tick, 70);
    return () => clearInterval(id);
  }, [intensity]);

  if (!slices.length) return null;

  return (
    <>
      <div className="glitch" aria-hidden="true">
        {slices.map((s, i) => (
          <div
            key={i}
            className={`slice ${s.split ? "split" : ""}`}
            style={{
              backgroundImage: `url(${src})`,
              clipPath: `inset(${s.top}% 0 ${s.bottom}% 0)`,
              transform: `translateX(${s.shift}%)`,
            }}
          />
        ))}
      </div>
      {createPortal(
        <div className="screen-glitch" aria-hidden="true">
          {bars.map((b, i) => (
            <span
              key={i}
              className="screen-bar"
              style={{ top: `${b.top}%`, height: `${b.height}vh`, left: `${b.left}%`, width: `${b.width}%`, background: b.color, opacity: b.opacity }}
            />
          ))}
          <span className="scanlines" />
        </div>,
        document.body
      )}
    </>
  );
}
