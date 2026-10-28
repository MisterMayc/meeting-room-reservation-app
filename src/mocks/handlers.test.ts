import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  createBookingRepository,
  DATA_KEY,
  INITIALIZED_KEY,
} from "../data/bookings";
import { createBookingsApi } from "../api/bookingsApi";
import { memoryStorage } from "../test/memoryStorage";
import { createBookingHandlers } from "./handlers";
const server = setupServer();
const base = "http://localhost/api";
const now = () => new Date("2026-10-28T08:00:00");
const draft = {
  date: "2026-12-01",
  roomId: "atlas",
  start: "10:00",
  end: "11:00",
  title: "My meeting",
};
let storage: Storage;
const request = (path: string, method = "GET", body?: unknown) =>
  fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
const arm = () => request("/demo/conflict", "PUT", { armed: true });
const armed = async () =>
  (await (await request("/demo/conflict")).json()).armed;
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  storage = memoryStorage();
  storage.setItem(DATA_KEY, "[]");
  storage.setItem(INITIALIZED_KEY, "1");
  server.resetHandlers(
    ...createBookingHandlers({
      repository: () => createBookingRepository(storage, now),
      clock: now,
      latency: 0,
    }),
  );
});
afterAll(() => server.close());
describe("HTTP booking API backed by local storage", () => {
  it("creates, reads, partially updates, and deletes bookings through HTTP", async () => {
    const created = await request("/bookings", "POST", draft);
    expect(created.status).toBe(201);
    const booking = await created.json();
    expect(await (await request("/bookings?date=2026-12-01")).json()).toEqual([
      booking,
    ]);
    const updated = await request(`/bookings/${booking.id}`, "PATCH", {
      title: "Updated meeting",
    });
    expect(await updated.json()).toEqual({
      ...booking,
      title: "Updated meeting",
    });
    expect((await request(`/bookings/${booking.id}`, "DELETE")).status).toBe(
      204,
    );
    expect(await (await request("/bookings")).json()).toEqual([]);
  });
  it("persists a competing reservation, returns real HTTP 409, and consumes the toggle once", async () => {
    await arm();
    const response = await request("/bookings", "POST", draft);
    expect(response.status).toBe(409);
    expect((await response.json()).message).toContain("Another reservation");
    const bookings = await (await request("/bookings")).json();
    expect(bookings).toHaveLength(1);
    expect(bookings[0]).toMatchObject({
      ...draft,
      title: "Simulated competing reservation",
    });
    expect(JSON.parse(storage.getItem(DATA_KEY)!)).toEqual(bookings);
    expect(await armed()).toBe(false);
    expect(
      (
        await request("/bookings", "POST", {
          ...draft,
          start: "11:00",
          end: "11:30",
        })
      ).status,
    ).toBe(201);
  });
  it("does not consume the simulation on edits or deletes", async () => {
    const booking = await (await request("/bookings", "POST", draft)).json();
    await arm();
    expect(
      (await request(`/bookings/${booking.id}`, "PATCH", { title: "Edited" }))
        .status,
    ).toBe(200);
    expect((await request(`/bookings/${booking.id}`, "DELETE")).status).toBe(
      204,
    );
    expect(await armed()).toBe(true);
    expect((await request("/bookings", "POST", draft)).status).toBe(409);
  });
  it("does not consume the simulation on a validation failure", async () => {
    await arm();
    expect(
      (await request("/bookings", "POST", { ...draft, end: "10:10" })).status,
    ).toBe(422);
    expect(await armed()).toBe(true);
    expect(storage.getItem(DATA_KEY)).toBe("[]");
    expect((await request("/bookings", "POST", draft)).status).toBe(409);
  });
  it("also reports naturally stale availability without inserting another competitor", async () => {
    await request("/bookings", "POST", draft);
    await arm();
    expect((await request("/bookings", "POST", draft)).status).toBe(409);
    expect(JSON.parse(storage.getItem(DATA_KEY)!)).toHaveLength(1);
    expect(await armed()).toBe(true);
  });
  it("returns recoverable storage errors without pretending a conflict was written", async () => {
    storage.setItem = () => {
      throw new Error("Quota");
    };
    await arm();
    expect((await request("/bookings", "POST", draft)).status).toBe(503);
    expect(storage.getItem(DATA_KEY)).toBe("[]");
  });
  it("validates merged partial edits and leaves storage unchanged after rejection", async () => {
    const booking = await (await request("/bookings", "POST", draft)).json();
    const before = storage.getItem(DATA_KEY);
    expect(
      (await request(`/bookings/${booking.id}`, "PATCH", { end: "10:10" }))
        .status,
    ).toBe(422);
    expect(storage.getItem(DATA_KEY)).toBe(before);
    expect(
      (await request("/bookings/missing", "PATCH", { title: "Gone" })).status,
    ).toBe(404);
  });
  it("rejects malformed input and invalid date queries", async () => {
    expect((await request("/bookings?date=not-a-date")).status).toBe(400);
    expect(
      (await fetch(`${base}/bookings`, { method: "POST", body: "{" })).status,
    ).toBe(400);
    expect(
      (await request("/bookings", "POST", { ...draft, start: null })).status,
    ).toBe(422);
  });
  it("applies one simulation when independent create requests arrive concurrently", async () => {
    await arm();
    const responses = await Promise.all([
      request("/bookings", "POST", draft),
      request("/bookings", "POST", { ...draft, roomId: "sage" }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    expect(
      JSON.parse(storage.getItem(DATA_KEY)!).filter(
        (booking: { title: string }) =>
          booking.title === "Simulated competing reservation",
      ),
    ).toHaveLength(1);
  });
});
describe("replaceable HTTP client", () => {
  it("exposes status 409 to conflict handling and loads the competing record on refresh", async () => {
    const api = createBookingsApi(base);
    await arm();
    await expect(
      api.save(draft as Parameters<typeof api.save>[0]),
    ).rejects.toMatchObject({ status: 409 });
    expect(await api.load()).toEqual([
      expect.objectContaining({ title: "Simulated competing reservation" }),
    ]);
  });
  it("surfaces transport failures as retryable errors", async () => {
    server.use(http.get(`${base}/bookings`, () => HttpResponse.error()));
    await expect(createBookingsApi(base).load()).rejects.toMatchObject({
      status: 0,
    });
  });
  it("rejects malformed success payloads rather than treating them as bookings", async () => {
    server.use(
      http.get(`${base}/bookings`, () => HttpResponse.json({ invalid: true })),
    );
    await expect(createBookingsApi(base).load()).rejects.toMatchObject({
      status: 502,
    });
  });
});
