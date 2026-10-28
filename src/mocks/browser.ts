import { setupWorker } from "msw/browser";
import { createBookingRepository } from "../data/bookings";
import { createBookingHandlers } from "./handlers";
export const worker = setupWorker(
  ...createBookingHandlers({
    repository: () => createBookingRepository(window.localStorage),
  }),
);
let startup: Promise<unknown> | undefined;
export function startDemoApi() {
  // This is a hosted assessment demo: interception is intentional in all builds.
  return (startup ??= worker
    .start({
      serviceWorker: { url: "/mockServiceWorker.js" },
      onUnhandledRequest: "bypass",
      quiet: true,
    })
    .catch((error) => {
      startup = undefined;
      throw error;
    }));
}
