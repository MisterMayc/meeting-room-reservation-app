import { RotateCw } from "lucide-react";
import { Button } from "../ui/Button";
import "./CalendarStatus.css";
export function CalendarStatus({
  error,
  onRetry,
}: {
  error?: string;
  onRetry: () => void;
}) {
  return (
    <div className="calendar-status" role={error ? "alert" : "status"}>
      {error ? (
        <>
          <h3>We couldn’t load your schedule.</h3>
          <p>{error}</p>
          <Button onClick={onRetry}>
            <RotateCw />
            Try again
          </Button>
        </>
      ) : (
        <>
          <RotateCw className="spin" />
          <h3>Getting your rooms ready…</h3>
        </>
      )}
    </div>
  );
}
