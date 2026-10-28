import { describe, expect, it } from "vitest";
import {
  DATA_KEY,
  INITIALIZED_KEY,
  createBookingRepository,
  generateDemoBookings,
} from "./bookings";
import {
  CLOSE,
  OPEN,
  ROOMS,
  localDateTime,
  minutes,
  overlaps,
} from "../domain/booking";
import type { BookingDraft } from "../domain/booking";
import { memoryStorage } from "../test/memoryStorage";
const now = () => new Date("2026-10-28T08:00:00");
const draft: BookingDraft = {
  date: "2026-12-01",
  roomId: "atlas",
  start: "10:00",
  end: "11:00",
  title: "Planning",
};
describe("local booking repository", () => {
  it("seeds all Oct–Nov 2026 working days, all rooms, with valid nonoverlapping intervals", () => {
    const data = generateDemoBookings(2026);
    expect(new Set(data.map((b) => b.date)).size).toBe(43);
    for (const booking of data) {
      expect(booking.date >= "2026-10-01" && booking.date <= "2026-11-30").toBe(
        true,
      );
      expect([0, 6]).not.toContain(localDateTime(booking.date).getDay());
      expect(minutes(booking.start)).toBeGreaterThanOrEqual(OPEN);
      expect(minutes(booking.end)).toBeLessThanOrEqual(CLOSE);
      expect(
        minutes(booking.end) - minutes(booking.start),
      ).toBeGreaterThanOrEqual(30);
      expect(minutes(booking.end) - minutes(booking.start)).toBeLessThanOrEqual(
        120,
      );
      expect(
        data.some(
          (other) => other.id !== booking.id && overlaps(booking, other),
        ),
      ).toBe(false);
    }
    for (const day of new Set(data.map((b) => b.date)))
      expect(
        new Set(data.filter((b) => b.date === day).map((b) => b.roomId)).size,
      ).toBe(ROOMS.length);
  });
  it("initializes once and never replaces user-created records", async () => {
    const storage = memoryStorage();
    const repository = createBookingRepository(storage, now);
    const first = await repository.load();
    const booking = await repository.save(draft);
    expect(storage.getItem(INITIALIZED_KEY)).toBe("1");
    expect(await createBookingRepository(storage, now).load()).toEqual([
      ...first,
      booking,
    ]);
    expect(Array.isArray(JSON.parse(storage.getItem(DATA_KEY)!))).toBe(true);
  });
  it("does not recreate bookings after deleting all data or removing only the data key", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    const repo = createBookingRepository(storage, now);
    const booking = await repo.save(draft);
    await repo.remove(booking.id);
    expect(await repo.load()).toEqual([]);
    storage.removeItem(DATA_KEY);
    expect(await repo.load()).toEqual([]);
  });
  it("preserves an existing data key even when the initialization marker is missing", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    expect(await createBookingRepository(storage, now).load()).toEqual([]);
    expect(storage.getItem(INITIALIZED_KEY)).toBe("1");
  });
  it("edits in place, excludes itself, and deletes persistently", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    const repo = createBookingRepository(storage, now);
    const booking = await repo.save(draft);
    await repo.save({ ...draft, title: "Updated" }, booking.id);
    expect(await repo.load()).toEqual([{ ...booking, title: "Updated" }]);
    await repo.remove(booking.id);
    expect(await createBookingRepository(storage, now).load()).toEqual([]);
  });
  it("rechecks latest storage on save and rejects stale availability without changing data", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    const a = createBookingRepository(storage, now),
      b = createBookingRepository(storage, now);
    await a.load();
    await b.save(draft);
    const before = storage.getItem(DATA_KEY);
    await expect(a.save(draft)).rejects.toMatchObject({ code: "conflict" });
    expect(storage.getItem(DATA_KEY)).toBe(before);
  });
  it("rejects malformed data without overwriting it or seeding again", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "not json");
    await expect(
      createBookingRepository(storage, now).load(),
    ).rejects.toMatchObject({ code: "storage" });
    expect(storage.getItem(DATA_KEY)).toBe("not json");
    expect(storage.getItem(INITIALIZED_KEY)).toBeNull();
  });
  it("keeps data intact when storage quota prevents saving", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    storage.setItem(INITIALIZED_KEY, "1");
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    await expect(
      createBookingRepository(storage, now).save(draft),
    ).rejects.toMatchObject({ code: "storage" });
    expect(storage.getItem(DATA_KEY)).toBe("[]");
  });
  it("does not silently recreate a remotely deleted edit", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    await expect(
      createBookingRepository(storage, now).save(draft, "missing"),
    ).rejects.toMatchObject({ code: "missing" });
  });
  it("validates time again when saving rather than trusting earlier UI validation", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    await expect(
      createBookingRepository(
        storage,
        () => new Date("2026-12-01T10:01:00"),
      ).save(draft),
    ).rejects.toMatchObject({ code: "validation" });
    expect(storage.getItem(DATA_KEY)).toBe("[]");
  });
});
