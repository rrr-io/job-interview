// Placeholder tiles until the real photos are in. Every tile is a correct answer.
const placeholder = (text, hue) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" fill="hsl(${hue} 45% 82%)"/>` +
      `<text x="50" y="54" font-family="Arial" font-size="11" text-anchor="middle" fill="hsl(${hue} 40% 30%)">${text}</text>` +
      `</svg>`
  );

const tiles = (member, hue) =>
  Array.from({ length: 9 }, (_, i) => {
    const label = i < 5 ? `${member} ${i + 1}` : `${member} item ${i - 4}`;
    return { src: placeholder(label, hue), alt: label, missed: `${label} is also ${member}.` };
  });

export const CAPTCHAS = [
  { member: "JUNGWON", tiles: tiles("Jungwon", 20) },
  { member: "JAY", tiles: tiles("Jay", 80) },
  { member: "JAKE", tiles: tiles("Jake", 140) },
  { member: "SUNGHOON", tiles: tiles("Sunghoon", 200) },
  { member: "SUNOO", tiles: tiles("Sunoo", 260) },
  { member: "NI-KI", tiles: tiles("Ni-ki", 320) },
];
