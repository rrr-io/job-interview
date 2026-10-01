import { useCallback, useEffect, useState } from "react";
import pubmat from "./assets/pubmat.jpg";
import Terminal from "./components/Terminal";
import { CONFIG } from "./config";

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | terminal | done

  useEffect(() => {
    const timer = setTimeout(() => setPhase("terminal"), CONFIG.idleBeforeHack);
    return () => clearTimeout(timer);
  }, []);

  const handleExit = useCallback(() => setPhase("done"), []);

  return (
    <main className="page">
      <div className="pubmat">
        <img
          className="layer"
          src={pubmat}
          alt="Recruitment pubmat: We're hiring."
        />

        {phase === "terminal" && (
          <div className="term-wrap">
            <Terminal onExit={handleExit} />
          </div>
        )}
      </div>
    </main>
  );
}
