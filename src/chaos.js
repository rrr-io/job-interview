import { ERASER_FACES } from "./erasers";
import sitting1 from "./assets/chaos/sitting-1.png";
import sitting2 from "./assets/chaos/sitting-2.png";

// ENHYPEN: one member at a time, sitting on the chair. Each click swaps them.
// Full-body cutouts sit on the seat; the faces become a big head on the seat.
// To add one: import x from "./assets/chaos/x.png" and add { src: x, size: 430 }.
// `size` is the width in pubmat pixels (the pubmat is 1080 wide).
export const MEMBERS = [
  { src: sitting1, size: 430 },
  { src: sitting2, size: 430 },
  ...Object.values(ERASER_FACES).map((src) => ({ src, size: 300 })),
];

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
