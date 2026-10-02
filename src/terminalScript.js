import { CONFIG } from "./config";

const { user, host, newRole } = CONFIG;

// The hacking session, from the laptop into the recruitment server
export const HACK_STEPS = [
  { cmd: `ssh ${user}@${host}`, then: { host } },
  { out: `Warning: Permanently added '${host}' to the list of known hosts.` },
  { out: `Last login: ${new Date().toDateString()} from 127.0.0.1`, tone: "dim" },
  { cmd: "cd hiring_post", then: { cwd: "~/hiring_post" } },
  { cmd: "ls -l open_positions/" },
  { out: "total 3", tone: "dim" },
  { out: "drwxr-xr-x  2 emgp  staff  64  EDITOR" },
  { out: "drwxr-xr-x  2 emgp  staff  64  GRAPHIC_DESIGNER" },
  { out: "drwxr-xr-x  2 emgp  staff  64  VIDEO_EDITOR" },
  { cmd: 'grep -rli "web developer" .' },
  { pause: 500 },
  { cmd: "echo $?" },
  { out: "1" },
  { out: "ERROR 404: position WEB_DEVELOPER not found", tone: "err", effect: "shake" },
  { cmd: "mkdir open_positions/WEB_DEVELOPER" },
  { out: "mkdir: open_positions/WEB_DEVELOPER: Permission denied", tone: "err" },
  { cmd: "sudo !!" },
  { out: `[sudo] password for ${user}: ********`, tone: "dim" },
  { out: "created open_positions/WEB_DEVELOPER", tone: "ok" },
  { cmd: `./patch.sh hiring_post.png --add-label "${newRole}"` },
  { out: "scanning chair... 3 labels detected" },
  { out: "writing label 4/4", effect: "label" },
  { progress: 10 },
  { out: "hiring_post.png patched", tone: "ok" },
  { cmd: 'git commit -am "fix: hiring post was missing a position"' },
  { out: "[main 3f7c2a1] fix: hiring post was missing a position" },
  { out: " 1 file changed, 1 insertion(+)", tone: "dim" },
  { cmd: "exit", then: { host: "laptop", cwd: "~" } },
  { out: `Connection to ${host} closed.`, tone: "dim" },
  { pause: 900, effect: "exit" },
];
