import {
  CLOSE,
  MIN_DURATION,
  OPEN,
  ROOMS,
  dateString,
  localDateTime,
  minutes,
  overlaps,
  timeString,
} from "./booking";
import type { Booking, BookingDraft, RoomId } from "./booking";

export function firstAvailableSlot(
  date: string,
  bookings: Booking[],
  now: Date,
  roomId?: RoomId,
  start?: string,
): BookingDraft | undefined {
  if (date < dateString(now)) return;
  const earliest =
    date === dateString(now)
      ? Math.max(
          OPEN,
          Math.ceil(
            now.getHours() * 60 +
              now.getMinutes() +
              now.getSeconds() / 60 +
              now.getMilliseconds() / 60_000,
          ),
        )
      : OPEN;
  const daily = bookings.filter((booking) => booking.date === date);
  for (const room of ROOMS.filter((room) => !roomId || room.id === roomId)) {
    let cursor = start ? minutes(start) : earliest;
    const candidate = (): BookingDraft => ({
      date,
      roomId: room.id,
      start: timeString(cursor),
      end: timeString(cursor + MIN_DURATION),
      title: "",
    });
    if (start) {
      if (
        cursor >= earliest &&
        cursor + MIN_DURATION <= CLOSE &&
        !daily.some((booking) => overlaps(candidate(), booking))
      )
        return candidate();
      continue;
    }
    const occupied = daily
      .filter((booking) => booking.roomId === room.id)
      .sort((a, b) => minutes(a.start) - minutes(b.start));
    for (const booking of occupied) {
      if (minutes(booking.start) - cursor >= MIN_DURATION) break;
      cursor = Math.max(cursor, minutes(booking.end));
    }
    if (cursor + MIN_DURATION <= CLOSE) return candidate();
  }
}

/** Keep a usable selected date; otherwise advance through weekdays until a room is free. */
export function newReservationSlot(
  selectedDate: string,
  bookings: Booking[],
  now: Date,
): BookingDraft {
  const today = dateString(now);
  if (selectedDate >= today) {
    const selectedSlot = firstAvailableSlot(selectedDate, bookings, now);
    if (selectedSlot) return selectedSlot;
  }
  const day = localDateTime(selectedDate < today ? today : selectedDate);
  // Finite stored bookings cannot fill every future day.
  for (;;) {
    if (day.getDay() !== 0 && day.getDay() !== 6) {
      const slot = firstAvailableSlot(dateString(day), bookings, now);
      if (slot) return slot;
    }
    day.setDate(day.getDate() + 1);
  }
}
