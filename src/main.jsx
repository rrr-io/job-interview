import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root"));

// Dev only: ?calibrate opens the tool to place each member cutout on the seat
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("calibrate")) {
  import("./components/Calibrate").then(({ default: Calibrate }) => root.render(<Calibrate />));
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
