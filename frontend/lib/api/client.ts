// The shared pieces every API file uses: the base URL and the fetch helpers.
// Like a base HTTP client class in Laravel (Http::baseUrl(...)).
import "server-only";
import type { FieldErrors, SaveResult } from "../types";
import { getSessionToken } from "../session";

const API_URL = process.env.API_URL;

// Fail loudly at startup instead of fetching "undefined/movies" later
if (!API_URL) {
  throw new Error("API_URL is missing: add it to frontend/.env.local (see .env.example)");
}

// The logged-in user's token goes with every write, so the API knows who is asking
async function authHeader(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET a list or an item; any failure goes to error.tsx.
// No cookies here: these are public reads, so the results can be cached.
export async function getJson<T>(path: string, failMessage: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(failMessage);
  }
  return res.json();
}

// GET one item; null when it doesn't exist, so the page can show a 404
export async function getJsonOrNull<T>(
  path: string,
  failMessage: string,
): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(failMessage);
  }
  return res.json();
}

// The API's answers that a form should show instead of crashing the page:
// not logged in (401), not allowed (403), already exists (409), too many tries (429)
const FORM_ERROR_STATUSES = new Set([401, 403, 409, 429]);

// POST or PUT a body. Validation errors (400) go under each field; the statuses above
// go under the "form" key; any other failure is a real error and goes to error.tsx
export async function sendJson<T>(
  method: "POST" | "PUT",
  path: string,
  data: unknown,
  failMessage: string,
  // Login and register send no token: there is no user yet
  { auth = true }: { auth?: boolean } = {},
): Promise<SaveResult<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(auth ? await authHeader() : {}) },
    body: JSON.stringify(data),
  });

  if (res.status === 400) {
    const body: { message?: string; errors?: { field: string; message: string }[] } =
      await res.json();
    const errors: FieldErrors = {};
    for (const error of body.errors ?? []) {
      // Keep the first message for each field; a rule on the whole body has no field
      errors[error.field || "form"] ??= error.message;
    }
    if (Object.keys(errors).length === 0) {
      errors.form = body.message ?? failMessage;
    }
    return { ok: false, errors };
  }
  if (FORM_ERROR_STATUSES.has(res.status)) {
    const body: { message?: string } = await res.json();
    return { ok: false, errors: { form: body.message ?? failMessage } };
  }
  if (!res.ok) {
    throw new Error(failMessage);
  }
  return { ok: true, data: await res.json() };
}

// A 404 counts as success: the thing is gone, which is what was asked
// (a double click, a second tab, or another admin deleted it first)
export async function sendDelete(path: string, failMessage: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(failMessage);
  }
}

// GET with the user's token: never cached, the answer is about this one visitor
export async function getJsonWithAuth<T>(path: string, token: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to load your account");
  }
  return res.json();
}
