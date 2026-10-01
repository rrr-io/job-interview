import { useEffect, useRef, useState } from "react";
import { PROMPT, SCRIPT, TITLE } from "../terminalScript";
import { sleep } from "../utils";
import "./Terminal.css";

export default function Terminal({ onExit }) {
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState(null);
  const [progress, setProgress] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const print = (line) => setLines((prev) => [...prev, line]);

    async function run() {
      await sleep(450);
      for (const step of SCRIPT) {
        if (cancelled) return;

        if (step.cmd) {
          setTyping("");
          await sleep(280);
          for (let i = 1; i <= step.cmd.length; i++) {
            if (cancelled) return;
            setTyping(step.cmd.slice(0, i));
            await sleep(24 + Math.random() * 40);
          }
          setTyping(null);
          print({ kind: "cmd", text: step.cmd });
          await sleep(180);
        } else if (step.pause) {
          setTyping("");
          await sleep(step.pause);
        } else if (step.progress) {
          for (let p = 0; p <= 10; p++) {
            if (cancelled) return;
            setProgress(p);
            await sleep(140);
          }
          setProgress(null);
          print({ kind: "out", text: "[##########] 100%" });
        } else {
          print({ kind: "out", text: step.out, tone: step.tone });
          await sleep(step.tone === "err" ? 750 : 120);
        }
      }
      setTyping(null);
      await sleep(900);
      if (!cancelled) onExit();
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [onExit]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines, typing, progress]);

  return (
    <div className="term" role="log" aria-live="polite" aria-label="Terminal">
      <div className="term-bar">
        <span className="term-title">{TITLE}</span>
      </div>
      <div className="term-body" ref={bodyRef}>
        {lines.map((line, i) => (
          <div key={i} className={`tl ${line.kind} ${line.tone ?? ""}`}>
            {line.kind === "cmd" && <span className="ps1">{PROMPT}</span>}
            {line.text}
          </div>
        ))}
        {progress !== null && (
          <div className="tl out">
            [{"#".repeat(progress)}
            {".".repeat(10 - progress)}] {progress * 10}%
          </div>
        )}
        {typing !== null && (
          <div className="tl cmd">
            <span className="ps1">{PROMPT}</span>
            {typing}
            <span className="caret" />
          </div>
        )}
      </div>
    </div>
  );
}
