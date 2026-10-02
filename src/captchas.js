const photos = import.meta.glob("./assets/captcha/*/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" });

// Optional: a custom message for a specific photo
const MESSAGES = {
};

const placeholder = (text, hue) =>
    "data:image/svg+xml," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
        `<rect width="100" height="100" fill="hsl(${hue} 45% 82%)"/>` +
        `<text x="50" y="54" font-family="Arial" font-size="11" text-anchor="middle" fill="hsl(${hue} 40% 30%)">${text}</text>` +
        `</svg>`
    );

const label = (file) => file.replace(/\.[^.]+$/, "").replace(/^\d+[-_ ]*/, "").replace(/[-_]/g, " ");

const tiles = (folder, name, hue) => {
    const files = Object.keys(photos)
        .filter((path) => path.startsWith(`./assets/captcha/${folder}/`))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    // No photos yet for this member: keep the coloured placeholders
    if (!files.length) {
        return Array.from({ length: 9 }, (_, i) => {
            const text = `${name} ${i + 1}`;
            return { src: placeholder(text, hue), alt: text, missed: `${text} is also ${name}.` };
        });
    }

    return files.slice(0, 9).map((path) => {
        const key = path.replace("./assets/captcha/", "");
        const text = label(path.split("/").pop());
        return { src: photos[path], alt: text, missed: MESSAGES[key] ?? `The ${text} is also ${name}.` };
    });
};

export const CAPTCHAS = [
    { member: "JUNGWON", tiles: tiles("jungwon", "Jungwon", 20) },
    { member: "JAY", tiles: tiles("jay", "Jay", 80) },
    { member: "JAKE", tiles: tiles("jake", "Jake", 140) },
    { member: "SUNGHOON", tiles: tiles("sunghoon", "Sunghoon", 200) },
    { member: "SUNOO", tiles: tiles("sunoo", "Sunoo", 260) },
    { member: "NI-KI", tiles: tiles("ni-ki", "Ni-ki", 320) },
];