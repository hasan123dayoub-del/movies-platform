// Thrown by services when a request can't be served, e.g. 404 or 409.
// The error handler turns it into a JSON response with that status (like abort(404) in Laravel).
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
