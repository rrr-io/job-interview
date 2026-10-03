import tuning from "./cutoutTuning.json";

// Every PNG in src/assets/chaos/members/ is a member that can sit on the chair
const memberFiles = import.meta.glob("./assets/chaos/members/*.PNG", { eager: true, import: "default" });

// ENHYPEN: one member at a time, sitting on the chair. Each click swaps them.
// The PNGs are scaled so every face is about 128px wide (scripts/normalize_cutouts.py);
// on the pubmat they are shown at natural width / CUTOUT_DENSITY, so faces end up ~85px.
export const CUTOUT_DENSITY = 1.5;

// Per-photo fine tuning, made with the ?calibrate page in dev:
// x/y move the photo in pubmat pixels, scale multiplies its size.
export const MEMBERS = Object.entries(memberFiles).map(([path, src]) => {
  const name = path.split("/").pop();
  return { name, src, tune: { x: 0, y: 0, scale: 1, ...tuning[name] } };
});

// Decorations are hidden for now: set to true to bring the button back
export const SHOW_DECORATIONS = false;

// Decorations pile up around the chair, as many as you like (up to the cap)
export const DECORATIONS = [
  { emoji: "🎀", size: 170 },
  { emoji: "✨", size: 150 },
  { emoji: "🧋", size: 170 },
  { emoji: "💖", size: 150 },
  { emoji: "🦇", size: 160 },
  { emoji: "🦊", size: 160 },
  { emoji: "🐶", size: 160 },
  { emoji: "🪩", size: 160 },
];
export const MAX_DECORATIONS = 24;

// Clicks before the survey shows up, and before it comes back once closed
export const CLICKS_BEFORE_RATING = 6;

// Where decorations may land: roughly the chair and a bit around it, in pubmat pixels
export const LANDING = { x: [250, 830], y: [380, 1020] };

// Where members touch down: bottom centre on the front of the seat, before tuning
export const SEAT = { x: 540, y: 890 };

