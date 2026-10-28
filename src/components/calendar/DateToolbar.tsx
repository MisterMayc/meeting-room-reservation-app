import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { dateString, localDateTime, validDate } from "../../domain/booking";
import { Button } from "../ui/Button";
import "./DateToolbar.css";
interface Props {
  date: string;
  now: Date;
  onSelect: (date: string) => void;
  onMove: (offset: number) => void;
}
export function DateToolbar({ date, now, onSelect, onMove }: Props) {
  const selected = localDateTime(date);
  const dateTitle = selected.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="date-toolbar">
      <div className="date-heading">
        <CalendarDays />
        <div>
          <h2 id="schedule-heading">{dateTitle}</h2>
          <p>
            {date === dateString(now) ? "Today" : selected.getFullYear()}
            <span>·</span>09:00 – 18:00
          </p>
        </div>
      </div>
      <div className="date-controls">
        <Button onClick={() => onSelect(dateString(new Date()))}>Today</Button>
        <div className="day-navigation">
          {[-1, 1].map((offset) => (
            <Button
              variant="icon"
              key={offset}
              aria-label={offset < 0 ? "Previous day" : "Next day"}
              onClick={() => onMove(offset)}
            >
              {offset < 0 ? <ChevronLeft /> : <ChevronRight />}
            </Button>
          ))}
        </div>
        <label className="date-picker">
          <CalendarDays />
          <span className="sr-only">Choose date</span>
          <input
            type="date"
            aria-label="Choose date"
            value={date}
            onChange={(event) => {
              if (validDate(event.target.value)) onSelect(event.target.value);
            }}
          />
        </label>
      </div>
    </div>
  );
}
