import { useCallback, useEffect, useRef, useState } from "react";
import pubmat from "./assets/pubmat.jpg";
import ChairLabel from "./components/ChairLabel";
import Glitch from "./components/Glitch";
import TakeSeat from "./components/TakeSeat";
import Terminal from "./components/Terminal";
import { CONFIG } from "./config";
import { prefersReducedMotion, sleep } from "./utils";

export default function App() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | breach | terminal | closing | done | queue
  const [glitch, setGlitch] = useState(0);
  const [shake, setShake] = useState(false);
  const [label, setLabel] = useState("");
  const [seat, setSeat] = useState("ready"); // ready | running | done
  const labelTimer = useRef(null);
  const skipRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    skipRef.current = false;
    setPhase("idle");
    setLabel("");
    setSeat("ready");

    async function breach() {
      await sleep(CONFIG.idleBeforeHack);
      if (cancelled) return;
      setPhase("breach");
      setGlitch(0.4);
      await sleep(180);
      setGlitch(0);
      await sleep(260);
      setGlitch(1.4);
      await sleep(520);
      if (cancelled) return;
      setPhase("terminal");
      await sleep(220);
      setGlitch(0);
    }

    breach();
    return () => {
      cancelled = true;
      setGlitch(0);
      clearInterval(labelTimer.current);
    };
  }, [run]);

  const typeLabel = useCallback(() => {
    const full = CONFIG.newRole;
    if (skipRef.current || prefersReducedMotion()) return setLabel(full);
    let i = 0;
    clearInterval(labelTimer.current);
    labelTimer.current = setInterval(() => {
      setLabel(full.slice(0, ++i));
      if (i >= full.length) clearInterval(labelTimer.current);
    }, 95);
  }, []);

  const handleEffect = useCallback(
    (effect) => {
      if (effect === "shake") {
        setShake(true);
        setGlitch(0.8);
        setTimeout(() => setGlitch(0), 260);
        setTimeout(() => setShake(false), 420);
      }
      if (effect === "label") typeLabel();
    },
    [typeLabel]
  );

  const handleExit = useCallback(async () => {
    clearInterval(labelTimer.current);
    setLabel(CONFIG.newRole);
    setPhase("closing");
    setGlitch(1);
    await sleep(prefersReducedMotion() ? 0 : 320);
    setGlitch(0);
    setPhase("done");
  }, []);

  const takeSeat = useCallback(async () => {
    const fast = prefersReducedMotion();
    setSeat("running");
    await sleep(fast ? 0 : 900);
    setGlitch(1.2);
    await sleep(fast ? 0 : 450);
    setGlitch(0);
    setPhase("queue");
  }, []);

  const terminalOpen = phase === "terminal" || phase === "closing";
  const pubmatClass = ["pubmat", phase === "breach" && "breach", shake && "shake"].filter(Boolean).join(" ");

  return (
    <main className="page">
      <div className={pubmatClass}>
        <img
          className="layer"
          src={pubmat}
          alt="Recruitment pubmat: We're hiring."
        />

        <ChairLabel text={label} typing={label !== "" && label !== CONFIG.newRole} />

        <Glitch src={pubmat} intensity={glitch} />

        {terminalOpen && (
          <div className={`term-wrap ${phase === "closing" ? "closing" : ""}`}>
            <Terminal key={run} onEffect={handleEffect} onExit={handleExit} skipRef={skipRef} />
          </div>
        )}

        {phase === "done" && (
          <TakeSeat status={seat} onRun={takeSeat} />
        )}

        {phase === "done" && (
          <button className="replay" onClick={() => setRun((r) => r + 1)}>
            replay
          </button>
        )}
      </div>
    </main>
  );
}
