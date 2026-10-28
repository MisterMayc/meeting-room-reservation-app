import { useCallback, useEffect, useState } from "react";
import { conflictSimulationApi } from "../api/conflictSimulationApi";
export function useConflictSimulation() {
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      setArmed((await conflictSimulationApi.get()).armed);
      setError("");
    } catch {
      setError("Could not read the conflict setting. Retry the switch.");
    } finally {
      setPending(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const toggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      setArmed((await conflictSimulationApi.set(!armed)).armed);
      setError("");
    } catch {
      setError("Could not update the conflict setting. Please retry.");
    } finally {
      setPending(false);
    }
  };
  return { armed, pending, error, toggle, refresh };
}
