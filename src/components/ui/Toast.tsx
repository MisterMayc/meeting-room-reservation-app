import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "./Button";
import "./Toast.css";

export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 7000);
    return () => clearTimeout(timeout);
  }, [message, onDismiss]);
  return (
    <div className="toast" role="status">
      <Check size={20} />
      <span>{message}</span>
      <Button
        variant="icon"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <X />
      </Button>
    </div>
  );
}
