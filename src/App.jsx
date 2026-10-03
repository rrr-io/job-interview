import { useCallback, useEffect, useRef, useState } from "react";
import pubmat from "./assets/pubmat.jpg";
import chairOnly from "./assets/pubmat-chair-only.jpg";
import ChairLabel from "./components/ChairLabel";
import Eraser from "./components/Eraser";
import ErrorCascade from "./components/ErrorCascade";
import Glitch from "./components/Glitch";
import Queue from "./components/Queue";
import RedirectError from "./components/RedirectError";
import Terminal from "./components/Terminal";
import WorkspacePopup from "./components/WorkspacePopup";
import { CONFIG } from "./config";
import { DEFAULT_FACE, ERASER_FACES } from "./erasers";
import { CLEAN_STEPS, HACK_STEPS, RESUME_START, RESUME_STEPS, SUBMIT_STEPS } from "./terminalScript";
import { prefersReducedMotion, sleep } from "./utils";

export default function App() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | breach | terminal | redirect | queue | applied | erase | clean
  const [glitch, setGlitch] = useState(0);
  const [shake, setShake] = useState(false);
  const [label, setLabel] = useState("");
  const [seat, setSeat] = useState("ready"); // ready | crashing | done
  const [termSteps, setTermSteps] = useState(HACK_STEPS);
  const [flagged, setFlagged] = useState(false);
  const [resumeSteps, setResumeSteps] = useState(RESUME_STEPS);
  const [closing, setClosing] = useState(false);
  const labelTimer = useRef(null);
  const skipRef = useRef(false);
  const [painted, setPainted] = useState(false);
  const [member, setMember] = useState(null);

  useEffect(() => {
    let cancelled = false;
    skipRef.current = false;
    setPhase("idle");
    setLabel("");
    setSeat("ready");
    setTermSteps(HACK_STEPS);
    setFlagged(false);
    setResumeSteps(RESUME_STEPS);
    setClosing(false);
    setPainted(false);

    // Dev shortcut: ?skip=customize jumps straight to the empty chair
    if (run === 0 && new URLSearchParams(window.location.search).get("skip") === "customize") {
      setPainted(true);
      setPhase("clean");
      return;
    }

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

  const crash = useCallback(async () => {
    const fast = prefersReducedMotion();
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

  const handleEffect = useCallback(
    (effect) => {
      if (effect === "shake") {
        setShake(true);
        setGlitch(0.8);
        setTimeout(() => setGlitch(0), 260);
        setTimeout(() => setShake(false), 420);
      }
      if (effect === "label") typeLabel();
      if (effect === "take-seat") setTermSteps((steps) => [...steps, ...SUBMIT_STEPS]);
      if (effect === "crash") crash();
    },
    [typeLabel, crash]
  );

  const backFromQueue = useCallback((verifiedMember) => {
    setMember(verifiedMember);
    setSeat("done");
    setPhase("applied");
  }, []);

  const toEraser = useCallback(async () => {
    const fast = prefersReducedMotion();
    setShake(true);
    setGlitch(1);
    await sleep(fast ? 0 : 350);
    setGlitch(0);
    setShake(false);
    setPhase("erase");
  }, []);

  // "Clean it yourself": the window closes and the eraser takes over
  const closeTerminal = useCallback(async () => {
    setClosing(true);
    await sleep(prefersReducedMotion() ? 0 : 320);
    toEraser();
  }, [toEraser]);

  const handleResumeEffect = useCallback(
    (effect) => {
      if (effect === "flag") setFlagged(true);
      if (effect === "close") closeTerminal();
    },
    [closeTerminal]
  );

  const customize = useCallback(() => {
    setFlagged(false);
    setResumeSteps((steps) => [...steps, ...CLEAN_STEPS]);
  }, []);

  const handlePainted = useCallback(() => setPainted(true), []);
  const handleErased = useCallback(() => setPhase("clean"), []);


  const pageClass = ["page", phase === "breach" && "breach", shake && "shake"].filter(Boolean).join(" ");

  if (phase === "redirect") return <RedirectError host="apply.emgp" />;
  if (phase === "queue") return <Queue onDone={backFromQueue} />;

  return (
    <main className={pageClass}>
      <div className="pubmat">
        {painted ? (
          <img className="layer" src={chairOnly} alt="An empty office chair." />
        ) : (
          <img className="layer" src={pubmat} alt="Recruitment pubmat: We're hiring." />
        )}

        {!painted && <ChairLabel text={label} typing={label !== "" && label !== CONFIG.newRole} />}

        <Glitch src={pubmat} intensity={glitch} />

        {phase === "terminal" && (
          <div className="term-wrap">
            <Terminal key={run} steps={termSteps} onEffect={handleEffect} skipRef={skipRef} />
          </div>
        )}

        {phase === "applied" && (
          <div className={`term-wrap ${closing ? "closing" : ""}`}>
            <Terminal key={`resume-${run}`} steps={resumeSteps} start={RESUME_START} onEffect={handleResumeEffect} />
          </div>
        )}

        {phase === "erase" && (
          <Eraser face={ERASER_FACES[member] ?? DEFAULT_FACE} label={CONFIG.newRole} onPainted={handlePainted} onDone={handleErased} />
        )}

        {seat === "crashing" && <ErrorCascade />}

        {phase === "applied" && flagged && <WorkspacePopup onCustomize={customize} />}

        {phase === "clean" && (
          <button className="replay" onClick={() => setRun((r) => r + 1)}>
            replay
          </button>
        )}
      </div>
    </main>
  );
}
