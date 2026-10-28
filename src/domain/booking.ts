export const ROOMS = [
  {
    id: "atlas",
    name: "Atlas",
    kind: "Boardroom",
    seats: 12,
    color: "#7358ca",
    tint: "#ede7fb",
    equipment: "Display · Video calls",
  },
  {
    id: "sage",
    name: "Sage",
    kind: "Meeting room",
    seats: 6,
    color: "#39836b",
    tint: "#e2f1e9",
    equipment: "Whiteboard · Display",
  },
  {
    id: "amber",
    name: "Amber",
    kind: "Creative studio",
    seats: 8,
    color: "#ba792a",
    tint: "#fbefd9",
    equipment: "Whiteboard · Video calls",
  },
  {
    id: "cove",
    name: "Cove",
    kind: "Focus room",
    seats: 4,
    color: "#457eaf",
    tint: "#e4effa",
    equipment: "Display · Quiet space",
  },
] as const;
export type RoomId = (typeof ROOMS)[number]["id"];
export interface Booking {
  id: string;
  roomId: RoomId;
  date: string;
  start: string;
  end: string;
  title?: string;
}
export type BookingDraft = Omit<Booking, "id">;
export const OPEN = 9 * 60;
export const CLOSE = 18 * 60;
export const MIN_DURATION = 30;
export const MAX_DURATION = 120;
export const minutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const timeString = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
export const dateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const localDateTime = (date: string, time = "00:00") =>
  new Date(`${date}T${time}:00`);
export const isEnded = (booking: Booking, now: Date) =>
  localDateTime(booking.date, booking.end) <= now;
export const isStarted = (booking: Booking, now: Date) =>
  localDateTime(booking.date, booking.start) < now;
export const overlaps = (a: BookingDraft, b: BookingDraft) =>
  a.date === b.date &&
  a.roomId === b.roomId &&
  minutes(a.start) < minutes(b.end) &&
  minutes(a.end) > minutes(b.start);
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(localDateTime(value).getTime()) &&
    dateString(localDateTime(value)) === value
  );
}
export function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const b = value as Booking;
  return (
    typeof b.id === "string" &&
    b.id.length > 0 &&
    ROOMS.some((r) => r.id === b.roomId) &&
    typeof b.date === "string" &&
    validDate(b.date) &&
    typeof b.start === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(b.start) &&
    typeof b.end === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(b.end) &&
    minutes(b.start) >= OPEN &&
    minutes(b.end) <= CLOSE &&
    minutes(b.end) - minutes(b.start) >= MIN_DURATION &&
    minutes(b.end) - minutes(b.start) <= MAX_DURATION &&
    (b.title === undefined || typeof b.title === "string")
  );
}
export function validateBooking(
  draft: BookingDraft,
  bookings: Booking[],
  now: Date,
  excludeId?: string,
): string | undefined {
  if (!validDate(draft.date)) return "Choose a valid date.";
  if (!ROOMS.some((r) => r.id === draft.roomId))
    return "Choose a meeting room.";
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.start) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.end)
  )
    return "Enter valid start and end times.";
  const start = minutes(draft.start),
    end = minutes(draft.end);
  if (start < OPEN || end > CLOSE || end < OPEN || start > CLOSE)
    return "Reservations must be within 09:00–18:00.";
  if (start >= end) return "End time must be after start time.";
  if (end - start < MIN_DURATION || end - start > MAX_DURATION)
    return "Reserve a room for 30 minutes to 2 hours.";
  if (localDateTime(draft.date, draft.start) < now)
    return "This start time has passed. Choose a future time.";
  if (bookings.some((b) => b.id !== excludeId && overlaps(draft, b)))
    return "This room is already reserved during that time. Choose another time or room.";
}
