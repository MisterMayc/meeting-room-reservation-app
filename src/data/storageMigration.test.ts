import { describe, expect, it } from "vitest";
import { createBookingRepository, DATA_KEY, INITIALIZED_KEY } from "./bookings";
import { migrateBookingStorage } from "./storageMigration";
import { memoryStorage } from "../test/memoryStorage";
const oldData = "roomwise.bookings.v1";
const oldMarker = "roomwise.initialized.v1";
const existing = [
  {
    id: "existing",
    roomId: "sage",
    date: "2026-11-02",
    start: "10:00",
    end: "11:00",
    title: "Keep this meeting",
  },
];
describe("storage key migration", () => {
  it("preserves existing bookings and the marker under neutral keys", async () => {
    const storage = memoryStorage();
    storage.setItem(oldData, JSON.stringify(existing));
    storage.setItem(oldMarker, "1");
    expect(await createBookingRepository(storage).load()).toEqual(existing);
    expect(JSON.parse(storage.getItem(DATA_KEY)!)).toEqual(existing);
    expect(storage.getItem(INITIALIZED_KEY)).toBe("1");
    expect(storage.getItem(oldData)).toBeNull();
    expect(storage.getItem(oldMarker)).toBeNull();
  });
  it("never overwrites an existing empty new data key", async () => {
    const storage = memoryStorage();
    storage.setItem(DATA_KEY, "[]");
    storage.setItem(oldData, JSON.stringify(existing));
    expect(await createBookingRepository(storage).load()).toEqual([]);
  });
  it("preserves an initialized-but-empty demo without reseeding", async () => {
    const storage = memoryStorage();
    storage.setItem(oldMarker, "1");
    expect(await createBookingRepository(storage).load()).toEqual([]);
    expect(storage.getItem(DATA_KEY)).toBeNull();
  });
  it("keeps legacy data if the new marker cannot be written", () => {
    const storage = memoryStorage();
    storage.setItem(oldData, JSON.stringify(existing));
    storage.setItem(oldMarker, "1");
    const set = storage.setItem;
    storage.setItem = (key, value) => {
      if (key === INITIALIZED_KEY) throw new Error("Quota");
      set(key, value);
    };
    expect(() => migrateBookingStorage(storage)).toThrow("Quota");
    expect(storage.getItem(oldData)).toBe(JSON.stringify(existing));
    expect(storage.getItem(oldMarker)).toBe("1");
  });
});
