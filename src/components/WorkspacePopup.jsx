import "./WorkspacePopup.css";

export default function WorkspacePopup({ onCustomize }) {
  return (
    <div className="workspace-backdrop">
      <div className="workspace-popup" role="alertdialog" aria-modal="true" aria-labelledby="workspace-title">
        <p className="workspace-title" id="workspace-title">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 2 20h20L12 3z" />
            <path d="M12 10v4M12 17v.5" />
          </svg>
          Workspace configuration incomplete
        </p>
        <p className="workspace-body"></p>
        <button className="workspace-action" onClick={onCustomize} autoFocus>
          CUSTOMIZE YOUR SEAT
        </button>
        <p className="workspace-note"></p>
      </div>
    </div>
  );
}
