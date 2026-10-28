import { useEffect, useRef } from "react";
import { CalendarX2 } from "lucide-react";
import { Button } from "../ui/Button";
import "./ConflictMessage.css";
export interface ConflictDetails {
  message: string;
  refreshed: boolean;
}
export function ConflictMessage({
  conflict,
  onRetry,
  pending,
}: {
  conflict: ConflictDetails;
  onRetry: () => void;
  pending: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [conflict]);
  return (
    <section
      className="conflict-message"
      role="alert"
      tabIndex={-1}
      ref={ref}
      aria-labelledby="conflict-heading"
    >
      <CalendarX2 />
      <div>
        <h3 id="conflict-heading">That time was just reserved (HTTP 409)</h3>
        <p>{conflict.message}</p>
        <p>
          {conflict.refreshed
            ? "The calendar has been refreshed. Your details are still here—choose a different time or room."
            : "Availability could not refresh. Your details are still here. Retry before choosing another time."}
        </p>
        <Button variant="text" disabled={pending} onClick={onRetry}>
          Refresh availability
        </Button>
      </div>
    </section>
  );
}
