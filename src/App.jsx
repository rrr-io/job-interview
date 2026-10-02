import { useCallback, useEffect, useRef, useState } from "react";
import pubmat from "./assets/pubmat.jpg";
import chairOnly from "./assets/pubmat-chair-only.jpg";
import ChairLabel from "./components/ChairLabel";
import Eraser from "./components/Eraser";
import ErrorCascade from "./components/ErrorCascade";
import Glitch from "./components/Glitch";
import Queue from "./components/Queue";
import RedirectError from "./components/RedirectError";
import TakeSeat from "./components/TakeSeat";
import Terminal from "./components/Terminal";
import { CONFIG } from "./config";
import { prefersReducedMotion, sleep } from "./utils";

export default function App() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | breach | terminal | closing | done | redirect | queue | applied | erase | clean
  const [glitch, setGlitch] = useState(0);
  const [shake, setShake] = useState(false);
  const [label, setLabel] = useState("");
  const [seat, setSeat] = useState("ready"); // ready | running | crashing | done | clearing | failed
  const labelTimer = useRef(null);
  const skipRef = useRef(false);
  const pubmatRef = useRef(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    skipRef.current = false;
    setPhase("idle");
    setLabel("");
    setSeat("ready");
    setPainted(false);

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
    await sleep(fast ? 0 : 800);
    setSeat("crashing");
    await sleep(fast ? 600 : 2400);
    setShake(true);
    setGlitch(1.4);
    await sleep(fast ? 0 : 450);
    setGlitch(0);
    setShake(false);
    setPhase("redirect");
    await sleep(fast ? 1200 : 2400);
    setPhase("queue");
  }, []);

  const backFromQueue = useCallback(async () => {
    setSeat("done");
    setPhase("applied");
    setGlitch(1);
    await sleep(prefersReducedMotion() ? 0 : 300);
    setGlitch(0);
  }, []);

  useEffect(() => {
    if (phase !== "applied" || seat !== "done") return;
    const timer = setTimeout(() => setSeat("clearing"), 1500);
    return () => clearTimeout(timer);
  }, [phase, seat]);

  const handleClearTyped = useCallback(async () => {
    const fast = prefersReducedMotion();
    await sleep(350);
    setSeat("failed");
    await sleep(fast ? 1200 : 1800);
    setShake(true);
    setGlitch(1);
    await sleep(fast ? 0 : 350);
    setGlitch(0);
    setShake(false);
    setPhase("erase");
  }, []);

  const handlePainted = useCallback(() => setPainted(true), []);
  const handleErased = useCallback(() => setPhase("clean"), []);

  const terminalOpen = phase === "terminal" || phase === "closing";
  const pubmatClass = ["pubmat", phase === "breach" && "breach", shake && "shake"].filter(Boolean).join(" ");

  if (phase === "redirect") return <RedirectError host="apply.emgp" />;
  if (phase === "queue") return <Queue onDone={backFromQueue} />;

  return (
    <main className="page">
      <div className={pubmatClass} ref={pubmatRef}>
        {painted ? (
          <img className="layer" src={chairOnly} alt="An empty office chair." />
        ) : (
          <img className="layer" src={pubmat} alt="Recruitment pubmat: We're hiring." />
        )}

        {!painted && <ChairLabel text={label} typing={label !== "" && label !== CONFIG.newRole} />}

        <Glitch src={pubmat} intensity={glitch} />

        {terminalOpen && (
          <div className={`term-wrap ${phase === "closing" ? "closing" : ""}`}>
            <Terminal key={run} onEffect={handleEffect} onExit={handleExit} skipRef={skipRef} />
          </div>
        )}

        {phase === "erase" && (
          <Eraser label={CONFIG.newRole} pubmatRef={pubmatRef} onPainted={handlePainted} onDone={handleErased} />
        )}

        {(phase === "done" || phase === "applied" || (phase === "erase" && !painted)) && <TakeSeat status={seat} onRun={takeSeat} onClearTyped={handleClearTyped} />}

        {seat === "crashing" && <ErrorCascade />}

        {(phase === "done" || phase === "applied" || phase === "clean") && (
          <button className="replay" onClick={() => setRun((r) => r + 1)}>
            replay
          </button>
        )}
      </div>
    </main>
  );
}
