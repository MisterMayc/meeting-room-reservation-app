import { ConflictMessage } from "./ConflictMessage";
import { CalendarDays } from "lucide-react";
import { localDateTime } from "../../domain/booking";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Modal } from "../ui/Modal";
import { ReservationActions } from "./ReservationActions";
import { ReservationForm } from "./ReservationForm";
import { useReservation } from "./useReservation";
import type { ReservationOptions } from "./useReservation";
import "./ReservationDialog.css";

export function ReservationDialog(props: ReservationOptions) {
  const form = useReservation(props);
  const title = props.booking
    ? form.started
      ? "Reservation details"
      : "Edit reservation"
    : "New reservation";
  const description = form.started
    ? "This reservation has started. You can view or delete it."
    : "Choose a room and a time within 09:00–18:00.";
  return (
    <Modal
      title={title}
      description={description}
      pending={form.pending}
      onClose={form.close}
    >
      <div className="reservation-date">
        <CalendarDays />
        {localDateTime(props.initial.date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      {form.conflict && (
        <ConflictMessage
          conflict={form.conflict}
          onRetry={form.retry}
          pending={form.pending}
        />
      )}
      {form.error && (
        <ErrorMessage
          message={form.error}
          onRetry={form.retry}
          pending={form.pending}
        />
      )}
      <form onSubmit={form.submit}>
        <ReservationForm
          draft={form.draft}
          now={props.now}
          disabled={form.pending || form.started}
          validation={form.started ? undefined : form.validation}
          onChange={form.setDraft}
        />
        <ReservationActions
          editing={!!props.booking}
          started={form.started}
          pending={form.pending}
          confirming={form.confirmDelete}
          onConfirm={form.setConfirmDelete}
          onDelete={form.remove}
          onClose={form.close}
        />
      </form>
    </Modal>
  );
}
