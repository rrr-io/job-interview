import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CLICKS_BEFORE_RATING, CUTOUT_DENSITY, DECORATIONS, LANDING, MAX_DECORATIONS, MEMBERS, SEAT } from "../chaos";
import "./Chaos.css";
import "./Window.css";

const ENTRANCES = ["spin", "drop", "zoom", "fly-left", "fly-right"];
const between = ([min, max]) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const pct = (value, total) => `${(value / total) * 100}%`;

// Member cutouts get their size from the image itself, so faces match across photos
const widths = new Map();
const naturalWidth = (src) => {
  if (!widths.has(src)) {
    widths.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth);
        img.onerror = () => resolve(600);
        img.src = src;
      })
    );
  }
  return widths.get(src);
};

function Thing({ item, className = "" }) {
  return (
    <span
      className={`chaos-item chaos-${item.entrance} ${className}`}
      style={{
        left: pct(item.x, 1080),
        top: pct(item.y, 1350),
        width: pct(item.size, 1080),
        "--tilt": `${item.rotate}deg`,
        animationDelay: `${item.delay ?? 0}ms`,
      }}
      aria-hidden="true"
    >
      {item.src ? (
        <img src={item.src} alt="" draggable="false" />
      ) : (
        <span className="chaos-emoji" style={{ fontSize: `${(item.size / 1080) * 85}cqw` }}>
          {item.emoji}
        </span>
      )}
    </span>
  );
}

// One member on the chair at a time, plus a growing pile of decorations
export default function Chaos({ onShake, onEngaged, onInteract }) {
  const [member, setMember] = useState(null);
  const [leaving, setLeaving] = useState(null);
  const [decorations, setDecorations] = useState([]);
  const clicks = useRef(0);
  const count = useRef(0);

  const engage = () => {
    onShake?.();
    onInteract?.();
    clicks.current += 1;
    if (clicks.current === CLICKS_BEFORE_RATING) setTimeout(() => onEngaged?.(), 900);
  };

  const swapMember = async () => {
    const others = MEMBERS.filter((m) => m.src !== member?.src);
    const next = pick(others);
    engage();
    const size = (await naturalWidth(next.src)) / CUTOUT_DENSITY;
    if (member) {
      setLeaving(member);
      setTimeout(() => setLeaving(null), 450);
    }
    setMember({ ...next, size, id: ++count.current, x: between(SEAT.x), y: between(SEAT.y), rotate: between([-6, 6]), entrance: "drop" });
  };

  const addDecorations = () => {
    const batch = Array.from({ length: 3 }, (_, i) => ({
      ...pick(DECORATIONS),
      id: ++count.current,
      x: between(LANDING.x),
      y: between(LANDING.y),
      rotate: between([-35, 35]),
      entrance: pick(ENTRANCES),
      delay: i * 90,
    }));
    setDecorations((list) => [...list, ...batch].slice(-MAX_DECORATIONS));
    engage();
  };

  return (
    <>
      {leaving && <Thing key={`out-${leaving.id}`} item={leaving} className="seated leaving" />}
      {member && <Thing key={member.id} item={member} className="seated" />}
      {decorations.map((item) => (
        <Thing key={item.id} item={item} />
      ))}

      {/* On the body, so it docks to the bottom of the real screen */}
      {createPortal(
        <div className="paint win win-pop" role="group" aria-label="Customize your seat">
          <div className="win-bar">
            <span className="win-title">chair_final_FINAL(2).bmp - Paint</span>
            <span className="win-controls" aria-hidden="true">
              <span>_</span>
              <span>□</span>
              <span>✕</span>
            </span>
          </div>
          <div className="win-menu" aria-hidden="true">
            <span>file</span>
            <span>edit</span>
            <span>view</span>
            <span>image</span>
            <span>colors</span>
            <span>help</span>
          </div>
          <div className="win-body paint-body">
            <button className="win-button paint-tool" onClick={swapMember}>
              [ {member ? "ANOTHER MEMBER" : "ENHYPEN"} ]
            </button>
            <button className="win-button paint-tool" onClick={addDecorations}>
              [ DECORATIONS ]
            </button>
          </div>
          <div className="win-status">more decorations, more ENGENE compliance</div>
        </div>,
        document.body
      )}
    </>
  );
}
