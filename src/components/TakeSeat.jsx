import { useEffect, useState } from "react";

export default function TakeSeat({ status, onRun, onClearTyped }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (status !== "clearing") return;
    let i = 0;
    const id = setInterval(() => {
      setTyped("clear".slice(0, ++i));
      if (i >= 5) {
        clearInterval(id);
        onClearTyped();
      }
    }, 140);
    return () => clearInterval(id);
  }, [status, onClearTyped]);

  const seatTaken = status === "done" || status === "clearing" || status === "failed";

  return (
    <div className={`take-seat ${status}`}>
      <button className="take-seat-cmd" onClick={onRun} disabled={status !== "ready"}>
        <span className="ps1">$</span> take-a-seat
        {status === "ready" && <span className="caret" />}
      </button>
      {(status === "running" || status === "crashing") && (
        <div className="take-seat-out">submitting application…</div>
      )}
      {seatTaken && <div className="take-seat-out ok">✓ seat taken</div>}
      {(status === "clearing" || status === "failed") && (
        <div className="take-seat-out cmd">
          <span className="ps1">$</span> {typed}
          {status === "clearing" && <span className="caret" />}
        </div>
      )}
      {status === "failed" && (
        <>
          <div className="take-seat-out err">clear: something went wrong.</div>
          <div className="take-seat-out err">do it manually.</div>
        </>
      )}
    </div>
  );
}
