import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
import "./ErrorMessage.css";

export function ErrorMessage({
  message,
  onRetry,
  pending,
}: {
  message: string;
  onRetry: () => void;
  pending?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [message]);
  return (
    <div className="error-message" role="alert" tabIndex={-1} ref={ref}>
      <AlertCircle size={20} />
      <div>
        <p>{message}</p>
        <Button variant="text" disabled={pending} onClick={onRetry}>
          Refresh availability
        </Button>
      </div>
    </div>
  );
}
