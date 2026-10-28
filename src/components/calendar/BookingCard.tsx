import type { CSSProperties } from "react";
import { Clock3 } from "lucide-react";
import {
  CLOSE,
  OPEN,
  isEnded,
  localDateTime,
  minutes,
} from "../../domain/booking";
import type { Booking } from "../../domain/booking";
import "./BookingCard.css";
export function BookingCard({
  booking,
  roomName,
  now,
  onEdit,
}: {
  booking: Booking;
  roomName: string;
  now: Date;
  onEdit: (booking: Booking) => void;
}) {
  const duration = minutes(booking.end) - minutes(booking.start);
  const ended = isEnded(booking, now);
  const ongoing = !ended && localDateTime(booking.date, booking.start) <= now;
  const title = booking.title || "Reservation";
  const style = {
    "--start": `${((minutes(booking.start) - OPEN) / (CLOSE - OPEN)) * 100}%`,
    "--length": `${(duration / (CLOSE - OPEN)) * 100}%`,
  } as CSSProperties;
  return (
    <button
      className={`booking ${ended ? "booking-past" : ""} ${ongoing ? "booking-ongoing" : ""} ${duration < 60 ? "booking-compact" : ""}`}
      style={style}
      onClick={() => onEdit(booking)}
      aria-label={`${title}, ${roomName}, ${booking.start} to ${booking.end}${ended ? ", ended" : ongoing ? ", in progress" : ""}`}
      title={`${title} · ${booking.start}–${booking.end}`}
    >
      <span className="booking__time">
        {booking.start}
        <span>– {booking.end}</span>
      </span>
      <strong>{title}</strong>
      <span className="booking__duration">
        <Clock3 />
        {duration} min{ongoing && <i />}
      </span>
    </button>
  );
}
