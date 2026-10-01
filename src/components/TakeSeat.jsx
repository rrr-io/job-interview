export default function TakeSeat({ status, onRun }) {
  return (
    <div className={`take-seat ${status}`}>
      <button className="take-seat-cmd" onClick={onRun} disabled={status !== "ready"}>
        <span className="ps1">$</span> take-a-seat
        {status === "ready" && <span className="caret" />}
      </button>
      {(status === "running" || status === "crashing") && (
        <div className="take-seat-out">submitting application…</div>
      )}
      {status === "done" && <div className="take-seat-out ok">✓ seat taken</div>}
    </div>
  );
}
