export class BookingApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
export async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
  } catch {
    throw new BookingApiError(
      "Could not reach the booking API. Check your connection and retry. Your input is preserved.",
      0,
    );
  }
  if (response.status === 204) return undefined as T;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new BookingApiError(
      "The booking API returned an unreadable response. Please retry.",
      response.status,
    );
  }
  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "The booking request failed. Please retry.";
    throw new BookingApiError(message, response.status);
  }
  return body as T;
}
export const jsonBody = (value: unknown) => JSON.stringify(value);
