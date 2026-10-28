import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "../ui/Button";
import "./ApiBootstrap.css";
export function ApiBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    import("../../mocks/browser")
      .then((api) => api.startDemoApi())
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (ready) return children;
  return (
    <main className="api-bootstrap" role={error ? "alert" : "status"}>
      {error ? (
        <>
          <h1>The demo API could not start.</h1>
          <p>
            Allow service workers and browser storage, then retry. Use HTTPS or
            localhost when running this demo.
          </p>
          <Button
            variant="primary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </Button>
        </>
      ) : (
        <>
          <RotateCw className="spin" />
          <p>Preparing the booking demo…</p>
        </>
      )}
    </main>
  );
}
