// The shared pieces every API file uses: the base URL and the fetch helpers.
// Like a base HTTP client class in Laravel (Http::baseUrl(...)).
import type { FieldErrors, SaveResult } from "../types";

const API_URL = process.env.API_URL;

// GET a list or an item; any failure goes to error.tsx
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

// POST or PUT a body. A 400 from the API becomes field errors the form can show;
// any other failure is a real error and goes to error.tsx
export async function sendJson<T>(
  method: "POST" | "PUT",
  path: string,
  data: unknown,
  failMessage: string,
): Promise<SaveResult<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 400) {
    const body: { errors?: { field: string; message: string }[] } =
      await res.json();
    const errors: FieldErrors = {};
    for (const error of body.errors ?? []) {
      // Keep the first message for each field
      errors[error.field] ??= error.message;
    }
    return { ok: false, errors };
  }
  if (!res.ok) {
    throw new Error(failMessage);
  }
  return { ok: true, data: await res.json() };
}

export async function sendDelete(path: string, failMessage: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(failMessage);
  }
}
