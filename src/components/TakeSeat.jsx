export default function TakeSeat({ status, onRun }) {
  return (
    <div className={`take-seat ${status}`}>
      <button className="take-seat-cmd" onClick={onRun} disabled={status !== "ready"}>
        <span className="ps1">$</span> take-a-seat
        {status === "ready" && <span className="caret" />}
      </button>
      {status === "running" && <div className="take-seat-out">redirecting to trauma queue…</div>}
    </div>
  );
}
