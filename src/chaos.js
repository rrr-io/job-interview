// Every PNG in src/assets/chaos/members/ is a member that can sit on the chair
const memberFiles = import.meta.glob("./assets/chaos/members/*.PNG", { eager: true, import: "default" });

// ENHYPEN: one member at a time, sitting on the chair. Each click swaps them.
// `size` is the width in pubmat pixels (the pubmat is 1080 wide).
export const MEMBERS = Object.values(memberFiles).map((src) => ({ src, size: 430 }));

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

// Clicks, on either button, before the rating shows up
export const CLICKS_BEFORE_RATING = 3;

// Where decorations may land: roughly the chair and a bit around it, in pubmat pixels
export const LANDING = { x: [250, 830], y: [380, 1020] };

// Where members touch down: bottom centre on the front of the seat
export const SEAT = { x: [520, 560], y: [885, 895] };

