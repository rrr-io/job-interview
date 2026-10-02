import { CONFIG } from "./config";

const { user, host, newRole } = CONFIG;

const position = newRole.replace(/ /g, "_");

// "Last login: Thu Oct  1 22:14:03 2026", from yesterday evening
const lastLogin = () => {
  const d = new Date(Date.now() - 86400000);
  d.setHours(22, 14, 3);
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month} ${String(d.getDate()).padStart(2)} 22:14:03 ${d.getFullYear()}`;
};

const dir = (name) => `drwxr-xr-x 2 emgp emgp 4096 Sep 28 18:04 ${name}`;

// The hacking session, from the laptop into the recruitment server
export const HACK_STEPS = [
  { cmd: `ssh ${user}@${host}`, then: { host } },
  { out: `Warning: Permanently added '${host}' (ED25519) to the list of known hosts.` },
  { out: `Last login: ${lastLogin()} from 192.168.1.23`, tone: "dim" },
  { cmd: "cd hiring_post", then: { cwd: "~/hiring_post" } },
  { cmd: "ls -l open_positions/" },
  { out: "total 12" },
  { out: dir("EDITOR") },
  { out: dir("GRAPHIC_DESIGNER") },
  { out: dir("VIDEO_EDITOR") },
  { cmd: 'grep -rli "web developer" .' },
  { pause: 600 },
  { cmd: "./check_position.sh web_developer" },
  { out: "ERROR 404: position WEB_DEVELOPER not found", tone: "err", effect: "shake" },
  { cmd: "mkdir open_positions/WEB_DEVELOPER" },
  { out: "mkdir: cannot create directory 'open_positions/WEB_DEVELOPER': Permission denied", tone: "err" },
  { cmd: "sudo !!" },
  { out: "sudo mkdir open_positions/WEB_DEVELOPER" },
  { out: `[sudo] password for ${user}:`, tone: "dim" },
  { cmd: `./patch.sh hiring_post.png --add-label "${newRole}"` },
  { out: "scanning chair... 3 labels detected" },
  { out: "writing label 4/4", effect: "label" },
  { progress: 10 },
  { out: "hiring_post.png patched", tone: "ok" },
  { cmd: 'git commit -am "fix: hiring post was missing a position"' },
  { out: "[main 3f7c2a1] fix: hiring post was missing a position" },
  { out: " 1 file changed, 0 insertions(+), 0 deletions(-)", tone: "dim" },
  { cmd: "clear", clear: true },
  { cmd: "./recruitment_patch.sh --status" },
  { out: "Position successfully added.", tone: "ok" },
  { out: "" },
  { out: "POSITION        STATUS", tone: "head" },
  { out: `${position}   AVAILABLE` },
  { out: "" },
  { out: "1 seat remaining." },
  { ask: "Reserve this seat? [y/N] ", answer: "y", button: "TAKE A SEAT", effect: "take-seat" },
];

export const SUBMIT_STEPS = [
  { out: "Reserving seat #001... done", tone: "ok" },
  { out: "Submitting application to apply.emgp..." },
  { progress: 6 },
  { pause: 500 },
  { out: "error: unexpected response from apply.emgp", tone: "err" },
  { out: "Retrying...", tone: "dim" },
  { pause: 900, effect: "crash" },
];

// Back from the queue: a new session on the server
export const RESUME_START = { host, cwd: "~/hiring_post" };

const row = (...cells) => cells.map((cell, i) => (i < cells.length - 1 ? cell.padEnd([6, 15, 13][i]) : cell)).join("");

export const RESUME_STEPS = [
  { cmd: "./take-a-seat.sh --resume" },
  { out: "Restoring previous session..." },
  { out: "Checking reservation status..." },
  { out: "Reservation found.", tone: "ok" },
  { out: "" },
  { out: row("SEAT", "POSITION", "RESERVED BY", "STATUS"), tone: "head" },
  { out: row("#001", position, user.toUpperCase(), "CONFIRMED") },
  { pause: 1400 },
  { cmd: "./final-inspection.sh" },
  { out: "Running final inspection..." },
  { pause: 700 },
  { out: "ERROR: workspace does not meet minimum ENGENE requirements", tone: "err" },
  { out: "Missing dependencies:" },
  { out: "  - enhypen" },
  { out: "  - bows" },
  { out: "  - unnecessary-decorations" },
  { out: "Manual configuration required." },
  { pause: 600, effect: "flag" },
];

export const CLEAN_STEPS = [
  { cmd: "./customize-seat.sh" },
  { out: "Cleaning workspace..." },
  { pause: 700 },
  { out: "ERROR: automatic cleanup failed", tone: "err" },
  { out: "Clean it yourself." },
  { pause: 1100, effect: "close" },
];
