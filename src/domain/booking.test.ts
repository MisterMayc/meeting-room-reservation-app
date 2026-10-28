import { describe, expect, it } from "vitest";
import { dateString, isEnded, validateBooking } from "./booking";
import type { Booking, BookingDraft } from "./booking";
const now = new Date("2026-10-28T10:00:20");
const draft: BookingDraft = {
  date: "2026-10-29",
  roomId: "atlas",
  start: "10:00",
  end: "11:00",
};
const existing: Booking = { ...draft, id: "existing" };
describe("booking rules", () => {
  it.each([
    ["09:00", "09:30"],
    ["16:00", "18:00"],
    ["09:10", "09:40"],
  ])("accepts working hours and duration boundaries %s–%s", (start, end) =>
    expect(validateBooking({ ...draft, start, end }, [], now)).toBeUndefined(),
  );
  it.each([
    ["08:59", "09:30"],
    ["17:00", "18:01"],
    ["10:00", "10:00"],
    ["11:00", "10:00"],
    ["10:00", "10:29"],
    ["10:00", "12:01"],
    ["aa:bb", "12:00"],
  ])("rejects invalid interval %s–%s", (start, end) =>
    expect(validateBooking({ ...draft, start, end }, [], now)).toBeTruthy(),
  );
  it.each([
    ["10:30", "11:30"],
    ["10:00", "11:00"],
    ["10:15", "10:45"],
    ["09:30", "11:30"],
  ])("rejects all overlap shapes %s–%s", (start, end) =>
    expect(
      validateBooking({ ...draft, start, end }, [existing], now),
    ).toContain("already reserved"),
  );
  it.each([
    ["09:30", "10:00"],
    ["11:00", "11:30"],
  ])("allows touching boundaries", (start, end) =>
    expect(
      validateBooking({ ...draft, start, end }, [existing], now),
    ).toBeUndefined(),
  );
  it("excludes the edited record but still checks other records", () => {
    expect(validateBooking(draft, [existing], now, "existing")).toBeUndefined();
    expect(
      validateBooking(
        draft,
        [existing, { ...existing, id: "other" }],
        now,
        "existing",
      ),
    ).toContain("already reserved");
  });
  it("allows simultaneous reservations in separate rooms and dates", () => {
    expect(
      validateBooking({ ...draft, roomId: "sage" }, [existing], now),
    ).toBeUndefined();
    expect(
      validateBooking({ ...draft, date: "2026-10-30" }, [existing], now),
    ).toBeUndefined();
  });
  it("rejects past dates and elapsed minutes and accepts the next minute", () => {
    expect(
      validateBooking({ ...draft, date: "2026-10-27" }, [], now),
    ).toContain("passed");
    expect(
      validateBooking({ ...draft, date: "2026-10-28" }, [], now),
    ).toContain("passed");
    expect(
      validateBooking(
        { ...draft, date: "2026-10-28", start: "10:01" },
        [],
        now,
      ),
    ).toBeUndefined();
  });
  it("rejects impossible calendar dates", () =>
    expect(
      validateBooking({ ...draft, date: "2026-02-30" }, [], now),
    ).toContain("valid date"));
  it("keeps an ongoing reservation colored until its exact end", () => {
    expect(isEnded(existing, new Date("2026-10-29T10:30:00"))).toBe(false);
    expect(isEnded(existing, new Date("2026-10-29T11:00:00"))).toBe(true);
  });
  it("formats the local calendar day without UTC slicing", () =>
    expect(dateString(new Date(2026, 9, 28, 0, 1))).toBe("2026-10-28"));
});
