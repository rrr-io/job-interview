import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "../config";
import { prefersReducedMotion, sleep } from "../utils";
import "./Terminal.css";

const START = { host: "laptop", cwd: "~" };

function Prompt({ host, cwd }) {
  return (
    <span className="ps1">
      <span className="ps1-user">
        {CONFIG.user}@{host}
      </span>
      :<span className="ps1-cwd">{cwd}</span>${" "}
    </span>
  );
}

// A bash session that plays a list of steps. The list can grow while it runs.
// Steps: cmd (typed, optional `then` changes host/cwd, optional `clear`), out (printed),
// pause (ms), progress (bar up to 10), ask (waits for the button, then types the answer),
// effect (callback to the parent).
export default function Terminal({ steps, start = START, onEffect, onIdle, skipRef }) {
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState(null);
  const [progress, setProgress] = useState(null);
  const [ctx, setCtx] = useState(start);
  const [asking, setAsking] = useState(null);
  const [skippable, setSkippable] = useState(Boolean(skipRef));
  const answer = useRef(null);
  const bodyRef = useRef(null);

  const ctxRef = useRef(start);
  const stepsRef = useRef(steps);
  const processed = useRef(0);
  const running = useRef(false);
  const alive = useRef(true);
  const handlers = useRef({ onEffect, onIdle });
  stepsRef.current = steps;
  handlers.current = { onEffect, onIdle };

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const runStep = useCallback(
    async (step) => {
      const instant = () => skipRef?.current || prefersReducedMotion();
      const wait = (ms) => sleep(instant() ? 0 : ms);
      const print = (line) => setLines((prev) => [...prev, line]);

      if (step.cmd) {
        setTyping("");
        await wait(420);
        for (let i = 1; i <= step.cmd.length && !instant(); i++) {
          if (!alive.current) return;
          setTyping(step.cmd.slice(0, i));
          await sleep(35 + Math.random() * 30);
        }
        setTyping(null);
        if (step.clear) {
          setLines([]);
        } else {
          print({ kind: "cmd", text: step.cmd, ctx: ctxRef.current });
        }
        if (step.then) {
          ctxRef.current = { ...ctxRef.current, ...step.then };
          setCtx(ctxRef.current);
        }
        await wait(320);
      } else if (step.pause) {
        setTyping("");
        await wait(step.pause);
        setTyping(null);
      } else if (step.progress) {
        for (let p = 0; p <= step.progress; p++) {
          if (!alive.current) return;
          setProgress(p);
          await wait(190);
        }
        setProgress(null);
        print({ kind: "out", text: `[${"#".repeat(step.progress)}${".".repeat(10 - step.progress)}] ${step.progress * 10}%` });
      } else if (step.ask) {
        if (skipRef) skipRef.current = false;
        setSkippable(false);
        setAsking(step);
        await new Promise((resolve) => (answer.current = resolve));
        setAsking(null);
        print({ kind: "out", text: step.ask + step.answer });
        await sleep(250);
      } else if (step.out !== undefined) {
        print({ kind: "out", text: step.out, tone: step.tone });
        await wait(step.tone === "err" ? 1100 : 280);
      }

      if (step.effect) handlers.current.onEffect?.(step.effect);
    },
    [skipRef]
  );

  const pump = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    while (alive.current && processed.current < stepsRef.current.length) {
      await runStep(stepsRef.current[processed.current]);
      processed.current += 1;
    }
    running.current = false;
    if (alive.current) handlers.current.onIdle?.();
  }, [runStep]);

  useEffect(() => {
    pump();
  }, [steps, pump]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines, typing, progress, asking]);

  return (
    <div className="term" role="log" aria-live="polite" aria-label="Terminal">
      <div className="term-bar">
        {skippable && (
          <button className="term-skip" onClick={() => (skipRef.current = true)}>
            skip
          </button>
        )}
        <span className="term-title">
          {CONFIG.user}@{ctx.host}: {ctx.cwd}
        </span>
        <span className="term-buttons" aria-hidden="true">
          <span>–</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>
      <div className="term-body" ref={bodyRef}>
        {lines.map((line, i) => (
          <div key={i} className={`tl ${line.kind} ${line.tone ?? ""}`}>
            {line.kind === "cmd" && <Prompt {...line.ctx} />}
            {line.text}
          </div>
        ))}
        {progress !== null && (
          <div className="tl out">
            [{"#".repeat(progress)}
            {".".repeat(10 - progress)}] {progress * 10}%
          </div>
        )}
        {asking && (
          <>
            <div className="tl out">
              {asking.ask}
              <span className="caret" />
            </div>
            <button className="term-answer" onClick={() => answer.current?.()}>
              [ {asking.button} ]
            </button>
          </>
        )}
        {typing !== null && (
          <div className="tl cmd">
            <Prompt {...ctx} />
            {typing}
            <span className="caret" />
          </div>
        )}
      </div>
    </div>
  );
}
