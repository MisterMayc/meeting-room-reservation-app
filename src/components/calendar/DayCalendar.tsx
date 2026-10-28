import { ROOMS } from "../../domain/booking";
import type { Booking, RoomId } from "../../domain/booking";
import { CurrentTimeLine } from "./CurrentTimeLine";
import { RoomLane } from "./RoomLane";
import { TimeAxis } from "./TimeAxis";
import "./DayCalendar.css";
interface Props {
  date: string;
  bookings: Booking[];
  now: Date;
  onCreate: (roomId: RoomId, start: string) => void;
  onEdit: (booking: Booking) => void;
}
export function DayCalendar({ date, bookings, now, onCreate, onEdit }: Props) {
  return (
    <div className="calendar-scroll">
      <div className="calendar" aria-label={`Room schedule for ${date}`}>
        <div className="calendar-corner">MEETING ROOM</div>
        <TimeAxis />
        {ROOMS.map((room, index) => (
          <RoomLane
            key={room.id}
            room={room}
            index={index}
            date={date}
            bookings={bookings.filter((booking) => booking.roomId === room.id)}
            now={now}
            onCreate={onCreate}
            onEdit={onEdit}
          />
        ))}
        <CurrentTimeLine date={date} now={now} />
      </div>
    </div>
  );
}
