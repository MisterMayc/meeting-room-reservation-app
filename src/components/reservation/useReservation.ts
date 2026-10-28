import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { isStarted, validateBooking } from "../../domain/booking";
import type { Booking, BookingDraft } from "../../domain/booking";
import { bookingsApi } from "../../api/bookingsApi";
import { BookingApiError } from "../../api/http";
import type { ConflictDetails } from "./ConflictMessage";

export interface ReservationOptions {
  initial: BookingDraft;
  booking?: Booking;
  bookings: Booking[];
  now: Date;
  refresh: () => Promise<void>;
  onClose: () => void;
  onSaved: (message: string) => void;
  onCreateAttempt: () => Promise<void>;
}

export function useReservation({
  initial,
  booking,
  bookings,
  now,
  refresh,
  onClose,
  onSaved,
  onCreateAttempt,
}: ReservationOptions) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<ConflictDetails | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lock = useRef(false);
  const started = !!booking && isStarted(booking, now);
  const validation = validateBooking(draft, bookings, now, booking?.id);
  const close = () => {
    if (!lock.current) onClose();
  };
  const mutate = async (operation: () => Promise<unknown>, success: string) => {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError("");
    setConflict(null);
    try {
      await operation();
      let message = success;
      try {
        await refresh();
      } catch {
        message +=
          " The change was saved, but the calendar could not refresh. Please retry.";
      }
      onSaved(message);
      onClose();
    } catch (cause) {
      let message =
        cause instanceof Error
          ? cause.message
          : "Unable to update this reservation.";
      if (cause instanceof BookingApiError && cause.status === 409) {
        let refreshed = false;
        try {
          await refresh();
          refreshed = true;
        } catch {
          /* Preserve the draft and offer recovery in the conflict message. */
        }
        setConflict({ message, refreshed });
        return;
      }
      if (cause instanceof BookingApiError && cause.status === 404) {
        try {
          await refresh();
          message +=
            " Availability has been refreshed. Your input is preserved.";
        } catch {
          message +=
            " Availability could not refresh. Your input is preserved.";
        }
      }
      setError(message);
    } finally {
      if (!booking) await onCreateAttempt();
      lock.current = false;
      setPending(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (started || lock.current) return;
    if (validation) {
      setConflict(null);
      setError(validation);
      return;
    }
    void mutate(
      () => bookingsApi.save(draft, booking?.id),
      booking ? "Reservation updated." : "Your room is reserved.",
    );
  };
  const remove = () => {
    if (booking)
      void mutate(() => bookingsApi.remove(booking.id), "Reservation deleted.");
  };
  const retry = async () => {
    try {
      await refresh();
      if (conflict) setConflict({ ...conflict, refreshed: true });
      else
        setError("Availability refreshed. Review your times and save again.");
    } catch {
      if (conflict) setConflict({ ...conflict, refreshed: false });
      else
        setError(
          "Availability could not refresh. Try again. Your input is preserved.",
        );
    }
  };
  return {
    draft,
    setDraft,
    error,
    conflict,
    pending,
    started,
    validation,
    confirmDelete,
    setConfirmDelete,
    close,
    submit,
    remove,
    retry,
  };
}
