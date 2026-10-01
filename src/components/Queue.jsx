import { useCallback, useEffect, useRef, useState } from "react";
import pubmat from "../assets/pubmat.jpg";
import { QUEUE_SIZE, TIMELINE } from "../queueScript";
import { sleep } from "../utils";
import Captcha from "./Captcha";
import "./Queue.css";

const clock = () => new Date().toLocaleTimeString("en-GB");

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="3" />
      <path d="M8 22l2-8-2-3 3-3h2l3 3-2 3 2 8h-2.5L12 16l-1.5 6z" />
    </svg>
  );
}

export default function Queue({ onDone }) {
  const [stage, setStage] = useState("loading"); // loading | waiting | line | verify | turn
  const [countdown, setCountdown] = useState(3);
  const [step, setStep] = useState(TIMELINE[0]);
  const [updatedAt, setUpdatedAt] = useState(clock());
  const [toast, setToast] = useState(null);
  const [offline, setOffline] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const interruptible = async (ms) => {
      const end = Date.now() + ms;
      while (Date.now() < end && !skipRef.current && !cancelled) await sleep(100);
    };

    async function run() {
      await sleep(800);
      if (cancelled) return;
      setStage("waiting");
      for (let s = 3; s > 0; s--) {
        setCountdown(s);
        await sleep(1000);
        if (cancelled) return;
      }
      setStage("line");
      for (const next of TIMELINE) {
        if (cancelled) return;
        if (skipRef.current) break;
        setStep(next);
        setUpdatedAt(clock());
        setToast(next.toast ?? null);
        setOffline(Boolean(next.disconnect));
        await interruptible(next.ms);
      }
      setToast(null);
      setOffline(false);
      if (!cancelled) setStage("verify");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerified = useCallback(() => setStage("turn"), []);

  const progress = Math.min(1, Math.max(0, 1 - step.ahead / QUEUE_SIZE));

  return (
    <div className="tq">
      <header className="tq-header">
        <span className="tq-logo">trauma</span>
      </header>

      {stage === "loading" ? (
        <div className="tq-loading" aria-label="Loading">
          <span className="tq-spinner" />
        </div>
      ) : (
        <main className="tq-main">
          <section className="tq-event">
            <img src={pubmat} alt="" />
            <div>
              <h1>EMGP Recruitment 2026</h1>
              <p>Web Developer · 1 chair available</p>
              <p className="tq-muted">Online · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </section>

          <section className="tq-status" aria-live="polite">
            {stage === "waiting" && (
              <>
                <h2>You're in the waiting room</h2>
                <p>When the queue opens, you'll be placed in line at random.</p>
                <p className="tq-countdown">0:0{countdown}</p>
              </>
            )}

            {stage === "line" && (
              <>
                <h2>You're in line</h2>
                <p className="tq-ahead">
                  <strong>{step.ahead.toLocaleString("en-US")}</strong> people ahead of you
                </p>
                <div className="tq-bar">
                  <span className="tq-fill" style={{ width: `${progress * 100}%` }} />
                  <span className="tq-person" style={{ left: `${progress * 100}%` }}>
                    <PersonIcon />
                  </span>
                </div>
                <p>
                  Estimated wait time: <strong>{step.wait}</strong>
                </p>
                <p className="tq-muted">Last updated {updatedAt}</p>
              </>
            )}

            {stage === "verify" && (
              <>
                <h2>Almost there</h2>
                <p>Before you continue, confirm you're not a bot.</p>
                <Captcha onVerified={handleVerified} />
              </>
            )}

            {stage === "turn" && (
              <>
                <h2>It's your turn!</h2>
                <p>You have 10 minutes to complete your application.</p>
                <button className="tq-button" onClick={onDone}>
                  Continue
                </button>
              </>
            )}
          </section>

          {(stage === "waiting" || stage === "line") && (
            <aside className="tq-warning">
              <strong>Don't refresh this page.</strong> If you do, you'll lose your place in line.
            </aside>
          )}

          {stage === "line" && (
            <button className="tq-skip" onClick={() => (skipRef.current = true)}>
              skip the queue (I've suffered enough)
            </button>
          )}
        </main>
      )}

      {toast && (
        <div className="tq-toast" role="status">
          {toast}
        </div>
      )}

      {offline && (
        <div className="tq-modal" role="alertdialog" aria-label="Connection lost">
          <div className="tq-modal-box">
            <span className="tq-spinner" />
            <h3>Connection lost</h3>
            <p>Trying to reconnect. Please don't close this page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
