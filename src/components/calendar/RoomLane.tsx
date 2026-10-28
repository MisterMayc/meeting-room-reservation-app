import type { CSSProperties } from "react";
import { Monitor, Plus, Users } from "lucide-react";
import {
  CLOSE,
  MIN_DURATION,
  OPEN,
  localDateTime,
  minutes,
  timeString,
} from "../../domain/booking";
import type { Booking, ROOMS, RoomId } from "../../domain/booking";
import { BookingCard } from "./BookingCard";
import "./RoomLane.css";
type Room = (typeof ROOMS)[number];
interface Props {
  room: Room;
  index: number;
  date: string;
  now: Date;
  bookings: Booking[];
  onCreate: (roomId: RoomId, start: string) => void;
  onEdit: (booking: Booking) => void;
}
const slots = Array.from(
  { length: (CLOSE - OPEN) / MIN_DURATION },
  (_, index) => OPEN + index * MIN_DURATION,
);
export function RoomLane({
  room,
  index,
  date,
  now,
  bookings,
  onCreate,
  onEdit,
}: Props) {
  const style = {
    "--room-index": index,
    "--room-color": room.color,
    "--room-tint": room.tint,
  } as CSSProperties;
  return (
    <section
      className="room-lane"
      style={style}
      aria-label={`${room.name}, ${room.kind}`}
    >
      <div className="room-info">
        <span className="room-info__mark">{room.name[0]}</span>
        <div>
          <h2>{room.name}</h2>
          <p>{room.kind}</p>
          <span className="room-info__capacity">
            <Users />
            {room.seats} people
          </span>
          <span className="room-info__equipment">
            <Monitor />
            {room.equipment}
          </span>
        </div>
      </div>
      <div className="room-track">
        <div className="slot-grid">
          {slots.map((start) => (
            <button
              className="add-slot"
              key={start}
              disabled={
                localDateTime(date, timeString(start)) < now ||
                bookings.some(
                  (booking) =>
                    start < minutes(booking.end) &&
                    start + MIN_DURATION > minutes(booking.start),
                )
              }
              aria-label={`Reserve ${room.name} at ${timeString(start)}`}
              onClick={() => onCreate(room.id, timeString(start))}
            >
              <Plus />
            </button>
          ))}
        </div>
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            roomName={room.name}
            now={now}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  );
}
