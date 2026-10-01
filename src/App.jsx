import { useCallback, useEffect, useState } from "react";
import pubmat from "./assets/pubmat.jpg";
import Glitch from "./components/Glitch";
import Terminal from "./components/Terminal";
import { CONFIG } from "./config";
import { sleep } from "./utils";

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | breach | terminal | closing | done
  const [glitch, setGlitch] = useState(0);

  useEffect(() => {
    let cancelled = false;

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
    };
  }, []);

  const handleExit = useCallback(async () => {
    setPhase("closing");
    setGlitch(1);
    await sleep(320);
    setGlitch(0);
    setPhase("done");
  }, []);

  const terminalOpen = phase === "terminal" || phase === "closing";

  return (
    <main className="page">
      <div className={`pubmat ${phase === "breach" ? "breach" : ""}`}>
        <img
          className="layer"
          src={pubmat}
          alt="Enhypen MAMA Grand Prix recruitment pubmat: We're hiring. A chair labelled editor, graphic designer, video editor."
        />

        <Glitch src={pubmat} intensity={glitch} />

        {terminalOpen && (
          <div className={`term-wrap ${phase === "closing" ? "closing" : ""}`}>
            <Terminal onExit={handleExit} />
          </div>
        )}
      </div>
    </main>
  );
}
