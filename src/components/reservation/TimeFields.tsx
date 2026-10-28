import {
  CLOSE,
  MIN_DURATION,
  OPEN,
  localDateTime,
  timeString,
} from "../../domain/booking";
import type { BookingDraft } from "../../domain/booking";
import { FormField } from "../ui/FormField";
import "./TimeFields.css";

export function TimeFields({
  draft,
  now,
  onChange,
}: {
  draft: BookingDraft;
  now: Date;
  onChange: (value: BookingDraft) => void;
}) {
  const fields = [
    {
      key: "start",
      label: "Start time",
      min: timeString(OPEN),
      max: timeString(CLOSE - MIN_DURATION),
    },
    {
      key: "end",
      label: "End time",
      min: timeString(OPEN + MIN_DURATION),
      max: timeString(CLOSE),
    },
  ] as const;
  const suggestions = Array.from(
    { length: (CLOSE - OPEN) / MIN_DURATION },
    (_, index) => timeString(OPEN + index * MIN_DURATION),
  ).filter((time) => localDateTime(draft.date, time) >= now);
  return (
    <div className="time-fields">
      {fields.map((field) => (
        <FormField key={field.key} id={field.key} label={field.label}>
          <input
            id={field.key}
            type="time"
            min={field.min}
            max={field.max}
            step="60"
            required
            list={field.key === "start" ? "start-times" : undefined}
            value={draft[field.key]}
            onChange={(event) =>
              onChange({ ...draft, [field.key]: event.target.value })
            }
          />
        </FormField>
      ))}
      <datalist id="start-times">
        {suggestions.map((time) => (
          <option key={time} value={time} />
        ))}
      </datalist>
    </div>
  );
}
