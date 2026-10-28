import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DayCalendar } from "./DayCalendar";
import type { Booking } from "../../domain/booking";
const now = new Date("2026-10-28T12:00:00");
const bookings: Booking[] = [
  {
    id: "ended",
    roomId: "atlas",
    date: "2026-10-28",
    start: "10:00",
    end: "11:00",
  },
  {
    id: "boundary",
    roomId: "sage",
    date: "2026-10-28",
    start: "11:00",
    end: "12:00",
  },
  {
    id: "ongoing",
    roomId: "amber",
    date: "2026-10-28",
    start: "11:30",
    end: "12:30",
  },
  {
    id: "future",
    roomId: "cove",
    date: "2026-10-28",
    start: "14:00",
    end: "15:00",
  },
];
const render = (date = "2026-10-28", clock = now) =>
  renderToStaticMarkup(
    <DayCalendar
      date={date}
      now={clock}
      bookings={bookings}
      onCreate={() => {}}
      onEdit={() => {}}
    />,
  );
describe("calendar time presentation", () => {
  it("marks exactly fully ended bookings gray, retaining the ongoing room color", () => {
    const html = render();
    expect(html.match(/class="booking booking-past/g)).toHaveLength(2);
    expect(html.match(/booking-ongoing/g)).toHaveLength(1);
    expect(html).toContain("Amber, 11:30 to 12:30, in progress");
  });
  it("places the red current-time line on today at the correct working-day offset", () => {
    expect(render()).toContain("--now:33.33333333333333%");
    expect(render()).toContain("Current time 12:00");
  });
  it("hides the current-time line outside working hours and on other dates", () => {
    expect(render("2026-10-29")).not.toContain('class="now-line"');
    expect(render("2026-10-28", new Date("2026-10-28T20:00:00"))).not.toContain(
      'class="now-line"',
    );
  });
});
