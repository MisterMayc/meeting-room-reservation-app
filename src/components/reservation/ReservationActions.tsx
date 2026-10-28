import { Check, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import "./ReservationActions.css";

interface Props {
  editing: boolean;
  started: boolean;
  pending: boolean;
  confirming: boolean;
  onConfirm: (value: boolean) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ReservationActions({
  editing,
  started,
  pending,
  confirming,
  onConfirm,
  onDelete,
  onClose,
}: Props) {
  if (confirming)
    return (
      <div
        className="reservation-actions reservation-actions--confirm"
        role="group"
        aria-label="Confirm deletion"
      >
        <p>Delete this reservation? This cannot be undone.</p>
        <Button
          variant="danger"
          autoFocus
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </Button>
        <Button disabled={pending} onClick={() => onConfirm(false)}>
          Keep reservation
        </Button>
      </div>
    );
  return (
    <div className="reservation-actions">
      {editing && (
        <Button
          variant="text"
          className="reservation-actions__delete"
          disabled={pending}
          onClick={() => onConfirm(true)}
        >
          <Trash2 />
          Delete
        </Button>
      )}
      <Button disabled={pending} onClick={onClose}>
        {started ? "Close" : "Cancel"}
      </Button>
      {!started && (
        <Button variant="primary" type="submit" disabled={pending}>
          <Check />
          {pending ? "Saving…" : editing ? "Save changes" : "Reserve room"}
        </Button>
      )}
    </div>
  );
}
