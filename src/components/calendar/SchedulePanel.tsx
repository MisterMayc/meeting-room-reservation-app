import { Clock3 } from "lucide-react";
import type { Booking, RoomId } from "../../domain/booking";
import { DateToolbar } from "./DateToolbar";
import { RoomLegend } from "./RoomLegend";
import { DayCalendar } from "./DayCalendar";
import { CalendarStatus } from "./CalendarStatus";
import "./SchedulePanel.css";
interface Props {
  date: string;
  now: Date;
  bookings: Booking[];
  status: "loading" | "ready" | "error";
  error: string;
  onSelect: (date: string) => void;
  onMove: (offset: number) => void;
  onCreate: (roomId: RoomId, start: string) => void;
  onEdit: (booking: Booking) => void;
  onRetry: () => void;
}
export function SchedulePanel({
  date,
  now,
  bookings,
  status,
  error,
  onSelect,
  onMove,
  onCreate,
  onEdit,
  onRetry,
}: Props) {
  const timezone = Intl.DateTimeFormat()
    .resolvedOptions()
    .timeZone.replaceAll("_", " ");
  return (
    <section className="schedule-panel" aria-labelledby="schedule-heading">
      <DateToolbar date={date} now={now} onSelect={onSelect} onMove={onMove} />
      <RoomLegend />
      {status !== "ready" ? (
        <CalendarStatus
          error={status === "error" ? error : undefined}
          onRetry={onRetry}
        />
      ) : (
        <>
          <DayCalendar
            date={date}
            bookings={bookings}
            now={now}
            onCreate={onCreate}
            onEdit={onEdit}
          />
          {bookings.length === 0 && (
            <p className="schedule-panel__empty">
              No reservations on this date. Select an open time to add one.
            </p>
          )}
        </>
      )}
      <footer className="schedule-footer">
        <span>
          <i />
          Saved on this device
        </span>
        <span>
          <Clock3 />
          {timezone}
          <span>·</span>30 min – 2 hour reservations
        </span>
      </footer>
    </section>
  );
}
