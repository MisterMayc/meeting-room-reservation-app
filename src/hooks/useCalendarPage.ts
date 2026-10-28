import { useCallback, useRef, useState } from "react";
import { dateString, localDateTime, minutes } from "../domain/booking";
import type { Booking, BookingDraft, RoomId } from "../domain/booking";
import { firstAvailableSlot, newReservationSlot } from "../domain/availability";
import { useBookings } from "./useBookings";
import { useClock } from "./useClock";
type Reservation = { draft: BookingDraft; booking?: Booking };
export function useCalendarPage() {
  const data = useBookings();
  const now = useClock();
  const [date, setDate] = useState(() => dateString(new Date()));
  const [notice, setNotice] = useState("");
  const dismissNotice = useCallback(() => setNotice(""), []);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const daily = data.bookings
    .filter((booking) => booking.date === date)
    .sort((a, b) => minutes(a.start) - minutes(b.start));
  const open = (next: Reservation) => {
    returnFocus.current = document.activeElement as HTMLElement;
    setReservation(next);
  };
  const create = () => {
    const draft = newReservationSlot(date, data.bookings, new Date());
    setDate(draft.date);
    open({ draft });
  };
  const createAt = (roomId: RoomId, start: string) => {
    const draft = firstAvailableSlot(
      date,
      data.bookings,
      new Date(),
      roomId,
      start,
    );
    if (draft) open({ draft });
    else
      setNotice("This time is no longer available. Choose another open time.");
  };
  const edit = (booking: Booking) =>
    open({
      booking,
      draft: {
        date: booking.date,
        roomId: booking.roomId,
        start: booking.start,
        end: booking.end,
        title: booking.title ?? "",
      },
    });
  const close = () => {
    setReservation(null);
    requestAnimationFrame(() => {
      const target = returnFocus.current;
      if (
        target?.isConnected &&
        !(target instanceof HTMLButtonElement && target.disabled)
      )
        target.focus();
      else document.getElementById("new-reservation")?.focus();
    });
  };
  const moveDate = (offset: number) => {
    const next = localDateTime(date);
    next.setDate(next.getDate() + offset);
    setDate(dateString(next));
  };
  return {
    ...data,
    now,
    date,
    setDate,
    daily,
    notice,
    setNotice,
    dismissNotice,
    reservation,
    create,
    createAt,
    edit,
    close,
    moveDate,
  };
}
