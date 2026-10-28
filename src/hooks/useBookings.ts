import { useCallback, useEffect, useState } from "react";
import type { Booking } from "../domain/booking";
import { DATA_KEY, INITIALIZED_KEY } from "../data/storageKeys";
import { bookingsApi } from "../api/bookingsApi";
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      setBookings(await bookingsApi.load());
      setStatus("ready");
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load reservations.",
      );
      setStatus("error");
      throw cause;
    }
  }, []);
  const retry = useCallback(() => {
    setStatus("loading");
    void refresh().catch(() => {});
  }, [refresh]);
  useEffect(() => {
    const update = () => {
      void refresh().catch(() => {});
    };
    const storage = (event: StorageEvent) => {
      if (
        event.key === DATA_KEY ||
        event.key === INITIALIZED_KEY ||
        event.key === null
      )
        update();
    };
    const visible = () => {
      if (!document.hidden) update();
    };
    update();
    window.addEventListener("focus", update);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);
  return { bookings, status, error, refresh, retry };
}
