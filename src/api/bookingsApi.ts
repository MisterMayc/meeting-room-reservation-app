import { isBooking } from "../domain/booking";
import type { BookingRepository } from "../data/bookings";
import { BookingApiError, jsonBody, requestJson } from "./http";
export function createBookingsApi(base = "/api"): BookingRepository {
  return {
    async load() {
      const bookings = await requestJson<unknown>(`${base}/bookings`);
      if (!Array.isArray(bookings) || !bookings.every(isBooking))
        throw new BookingApiError(
          "The booking API returned invalid booking data.",
          502,
        );
      return bookings;
    },
    async save(draft, id) {
      const booking = await requestJson<unknown>(
        `${base}/bookings${id ? `/${encodeURIComponent(id)}` : ""}`,
        { method: id ? "PATCH" : "POST", body: jsonBody(draft) },
      );
      if (!isBooking(booking))
        throw new BookingApiError(
          "The saved booking response was invalid. Refresh availability before trying again.",
          502,
        );
      return booking;
    },
    async remove(id) {
      await requestJson<void>(`${base}/bookings/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}
export const bookingsApi = createBookingsApi();
