import { delay, http, HttpResponse } from "msw";
import { BookingError } from "../data/bookings";
import type { BookingRepository } from "../data/bookings";
import { overlaps, validDate, validateBooking } from "../domain/booking";
import type { BookingDraft } from "../domain/booking";
import { createConflictScenario } from "./conflictScenario";
interface Options {
  repository: () => BookingRepository;
  clock?: () => Date;
  latency?: number;
}
const errorResponse = (message: string, status: number) =>
  HttpResponse.json({ message }, { status });
const statuses = {
  conflict: 409,
  validation: 422,
  storage: 503,
  missing: 404,
} as const;
async function respond(action: () => Promise<Response>): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof BookingError)
      return errorResponse(error.message, statuses[error.code]);
    if (error instanceof SyntaxError)
      return errorResponse("The request body must be valid JSON.", 400);
    return errorResponse(
      "Browser storage is unavailable. Check storage access and try again.",
      503,
    );
  }
}
function readDraft(value: unknown): BookingDraft {
  if (!value || typeof value !== "object")
    throw new BookingError("Provide a valid reservation.", "validation");
  const draft = value as BookingDraft;
  if (
    typeof draft.date !== "string" ||
    typeof draft.roomId !== "string" ||
    typeof draft.start !== "string" ||
    typeof draft.end !== "string" ||
    (draft.title !== undefined && typeof draft.title !== "string")
  )
    throw new BookingError(
      "Provide a room, date, start time, and end time.",
      "validation",
    );
  return {
    date: draft.date,
    roomId: draft.roomId,
    start: draft.start,
    end: draft.end,
    title: draft.title,
  };
}
export function createBookingHandlers({
  repository,
  clock = () => new Date(),
  latency = 150,
}: Options) {
  const scenario = createConflictScenario();
  return [
    http.get("*/api/bookings", ({ request }) =>
      respond(async () => {
        await delay(latency);
        const date = new URL(request.url).searchParams.get("date");
        if (date && !validDate(date))
          return errorResponse("Choose a valid date.", 400);
        const bookings = await repository().load();
        return HttpResponse.json(
          date ? bookings.filter((booking) => booking.date === date) : bookings,
        );
      }),
    ),
    http.post("*/api/bookings", ({ request }) =>
      respond(async () => {
        const draft = readDraft(await request.json());
        await delay(latency);
        const store = repository();
        const bookings = await store.load();
        const error = validateBooking(draft, bookings, clock());
        if (error)
          return errorResponse(
            error,
            bookings.some((booking) => overlaps(draft, booking)) ? 409 : 422,
          );
        if (scenario.consume()) {
          await store.save({
            ...draft,
            title: "Simulated competing reservation",
          });
          return errorResponse(
            "Another reservation just took this room and time. Choose a different time or room.",
            409,
          );
        }
        return HttpResponse.json(await store.save(draft), { status: 201 });
      }),
    ),
    http.patch("*/api/bookings/:id", ({ request, params }) =>
      respond(async () => {
        const patch: unknown = await request.json();
        if (!patch || typeof patch !== "object" || Array.isArray(patch))
          return errorResponse("Provide a valid reservation update.", 400);
        await delay(latency);
        const store = repository();
        const existing = (await store.load()).find(
          (booking) => booking.id === params.id,
        );
        if (!existing)
          return errorResponse(
            "This reservation no longer exists. Your input is preserved.",
            404,
          );
        return HttpResponse.json(
          await store.save(readDraft({ ...existing, ...patch }), existing.id),
        );
      }),
    ),
    http.delete("*/api/bookings/:id", ({ params }) =>
      respond(async () => {
        await delay(latency);
        await repository().remove(String(params.id));
        return new HttpResponse(null, { status: 204 });
      }),
    ),
    http.get("*/api/demo/conflict", () =>
      HttpResponse.json({ armed: scenario.get() }),
    ),
    http.put("*/api/demo/conflict", ({ request }) =>
      respond(async () => {
        const body: unknown = await request.json();
        if (
          !body ||
          typeof body !== "object" ||
          !("armed" in body) ||
          typeof body.armed !== "boolean"
        )
          return errorResponse("Provide an on/off conflict setting.", 400);
        scenario.set(body.armed);
        return HttpResponse.json({ armed: scenario.get() });
      }),
    ),
  ];
}
