import { useEffect, useState } from "react";
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

export default function Glitch({ src, intensity }) {
  const [slices, setSlices] = useState([]);

  useEffect(() => {
    if (!intensity) {
      setSlices([]);
      return;
    }
    setSlices(randomSlices(intensity));
    const id = setInterval(() => setSlices(randomSlices(intensity)), 70);
    return () => clearInterval(id);
  }, [intensity]);

  if (!slices.length) return null;

  return (
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
      <div className="scanlines" />
    </div>
  );
}
