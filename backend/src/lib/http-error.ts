// Thrown by services when a request can't be served, e.g. 404 or 409.
// The error handler turns it into a JSON response with that status (like abort(404) in Laravel).
// `errors` (optional) points the message at a field, like a validation error,
// e.g. "Current password is incorrect" under the current password box.
export type FieldError = { field: string; message: string };

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: FieldError[],
  ) {
    super(message);
  }
}
