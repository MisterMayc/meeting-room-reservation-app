import { describe, expect, it } from "vitest";
import { firstAvailableSlot, newReservationSlot } from "./availability";
import { ROOMS } from "./booking";
import type { Booking } from "./booking";
const clock = (value: string) => new Date(value);
function filledDay(date: string): Booking[] {
  return ROOMS.flatMap((room) =>
    [
      ["09:00", "11:00"],
      ["11:00", "13:00"],
      ["13:00", "15:00"],
      ["15:00", "17:00"],
      ["17:00", "18:00"],
    ].map(([start, end]) => ({
      id: `${date}-${room.id}-${start}`,
      roomId: room.id,
      date,
      start,
      end,
    })),
  );
}
describe("new reservation navigation", () => {
  it("moves a past selection to today when there is room for a valid reservation", () => {
    expect(
      newReservationSlot("2026-10-01", [], clock("2026-10-28T10:12:20")),
    ).toMatchObject({ date: "2026-10-28", start: "10:13", end: "10:43" });
  });
  it("uses opening time when today has not started", () => {
    expect(
      newReservationSlot("2026-10-01", [], clock("2026-10-28T07:00:00")),
    ).toMatchObject({ date: "2026-10-28", start: "09:00" });
  });
  it("allows exactly the final 30 minutes of a working day", () => {
    expect(
      newReservationSlot("2026-10-01", [], clock("2026-10-28T17:30:00")),
    ).toMatchObject({ date: "2026-10-28", start: "17:30", end: "18:00" });
  });
  it.each(["17:30:01", "18:00:00", "23:59:59"])(
    "advances to tomorrow at %s",
    (time) => {
      expect(
        newReservationSlot("2026-10-01", [], clock(`2026-10-28T${time}`)),
      ).toMatchObject({ date: "2026-10-29", start: "09:00" });
    },
  );
  it("moves a Friday after work to Monday, crossing the month boundary", () => {
    expect(
      newReservationSlot("2026-10-01", [], clock("2026-10-30T18:01:00")),
    ).toMatchObject({ date: "2026-11-02", start: "09:00" });
  });
  it.each(["2026-10-31T10:00:00", "2026-11-01T10:00:00"])(
    "skips the weekend when redirecting from the past at %s",
    (time) => {
      expect(newReservationSlot("2026-10-01", [], clock(time)).date).toBe(
        "2026-11-02",
      );
    },
  );
  it("keeps a usable selected future date", () => {
    expect(
      newReservationSlot("2026-11-10", [], clock("2026-10-28T19:00:00")).date,
    ).toBe("2026-11-10");
  });
  it("advances past a fully booked day without creating a conflicting draft", () => {
    const bookings = [
      ...filledDay("2026-10-28"),
      ...filledDay("2026-10-29"),
      ...filledDay("2026-10-30"),
    ];
    expect(
      newReservationSlot("2026-10-01", bookings, clock("2026-10-28T10:00:00"))
        .date,
    ).toBe("2026-11-02");
  });
  it("checks all rooms before abandoning today", () => {
    const bookings = filledDay("2026-10-28").filter(
      (booking) => booking.roomId !== "cove",
    );
    expect(
      newReservationSlot("2026-10-01", bookings, clock("2026-10-28T10:00:00")),
    ).toMatchObject({ date: "2026-10-28", roomId: "cove" });
  });
  it("crosses the year boundary using local calendar dates", () => {
    expect(
      newReservationSlot("2026-10-01", [], clock("2026-12-31T18:00:00")).date,
    ).toBe("2027-01-01");
  });
});
describe("calendar slot selection", () => {
  it("preserves the exact clicked room, time, and date", () => {
    expect(
      firstAvailableSlot(
        "2026-11-02",
        [],
        clock("2026-10-28T10:00:00"),
        "sage",
        "14:30",
      ),
    ).toMatchObject({
      date: "2026-11-02",
      roomId: "sage",
      start: "14:30",
      end: "15:00",
    });
  });
  it("does not shift an occupied or elapsed clicked slot", () => {
    expect(
      firstAvailableSlot(
        "2026-10-28",
        filledDay("2026-10-28"),
        clock("2026-10-28T10:00:00"),
        "sage",
        "14:30",
      ),
    ).toBeUndefined();
    expect(
      firstAvailableSlot(
        "2026-10-28",
        [],
        clock("2026-10-28T10:00:01"),
        "sage",
        "10:00",
      ),
    ).toBeUndefined();
  });
  it("finds a minute-precision gap between existing reservations", () => {
    const bookings: Booking[] = [
      {
        id: "a",
        roomId: "atlas",
        date: "2026-10-28",
        start: "09:00",
        end: "10:15",
      },
      {
        id: "b",
        roomId: "atlas",
        date: "2026-10-28",
        start: "10:45",
        end: "11:30",
      },
    ];
    expect(
      firstAvailableSlot(
        "2026-10-28",
        bookings,
        clock("2026-10-28T10:00:00"),
        "atlas",
      ),
    ).toMatchObject({ start: "10:15", end: "10:45" });
  });
});
