import { Clock3 } from "lucide-react";
import { ROOMS, minutes } from "../../domain/booking";
import type { BookingDraft, RoomId } from "../../domain/booking";
import { FormField } from "../ui/FormField";
import { TimeFields } from "./TimeFields";
import "./ReservationForm.css";

interface Props {
  draft: BookingDraft;
  now: Date;
  disabled: boolean;
  validation?: string;
  onChange: (value: BookingDraft) => void;
}

export function ReservationForm({
  draft,
  now,
  disabled,
  validation,
  onChange,
}: Props) {
  const duration = minutes(draft.end) - minutes(draft.start);
  return (
    <>
      <fieldset className="reservation-fields" disabled={disabled}>
        <FormField id="title" label="Meeting name" optional>
          <input
            id="title"
            placeholder="e.g. Product planning"
            value={draft.title ?? ""}
            onChange={(event) =>
              onChange({ ...draft, title: event.target.value })
            }
          />
        </FormField>
        <FormField id="room" label="Room">
          <select
            id="room"
            value={draft.roomId}
            onChange={(event) =>
              onChange({ ...draft, roomId: event.target.value as RoomId })
            }
          >
            {ROOMS.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} · {room.kind} · {room.seats} people
              </option>
            ))}
          </select>
        </FormField>
        <TimeFields draft={draft} now={now} onChange={onChange} />
      </fieldset>
      <div className="duration-note">
        <Clock3 />
        <span>
          {Number.isFinite(duration) && duration > 0
            ? `${duration} minutes`
            : "Choose a time"}
        </span>
        <span>30 min – 2 hours</span>
      </div>
      {validation && (
        <p className="validation-hint" aria-live="polite">
          {validation}
        </p>
      )}
    </>
  );
}
