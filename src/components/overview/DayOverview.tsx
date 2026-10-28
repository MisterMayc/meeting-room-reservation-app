import { CalendarDays, Clock3, DoorOpen } from "lucide-react";
import { CLOSE, OPEN, ROOMS, isEnded } from "../../domain/booking";
import type { Booking } from "../../domain/booking";
import { bookedMinutes } from "../../data/bookings";
import "./DayOverview.css";

export function DayOverview({
  bookings,
  now,
}: {
  bookings: Booking[];
  now: Date;
}) {
  const upcoming = bookings.filter((booking) => !isEnded(booking, now)).length;
  const free =
    Math.max(0, ROOMS.length * (CLOSE - OPEN) - bookedMinutes(bookings)) / 60;
  const stats = [
    {
      Icon: DoorOpen,
      tone: "purple",
      value: ROOMS.length,
      label: "meeting rooms",
      detail: "A space for every kind of meeting",
    },
    {
      Icon: CalendarDays,
      tone: "green",
      value: bookings.length,
      label: "reservations",
      detail: upcoming
        ? `${upcoming} upcoming or in progress`
        : "No upcoming reservations this day",
    },
    {
      Icon: Clock3,
      tone: "amber",
      value: `${Number.isInteger(free) ? free : free.toFixed(1)}h`,
      label: "unreserved",
      detail: "Across all rooms on this date",
    },
  ];
  return (
    <section className="day-overview" aria-label="Day overview">
      {stats.map(({ Icon, tone, value, label, detail }) => (
        <div className="overview-stat" key={label}>
          <span className={`overview-stat__icon overview-stat__icon--${tone}`}>
            <Icon />
          </span>
          <div>
            <strong>
              {value}
              <span>{label}</span>
            </strong>
            <p>{detail}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
