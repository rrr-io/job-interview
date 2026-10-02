import { useCallback, useEffect, useRef, useState } from "react";
import pubmat from "../assets/pubmat.jpg";
import chairOnly from "../assets/pubmat-chair-only.jpg";
import { DEFAULT_FACE } from "../erasers";
import "./ErrorCascade.css";
import "./Eraser.css";

const W = 1080;
const H = 1350;
const BRUSH = 110;
const DONE_AT = 0.8;
const STRIDE = 4;
const CHAIR_HITS = 18;

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });

// Copies the DOM leftovers (role label, command box) onto the canvas so they can be erased too
function paintLeftovers(ctx, pubmatEl, label) {
  ctx.fillStyle = "#fff";
  ctx.font = '27px "Libre Baskerville", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText(label, 540, 826);

  const box = pubmatEl?.querySelector(".take-seat");
  if (!box) return;
  const frame = pubmatEl.getBoundingClientRect();
  const scale = W / frame.width;
  const toCanvas = (r) => ({
    x: (r.left - frame.left) * scale,
    y: (r.top - frame.top) * scale,
    w: r.width * scale,
    h: r.height * scale,
  });

  const b = toCanvas(box.getBoundingClientRect());
  ctx.fillStyle = "#0d0d0f";
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 13);
  ctx.fill();

  const fontSize = parseFloat(getComputedStyle(box).fontSize) * scale;
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  box.querySelectorAll(".take-seat-cmd, .take-seat-out").forEach((line) => {
    const r = toCanvas(line.getBoundingClientRect());
    const pad = parseFloat(getComputedStyle(line).paddingLeft) * scale;
    let x = r.x + pad;
    const y = r.y + (r.h - parseFloat(getComputedStyle(line).paddingBottom) * scale + parseFloat(getComputedStyle(line).paddingTop) * scale) / 2;
    const ps1 = line.querySelector(".ps1");
    if (ps1) {
      ctx.fillStyle = "#ff0000";
      ctx.fillText("$", x, y);
      x += ctx.measureText("$ ").width;
    }
    const text = line.textContent.replace(/^\$\s*/, "");
    ctx.fillStyle = line.classList.contains("err") ? "#ff3b3b" : line.classList.contains("ok") ? "#9be7a5" : "#ededed";
    ctx.fillText(text, x, y);
  });
}

export default function Eraser({ face = DEFAULT_FACE, label, pubmatRef, onPainted, onDone }) {
  const canvasRef = useRef(null);
  const maskRef = useRef([]);
  const baseRef = useRef(null);
  const last = useRef(null);
  const drawing = useRef(false);
  const moves = useRef(0);
  const finished = useRef(false);
  const [cursor, setCursor] = useState({ x: 68, y: 22 });
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [lazy, setLazy] = useState(false);
  const contentRef = useRef(null);
  const chairHits = useRef(0);
  const [protectedChair, setProtectedChair] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const [original, base] = await Promise.all([loadImage(pubmat), loadImage(chairOnly), document.fonts.ready]);
      if (cancelled) return;

      const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(original, 0, 0, W, H);
      paintLeftovers(ctx, pubmatRef.current, label);

      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const offCtx = off.getContext("2d");
      offCtx.drawImage(base, 0, 0, W, H);
      const baseData = offCtx.getImageData(0, 0, W, H).data;
      const top = ctx.getImageData(0, 0, W, H).data;
      baseRef.current = baseData;

      const mask = [];
      const content = new Uint8Array(W * H);
      for (let y = 0; y < H; y += STRIDE) {
        for (let x = 0; x < W; x += STRIDE) {
          const i = (y * W + x) * 4;
          const diff = Math.abs(top[i] - baseData[i]) + Math.abs(top[i + 1] - baseData[i + 1]) + Math.abs(top[i + 2] - baseData[i + 2]);
          if (diff > 90) {
            mask.push(i);
            content[y * W + x] = 1;
          }
        }
      }
      maskRef.current = mask;
      contentRef.current = content;
      onPainted();
    }

    setup();
    const lazyTimer = setTimeout(() => setLazy(true), 8000);
    return () => {
      cancelled = true;
      clearTimeout(lazyTimer);
    };
  }, [label, pubmatRef, onPainted]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setProgress(1);
    setFading(true);
    setTimeout(onDone, 600);
  }, [onDone]);

  const measure = () => {
    const mask = maskRef.current;
    if (!mask.length) return;
    const data = canvasRef.current.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, W, H).data;
    let gone = 0;
    for (const i of mask) if (data[i + 3] < 100) gone++;
    const p = gone / mask.length;
    setProgress(p);
    if (p >= DONE_AT) finish();
  };

  const toCanvas = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    return { x: fx * W, y: fy * H, px: fx * 100, py: fy * 100 };
  };

  const stroke = (p) => {
    const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x + 0.1, p.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    last.current = p;
  };

  // Scrubbing a bit of chair with nothing left to erase on it
  const checkChair = (p) => {
    const base = baseRef.current;
    const content = contentRef.current;
    if (!base || !content || protectedChair) return;
    const cx = Math.round(p.x);
    const cy = Math.round(p.y);
    const i = (cy * W + cx) * 4;
    const isChair = base[i] + base[i + 1] + base[i + 2] < 210;
    if (!isChair) return;

    const r = BRUSH / 2;
    const x0 = Math.max(0, cx - r);
    const y0 = Math.max(0, cy - r);
    const area = canvasRef.current.getContext("2d", { willReadFrequently: true }).getImageData(x0, y0, BRUSH, BRUSH).data;
    for (let y = y0 - (y0 % STRIDE); y < y0 + BRUSH && y < H; y += STRIDE) {
      for (let x = x0 - (x0 % STRIDE); x < x0 + BRUSH && x < W; x += STRIDE) {
        if (x < x0 || y < y0 || !content[y * W + x]) continue;
        if (area[((y - y0) * BRUSH + (x - x0)) * 4 + 3] > 100) return;
      }
    }

    if (++chairHits.current >= CHAIR_HITS) {
      setProtectedChair(true);
      setTimeout(() => setProtectedChair(false), 2600);
      chairHits.current = -1000;
    }
  };

  const down = (e) => {
    if (finished.current) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    last.current = null;
    setDragging(true);
    const p = toCanvas(e);
    setCursor({ x: p.px, y: p.py });
    stroke(p);
  };

  const move = (e) => {
    if (!drawing.current) return;
    const p = toCanvas(e);
    setCursor({ x: p.px, y: p.py });
    stroke(p);
    checkChair(p);
    if (++moves.current % 10 === 0) measure();
  };

  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setDragging(false);
    measure();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className={`layer erase-canvas ${fading ? "fading" : ""}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        aria-label="Drag across the pubmat to erase everything except the chair"
        role="img"
      />

      {!fading && (
        <div className={`eraser ${dragging ? "dragging" : ""} ${protectedChair ? "bonk" : ""}`} style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }} aria-hidden="true">
          <img className="eraser-face" src={face} alt="" draggable="false" />
          {!dragging && progress === 0 && <span className="eraser-hint">drag me</span>}
        </div>
      )}

      {!fading && (
        <div className="erase-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress / DONE_AT) * 100)}>
          <span style={{ width: `${Math.min(100, (progress / DONE_AT) * 100)}%` }} />
        </div>
      )}

      {protectedChair && (
        <div className="error-popup chair-popup" role="alert">
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
            <p>You can't delete the chair. It's taken.</p>
          </div>
          <div className="error-actions">
            <span className="error-ok">OK</span>
          </div>
        </div>
      )}

      {lazy && !fading && (
        <button className="erase-lazy" onClick={finish}>
          do it for me
        </button>
      )}
    </>
  );
}
