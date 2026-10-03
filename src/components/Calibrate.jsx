import { useEffect, useRef, useState } from "react";
import chairOnly from "../assets/pubmat-chair-only.jpg";
import { MEMBERS, SEAT } from "../chaos";
import { placeMember, Thing } from "./Chaos";
import "./Calibrate.css";
import "./Window.css";

const round = (n) => Math.round(n * 100) / 100;

// Only the entries that differ from the defaults, ready for src/cutoutTuning.json
const toJson = (tunes) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(tunes)
        .filter(([, t]) => t.x || t.y || t.scale !== 1)
        .map(([name, t]) => [name, { x: Math.round(t.x), y: Math.round(t.y), scale: round(t.scale) }])
    ),
    null,
    2
  );

// Dev page (?calibrate): drag each member onto the seat, resize, copy the result
export default function Calibrate() {
  const [index, setIndex] = useState(0);
  const [tunes, setTunes] = useState(() => Object.fromEntries(MEMBERS.map((m) => [m.name, m.tune])));
  const [placed, setPlaced] = useState(null);
  const [copied, setCopied] = useState(false);
  const frame = useRef(null);
  const drag = useRef(null);

  const member = MEMBERS[index];
  const tune = tunes[member.name];

  useEffect(() => {
    let alive = true;
    placeMember({ ...member, tune }).then((p) => alive && setPlaced(p));
    return () => {
      alive = false;
    };
  }, [member, tune]);

  const update = (change) => setTunes((all) => ({ ...all, [member.name]: { ...all[member.name], ...change(all[member.name]) } }));
  const move = (dx, dy) => update((t) => ({ x: t.x + dx, y: t.y + dy }));
  const resize = (factor) => update((t) => ({ scale: t.scale * factor }));
  const go = (step) => setIndex((i) => (i + step + MEMBERS.length) % MEMBERS.length);

  useEffect(() => {
    const onKey = (e) => {
      const step = e.shiftKey ? 10 : 2;
      const keys = {
        ArrowLeft: () => move(-step, 0),
        ArrowRight: () => move(step, 0),
        ArrowUp: () => move(0, -step),
        ArrowDown: () => move(0, step),
        "+": () => resize(1.02),
        "=": () => resize(1.02),
        "-": () => resize(1 / 1.02),
        n: () => go(1),
        p: () => go(-1),
      };
      if (keys[e.key]) {
        e.preventDefault();
        keys[e.key]();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onPointerDown = (e) => {
    frame.current.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const scale = 1080 / frame.current.getBoundingClientRect().width;
    move((e.clientX - drag.current.x) * scale, (e.clientY - drag.current.y) * scale);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = () => (drag.current = null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toJson(tunes));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="page calibrate">
      <div className="pubmat" ref={frame} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <img className="layer" src={chairOnly} alt="" draggable="false" />
        <div className="calibrate-seat" style={{ top: `${(SEAT.y / 1350) * 100}%` }} />
        {placed && <Thing key={member.name} item={{ ...placed, entrance: "none" }} className="seated" />}
      </div>

      <div className="calibrate-panel win">
        <div className="win-bar">
          <span className="win-title">
            calibrate · {member.name} ({index + 1}/{MEMBERS.length})
          </span>
        </div>
        <div className="win-body calibrate-body">
          <div className="calibrate-row">
            <button className="win-button" onClick={() => go(-1)}>
              ◀ PREV
            </button>
            <button className="win-button" onClick={() => resize(1 / 1.02)}>
              − SMALLER
            </button>
            <button className="win-button" onClick={() => resize(1.02)}>
              + BIGGER
            </button>
            <button className="win-button" onClick={() => go(1)}>
              NEXT ▶
            </button>
          </div>
          <p className="calibrate-hint">
            drag the photo · arrows move (shift = faster) · +/− size · n/p next/prev · x {Math.round(tune.x)} y {Math.round(tune.y)} scale {round(tune.scale)}
          </p>
          <div className="calibrate-row">
            <button className="win-button" onClick={() => update(() => ({ x: 0, y: 0, scale: 1 }))}>
              RESET THIS ONE
            </button>
            <button className="win-button" onClick={copy}>
              {copied ? "COPIED ✓" : "COPY JSON"}
            </button>
          </div>
          <textarea className="calibrate-json" readOnly value={toJson(tunes)} aria-label="Tuning JSON for src/cutoutTuning.json" />
        </div>
      </div>
    </main>
  );
}
