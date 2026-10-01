import { useEffect, useState } from "react";
import "./RedirectError.css";

export default function RedirectError({ host }) {
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReloading(true), 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="redirect" role="alert">
      <div className="redirect-body">
        <svg className="redirect-icon" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M10 4h20l8 8v32H10z" />
          <path d="M30 4v8h8" className="fold" />
          <path d="M18 26l4 4m0-4l-4 4M28 26l4 4m0-4l-4 4M19 38c3-3 7-3 10 0" className="face" />
        </svg>

        <h1 data-text="This page isn't working">This page isn't working</h1>
        <p>
          <strong>{host}</strong> redirected you too many times.
        </p>
        <ul>
          <li>Try clearing your cookies.</li>
          <li>Try waiting in line like everyone else.</li>
        </ul>
        <code>ERR_TOO_MANY_ENGENES</code>

        <button className="redirect-reload" disabled>
          {reloading ? "Reloading…" : "Reload"}
        </button>
      </div>
    </div>
  );
}
