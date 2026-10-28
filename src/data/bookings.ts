import {
  CLOSE,
  OPEN,
  ROOMS,
  dateString,
  isBooking,
  minutes,
  overlaps,
  timeString,
  validateBooking,
} from "../domain/booking";
import type { Booking, BookingDraft } from "../domain/booking";

import { DATA_KEY, INITIALIZED_KEY } from "./storageKeys";
import { migrateBookingStorage } from "./storageMigration";
export { DATA_KEY, INITIALIZED_KEY } from "./storageKeys";
const TITLES = [
  "Design review",
  "Team stand-up",
  "Product planning",
  "Project kickoff",
  "Sprint retrospective",
  "Client catch-up",
  "Ideas & coffee",
  "Weekly sync",
  "Research session",
  "Engineering huddle",
];
export class BookingError extends Error {
  constructor(
    message: string,
    public readonly code: "conflict" | "storage" | "validation" | "missing",
  ) {
    super(message);
  }
}
export function generateDemoBookings(
  year: number,
  random: () => number = Math.random,
): Booking[] {
  const result: Booking[] = [];
  const day = new Date(year, 9, 1);
  while (day.getMonth() < 11 && day.getFullYear() === year) {
    if (day.getDay() !== 0 && day.getDay() !== 6) {
      for (const room of ROOMS) {
        let cursor = OPEN + Math.floor(random() * 3) * 30;
        while (cursor + 30 <= CLOSE) {
          const duration = (1 + Math.floor(random() * 4)) * 30;
          if (cursor + duration > CLOSE) break;
          const date = dateString(day);
          result.push({
            id: `demo-${date}-${room.id}-${cursor}`,
            roomId: room.id,
            date,
            start: timeString(cursor),
            end: timeString(cursor + duration),
            title: TITLES[Math.floor(random() * TITLES.length)],
          });
          cursor += duration + (1 + Math.floor(random() * 3)) * 30;
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return result;
}
export interface BookingRepository {
  load(): Promise<Booking[]>;
  save(draft: BookingDraft, id?: string): Promise<Booking>;
  remove(id: string): Promise<void>;
}
export function createBookingRepository(
  storage: Storage,
  clock = () => new Date(),
): BookingRepository {
  const read = (): Booking[] => {
    const raw = storage.getItem(DATA_KEY);
    if (raw === null) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BookingError(
        "Saved data could not be read. It has been preserved; check browser storage before continuing.",
        "storage",
      );
    }
    if (
      !Array.isArray(parsed) ||
      !parsed.every(isBooking) ||
      new Set(parsed.map((b) => b.id)).size !== parsed.length
    )
      throw new BookingError(
        "Saved data has an unsupported format. Existing data has not been replaced.",
        "storage",
      );
    return parsed;
  };
  const safely = <T>(run: () => T): T => {
    try {
      return run();
    } catch (error) {
      if (error instanceof BookingError) throw error;
      throw new BookingError(
        "Browser storage is unavailable or full. Your changes were not saved. Check storage access and try again.",
        "storage",
      );
    }
  };
  const initialize = () =>
    safely(() => {
      migrateBookingStorage(storage);
      // A data key always wins, even when it contains an empty array.
      if (storage.getItem(DATA_KEY) !== null) {
        const bookings = read();
        if (storage.getItem(INITIALIZED_KEY) === null)
          storage.setItem(INITIALIZED_KEY, "1");
        return bookings;
      }
      if (storage.getItem(INITIALIZED_KEY) !== null) return [];
      const bookings = generateDemoBookings(2026);
      storage.setItem(DATA_KEY, JSON.stringify(bookings));
      storage.setItem(INITIALIZED_KEY, "1");
      return bookings;
    });
  return {
    async load() {
      return initialize();
    },
    async save(draft, id) {
      return safely(() => {
        const bookings = initialize();
        if (id && !bookings.some((b) => b.id === id))
          throw new BookingError(
            "This reservation was removed in another tab. Your input is still here.",
            "missing",
          );
        const error = validateBooking(draft, bookings, clock(), id);
        if (error)
          throw new BookingError(
            error,
            bookings.some((b) => b.id !== id && overlaps(draft, b))
              ? "conflict"
              : "validation",
          );
        const booking: Booking = {
          id: id ?? crypto.randomUUID(),
          roomId: draft.roomId,
          date: draft.date,
          start: draft.start,
          end: draft.end,
          ...(draft.title?.trim() ? { title: draft.title.trim() } : {}),
        };
        const next = [...bookings.filter((b) => b.id !== id), booking];
        storage.setItem(DATA_KEY, JSON.stringify(next));
        return booking;
      });
    },
    async remove(id) {
      safely(() => {
        const bookings = initialize();
        storage.setItem(
          DATA_KEY,
          JSON.stringify(bookings.filter((b) => b.id !== id)),
        );
      });
    },
  };
}
export const bookedMinutes = (bookings: Booking[]) =>
  bookings.reduce(
    (sum, booking) => sum + minutes(booking.end) - minutes(booking.start),
    0,
  );
