import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ApiBootstrap } from "./components/layout/ApiBootstrap";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApiBootstrap>
      <App />
    </ApiBootstrap>
  </StrictMode>,
);
