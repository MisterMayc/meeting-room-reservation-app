import { DATA_KEY, INITIALIZED_KEY } from "./storageKeys";

// Only this compatibility migration knows the keys used by the first demo.
const LEGACY_DATA_KEY = "roomwise.bookings.v1";
const LEGACY_INITIALIZED_KEY = "roomwise.initialized.v1";

export function migrateBookingStorage(storage: Storage): void {
  const legacyData = storage.getItem(LEGACY_DATA_KEY);
  const legacyMarker = storage.getItem(LEGACY_INITIALIZED_KEY);
  if (storage.getItem(DATA_KEY) === null && legacyData !== null)
    storage.setItem(DATA_KEY, legacyData);
  if (storage.getItem(INITIALIZED_KEY) === null && legacyMarker !== null)
    storage.setItem(INITIALIZED_KEY, legacyMarker);
  // Remove the old keys only after every required write has succeeded.
  if (legacyData !== null) storage.removeItem(LEGACY_DATA_KEY);
  if (legacyMarker !== null) storage.removeItem(LEGACY_INITIALIZED_KEY);
}
